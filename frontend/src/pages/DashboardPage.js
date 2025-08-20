import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

import PatientHeader from '../components/PatientHeader';
import AISummary from '../components/AISummary';
import HealthTimeline from '../components/HealthTimeline';
import InteractiveWorkspace from '../components/InteractiveWorkspace';
import PrognosisEngine from '../components/PrognosisEngine';
import LabTrendChart from '../components/LabTrendChart';
import { Container, Grid, Box, CircularProgress, Typography, Alert, Fab } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import CarePlanWidget from '../components/CarePlanWidget';

const DashboardPage = () => {
    const { patientId } = useParams();

    const [patientData, setPatientData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [prognosisReport, setPrognosisReport] = useState('');
    const [isPrognosisLoading, setIsPrognosisLoading] = useState(false);
    const [prognosisError, setPrognosisError] = useState('');

    const [tabValue, setTabValue] = useState(0);
    const [rawNotes, setRawNotes] = useState('');
    const [formattedNote, setFormattedNote] = useState('');
    const [isFormatting, setIsFormatting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState('');
    const [chatHistory, setChatHistory] = useState([{ role: 'ai', content: 'How can I help you? Click the mic and say "start listening"' }]);
    const [chatInput, setChatInput] = useState('');
    const [isChatting, setIsChatting] = useState(false);


    const handleDataUpdate = (updatedPatientObject) => {
      setPatientData(updatedPatientObject);
    };


    const runPrognosis = () => {
        setIsPrognosisLoading(true); setPrognosisError(''); setPrognosisReport('');
        api.get(`\/api/patient/${patientId}/prognosis`)
          .then(res => setPrognosisReport(res.data.prognosis_report))
          .catch(() => setPrognosisError("Failed to generate prognosis."))
          .finally(() => setIsPrognosisLoading(false));
    };

    const formatNotes = () => {
        if(!rawNotes) return;
        setIsFormatting(true); setSaveSuccess('');
        api.post('/api/streamline_note', { notes: rawNotes })
          .then(res => setFormattedNote(res.data.formatted_note))
          .finally(() => setIsFormatting(false));
    };

    const saveNote = () => {
        if(!formattedNote) return;
        setIsSaving(true); setSaveSuccess('');
        const today = new Date().toISOString().split('T')[0];
        api.post(`\/api/patient/${patientId}/notes`, { note_content: formattedNote, note_date: today })
          .then(res => {
          // Now using our universal data updater!
            handleDataUpdate({ ...patientData, medical_history: res.data.new_history });
            setSaveSuccess('Note saved successfully!');
            setRawNotes(''); setFormattedNote('');
      })
          .finally(() => setIsSaving(false));
    };

    const sendMessage = (messageText = chatInput) => {
        if (!messageText.trim()) return;
        const userMessage = { role: 'user', content: messageText };
        setChatHistory(prev => [...prev, userMessage]);
        setChatInput(''); setIsChatting(true);
        api.post(`\/api/chat`, { question: messageText, patientId: patientId })
          .then(res => setChatHistory(prev => [...prev, { role: 'ai', content: res.data.answer }]))
          .catch(() => setChatHistory(prev => [...prev, { role: 'ai', content: 'Sorry, an error occurred.' }]))
          .finally(() => setIsChatting(false));
    };

    const commands = [
      { command: ['(hey) Synoptic open notes', 'open notes'], callback: () => setTabValue(0) },
      { command: ['(hey) Synoptic open chat', 'open chat'], callback: () => setTabValue(1) },
      { command: ['(hey) Synoptic run prognosis', 'run prognosis'], callback: runPrognosis },
      { command: ['(hey) Synoptic format note', 'format note'], callback: formatNotes },
      { command: ['(hey) Synoptic save note', 'save note'], callback: saveNote },
      { command: ['(hey) Synoptic ask *', 'ask *'], callback: (question) => { setTabValue(1); sendMessage(question); } },
      { command: ['(hey) Synoptic new note *', 'note *'], callback: (note) => { setTabValue(0); setRawNotes(prev => prev ? `${prev} ${note}`: note); } },
      { command: ['(hey) Synoptic clear note', 'clear note'], callback: () => setRawNotes('') },
      { command: ['(hey) Synoptic stop listening', 'stop listening'], callback: () => SpeechRecognition.stopListening() },
      { command: ['(hey) Synoptic start listening', 'start listening'], callback: () => SpeechRecognition.startListening({ continuous: true }) },
    ];

    const { listening, browserSupportsSpeechRecognition } = useSpeechRecognition({ commands });


    useEffect(() => {
        setLoading(true);
        api.get(`\/api/patient/${patientId}`)
          .then(res => { setPatientData(res.data); setLoading(false); })
          .catch(err => { setError(`Could not load data for patient ${patientId}.`); setLoading(false); });
    }, [patientId]);

    if (!browserSupportsSpeechRecognition) { return <Container sx={{mt:5}}><Alert severity="warning">Your browser does not support speech recognition. Please use Google Chrome.</Alert></Container>; }
    if (loading) { return <Container sx={{textAlign:'center', mt:5}}><CircularProgress /><Typography>Loading Dashboard...</Typography></Container> }
    if (error) { return <Container sx={{mt:5}}><Alert severity="error">{error}</Alert></Container> }

    return (
        <Box> 
            <PatientHeader patient={patientData} />
            <AISummary patient={patientData} />
            <PrognosisEngine onRun={runPrognosis} report={prognosisReport} isLoading={isPrognosisLoading} error={prognosisError} />
            <LabTrendChart patientData={patientData} />
            <Grid container spacing={3} style={{ marginTop: '1px' }}>
                <Grid item xs={12} md={7}>
                    <HealthTimeline patient={patientData} />
                </Grid>
                <Grid item xs={12} md={5}>
                  <CarePlanWidget patient={patientData} onDataUpdate={handleDataUpdate} />
                    <InteractiveWorkspace
                        patient={patientData}
                        tabValue={tabValue} handleTabChange={(e, val) => setTabValue(val)}
                        rawNotes={rawNotes} setRawNotes={setRawNotes}
                        formattedNote={formattedNote} isFormatting={isFormatting} handleFormatNotes={formatNotes}
                        isSaving={isSaving} handleSaveNote={saveNote} saveSuccess={saveSuccess}
                        chatHistory={chatHistory} chatInput={chatInput} setChatInput={setChatInput} isChatting={isChatting} handleSendMessage={sendMessage}
                    />
                </Grid>
            </Grid>

            {/* Floating Action Button for Microphone */}
            <Fab color={listening ? 'secondary' : 'primary'} sx={{ position: 'fixed', bottom: 32, right: 32 }} onClick={listening ? SpeechRecognition.stopListening : () => SpeechRecognition.startListening({ continuous: true })}>
                {listening ? <MicOffIcon /> : <MicIcon />}
            </Fab>
        </Box>
    );
};

export default DashboardPage;