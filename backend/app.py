from flask import Flask, jsonify, request
from flask_cors import CORS
from tinydb import TinyDB, Query
from werkzeug.security import generate_password_hash, check_password_hash
import json
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

# --- AI MODEL SETUP ---
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("GEMINI_API_KEY not found in .env file. Please set it.")
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-1.5-pro-latest')
print("✅ AI Model configured successfully.")

# --- LOCAL DATABASE SETUP with TinyDB ---
db = TinyDB('db.json')
users_table = db.table('users')
patients_table = db.table('patients')
print("✅ Local TinyDB database initialized.")

app = Flask(__name__)
CORS(app)

# --- AUTHENTICATION ENDPOINTS ---
@app.route('/api/logout', methods=['POST'])
def logout():
    # In a real app with server-side sessions, you would clear the session here.
    # For our token-based/localStorage approach, this is mainly for good practice.
    return jsonify({"message": "Logout successful"}), 200

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username, email, password = data.get('username'), data.get('email'), data.get('password')
    User = Query()
    if users_table.search(User.email == email):
        return jsonify({"error": "Email already exists"}), 409
    hashed_password = generate_password_hash(password)
    users_table.insert({"username": username, "email": email, "password": hashed_password})
    return jsonify({"message": "User registered successfully"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email, password = data.get('email'), data.get('password')
    User = Query()
    user = users_table.get(User.email == email)
    if not user or not check_password_hash(user['password'], password):
        return jsonify({"error": "Invalid email or password"}), 401
    return jsonify({
        "message": "Login successful", 
        "user": {"id": str(user.doc_id), "username": user['username'], "email": user['email']}
    }), 200

# --- CORE FEATURE ENDPOINTS---

@app.route('/api/patient/<patient_id>/notes', methods=['POST'])
def add_medical_note(patient_id):
    # Get the new note content and date from the frontend's request
    data = request.json
    note_content = data.get('note_content')
    note_date = data.get('note_date')

    if not note_content or not note_date:
        return jsonify({"error": "Missing note content or date"}), 400

    Patient = Query()
    patient = patients_table.get(Patient.id == patient_id)

    if not patient:
        return jsonify({"error": "Patient not found"}), 404

    # Create a new note object in the correct format for our timeline
    new_note = {"date": note_date, "event": note_content}

    # Get the existing history and append the new note
    updated_history = patient['medical_history'] + [new_note]

    # Update the patient's document in the database with the new, longer history
    patients_table.update({'medical_history': updated_history}, Patient.id == patient_id)

    print(f"Successfully added new note for patient {patient_id}")
    # Return the newly updated history so the frontend can update instantly
    return jsonify({"message": "Note added successfully", "new_history": updated_history}), 200

@app.route('/api/patients/<doctor_id>', methods=['GET'])
def get_patients_for_doctor(doctor_id):
    print(f"Fetching patients for doctor ID: {doctor_id}")
    Patient = Query()
    patients_list = patients_table.search(Patient.doctorId == doctor_id)

    enriched_patients = []
    for patient in patients_list:
        try:
            # --- NEW, MORE INTELLIGENT PROMPT ---
            risk_prompt = f"""
            You are an expert clinical risk assessment AI. Your task is to analyze the provided patient data and classify their CURRENT risk level.
            Your analysis MUST focus on the MOST RECENT lab results and significant medical history.

            You MUST respond with ONLY ONE of the following single words: "High", "Moderate", or "Low".

            CRITERIA (Use these rules):
            - Return "High" if the MOST RECENT potassium is > 5.5, OR creatinine is > 1.3, OR hba1c is > 8.0.
            - Return "High" if there is a major surgery within the last year.
            - Return "Low" if all recent labs are within normal ranges and conditions are stable.
            - Return "Moderate" for all other cases (e.g., stable chronic conditions with slightly elevated but not critical labs).

            PATIENT DATA:
            {json.dumps(patient)}
            """

            print(f"  > Analyzing risk for patient {patient['id']}...")
            response = model.generate_content(risk_prompt)

            risk_score = response.text.strip().replace('"', '').split('\n')[0] # More robust cleaning
            patient['riskScore'] = risk_score
            print(f"  > Risk for {patient['id']} is: {risk_score}")

        except Exception as e:
            print(f"  > AI Risk analysis failed for patient {patient['id']}: {e}")
            patient['riskScore'] = "Unknown"

        enriched_patients.append(patient)

    print(f"Found and analyzed {len(enriched_patients)} patients.")
    return jsonify(enriched_patients)

@app.route('/api/patient/<patient_id>', methods=['GET'])
def get_patient(patient_id):
    Patient = Query()
    patient = patients_table.get(Patient.id == patient_id)
    if not patient:
        return jsonify({"error": "Patient not found"}), 404

    try:
        combined_prompt = f"""
        You are a helpful medical AI assistant. Analyze the following patient data.
        Provide two things in your response:
        1. A 'summary' which is a 2-3 sentence overview for a busy doctor.
        2. A list of 'insights' which are 2-3 critical alerts or suggestions as bullet points.
        Provide the output STRICTLY in the following JSON format:
        {{
          "summary": "Your summary here.",
          "insights": "Your bulleted insights here."
        }}
        Patient Data: {json.dumps(patient)}
        """
        response = model.generate_content(combined_prompt)
        ai_response_text = response.text.replace('```json', '').replace('```', '').strip()
        ai_data = json.loads(ai_response_text)

        # THIS IS THE CRITICAL FIX: We are now adding the AI data to the patient object
        patient['ai_summary'] = ai_data.get('summary')
        patient['ai_insights'] = ai_data.get('insights')

        return jsonify(patient)
    except Exception as e:
        print(f"An error occurred with the AI API: {e}")
        return jsonify({"error": "Failed to get AI analysis for patient."}), 500

@app.route('/api/patient/<patient_id>/careplan', methods=['POST'])
def add_to_careplan(patient_id):
    data = request.json
    item_type = data.get('type') # "prescription" or "test"
    item_description = data.get('description')

    if not item_type or not item_description:
        return jsonify({"error": "Missing type or description"}), 400

    Patient = Query()
    patient = patients_table.get(Patient.id == patient_id)
    if not patient:
        return jsonify({"error": "Patient not found"}), 404

    # Append to the correct list based on the type
    if item_type == 'prescription':
        patient['care_plan']['prescriptions'].append(item_description)
    elif item_type == 'test':
        patient['care_plan']['pending_tests'].append(item_description)
    else:
        return jsonify({"error": "Invalid item type"}), 400

    # Update the entire patient document in the database
    patients_table.update(patient, Patient.id == patient_id)

    # Return the full updated patient object so the frontend can refresh
    return jsonify(patient), 200

@app.route('/api/streamline_note', methods=['POST'])
def streamline_note():
    raw_notes = request.json.get('notes', '')
    if not raw_notes:
        return jsonify({"error": "No notes provided"}), 400
    try:
        prompt = f"""
        You are a highly skilled medical scribe. Your task is to convert a doctor's rough, informal notes into a formal, structured SOAP note.
        Here is an example:
        Rough Notes: "pt complains of chest pain for 2 days, feels like pressure. bp 150/90, hr 88. ecg shows nsr. plan to check troponin."
        SOAP Note Output:
        **Subjective:** The patient reports experiencing chest pain for the past two days, described as a pressure-like sensation.
        **Objective:** Blood pressure is 150/90 mmHg. Heart rate is 88 bpm. ECG shows Normal Sinus Rhythm.
        **Assessment:** Chest pain, etiology unclear. Need to rule out acute coronary syndrome.
        **Plan:**
        1. Check cardiac troponin levels.
        2. Monitor vital signs.
        3. Follow up based on lab results.

        Now, please convert the following rough notes into a formal SOAP note:
        Rough Notes: "{raw_notes}"
        SOAP Note Output:
        """
        response = model.generate_content(prompt)
        return jsonify({"formatted_note": response.text})
    except Exception as e:
        print(f"An error occurred with the AI API: {e}")
        return jsonify({"error": "Failed to format note."}), 500

@app.route('/api/patient/<patient_id>/prognosis', methods=['GET'])
def get_prognosis(patient_id):
    print(f"Running prognosis for patient ID: {patient_id}")
    Patient = Query()
    patient = patients_table.get(Patient.id == patient_id)

    if not patient:
        return jsonify({"error": "Patient not found"}), 404

    try:
        # --- THE PROGNOSTIC ENGINE PROMPT ---
        # This is a highly advanced prompt designed for predictive analysis.
        prognosis_prompt = f"""
        You are an advanced clinical prognostic AI. Your task is to analyze the complete medical record of a patient and identify the top 2-3 most likely future health risks over the next 6-12 months.

        For each identified risk, you MUST provide:
        1.  **Risk:** The name of the potential condition or event (e.g., "Progression of Chronic Kidney Disease").
        2.  **Probability:** A qualitative assessment of the likelihood ('Low', 'Moderate', 'High').
        3.  **Reasoning:** A brief, evidence-based explanation citing specific data from the patient's file (e.g., "Based on the consistent upward trend of creatinine from 1.2 to 1.4 and the patient's uncontrolled Type 2 Diabetes (HbA1c > 8.0).").
        4.  **Recommendation:** A suggested next step for the doctor (e.g., "Recommend consultation with a nephrologist and stricter glycemic control.").

        Format the output as a clean, readable text. Use markdown for headings like '### Risk 1:' and bullet points.

        PATIENT DATA:
        {json.dumps(patient, indent=2)}
        """

        response = model.generate_content(prognosis_prompt)
        report_text = response.text

        return jsonify({"prognosis_report": report_text})

    except Exception as e:
        print(f"An error occurred with the Prognosis AI API: {e}")
        return jsonify({"error": "Failed to generate prognosis report."}), 500
    

@app.route('/api/chat', methods=['POST'])
def chat_with_patient_data():
    question = request.json.get('question', '')
    patient_id = request.json.get('patientId', '')
    if not question or not patient_id:
        return jsonify({"error": "Missing fields"}), 400

    Patient = Query()
    patient = patients_table.get(Patient.id == patient_id)
    if not patient:
        return jsonify({"error": "Patient not found"}), 404

    try:
        prompt = f"""
        You are a helpful AI assistant for a doctor named Synoptic MD. Your task is to answer the doctor's question based ONLY on the provided patient data JSON. 
        Do not use any external knowledge. If the answer cannot be found in the provided data, you MUST respond with "That information is not available in the patient file."
        Be concise and professional.
        ---
        PATIENT DATA:
        {json.dumps(patient, indent=2)}
        ---
        DOCTOR'S QUESTION: "{question}"
        ---
        ANSWER:
        """
        response = model.generate_content(prompt)
        return jsonify({"answer": response.text})
    except Exception as e:
        print(f"An error occurred with the AI Chat API: {e}")
        return jsonify({"error": "Failed to get chat response."}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)