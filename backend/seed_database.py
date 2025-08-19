from tinydb import TinyDB
import json
from werkzeug.security import generate_password_hash

print("--- Starting Master Database Seeding ---")

db = TinyDB('db.json')
patients_table = db.table('patients')
users_table = db.table('users')

print("Clearing all existing data...")
patients_table.truncate() # Deletes all patients
users_table.truncate()   # Deletes all users
print("Database cleared.")

print("Creating test user...")
test_password_hash = generate_password_hash("password123")
# insert() returns the document's ID
test_user_id = users_table.insert({
    "username": "Test Doctor",
    "email": "doctor@test.com",
    "password": test_password_hash
})
print(f"✅ Test user created with ID: {test_user_id}")


try:
    with open('patient_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        patients_to_insert = data['patients']
    print(f"Loaded {len(patients_to_insert)} patients from patient_data.json.")

    # Add the correct doctorId to each patient
    for patient in patients_to_insert:
        patient['doctorId'] = str(test_user_id) # Make sure it's a string

    # Insert the updated patient data
    patients_table.insert_multiple(patients_to_insert)
    print(f"✅ SUCCESS: Inserted {len(patients_to_insert)} patients and linked them to doctor ID {test_user_id}.")

except Exception as e:
    print(f"An error occurred: {e}")

print("--- Seeding Complete ---")