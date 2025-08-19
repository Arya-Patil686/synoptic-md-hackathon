import React, { useRef, useEffect } from 'react';
import { Tabs, Tab, Box, Typography, TextField, Button, Paper, CircularProgress, IconButton, Alert } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SaveIcon from '@mui/icons-material/Save';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const InteractiveWorkspace = (props) => {
  const {
    tabValue, handleTabChange,
    rawNotes, setRawNotes,
    formattedNote, isFormatting, handleFormatNotes,
    isSaving, handleSaveNote, saveSuccess,
    chatHistory, chatInput, setChatInput, isChatting, handleSendMessage,
  } = props;

  const chatEndRef = useRef(null);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory]);

  return (
    <Box sx={{ width: '100%', mt: '20px' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="Interactive workspace tabs">
          <Tab label="AI Note Streamliner" />
          <Tab label="AI Chat Co-Pilot" />
        </Tabs>
      </Box>
      <TabPanel value={tabValue} index={0}>
        <Typography variant="h6" gutterBottom>Add New Clinical Note</Typography>
        <TextField fullWidth multiline rows={6} variant="outlined" placeholder='Or say "Hey Synoptic, new note..."' value={rawNotes} onChange={(e) => setRawNotes(e.target.value)} />
        <Button variant="contained" onClick={handleFormatNotes} disabled={!rawNotes || isFormatting} sx={{ mt: 2 }} >
          {isFormatting ? <CircularProgress size={24} /> : 'Format with AI'}
        </Button>
        {formattedNote && (
          <Paper elevation={2} sx={{ p: 2, mt: 3, whiteSpace: 'pre-wrap', backgroundColor: '#f5f5f5', maxHeight: '300px', overflowY: 'auto' }}>
            <Typography variant="h6" gutterBottom>Formatted SOAP Note</Typography>
            <Typography variant="body1">{formattedNote}</Typography>
          </Paper>
        )}
        {formattedNote && !saveSuccess &&(
          <Button variant="contained" color="success" onClick={handleSaveNote} disabled={isSaving} startIcon={<SaveIcon />} sx={{ mt: 2 }}>
            {isSaving ? <CircularProgress size={24} /> : 'Save to Patient File'}
          </Button>
        )}
        {saveSuccess && <Alert severity="success" sx={{ mt: 2 }}>{saveSuccess}</Alert>}
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2, p: 1 }}>
            {chatHistory.map((message, index) => (
              <Box key={index} sx={{ mb: 1.5, display: 'flex', justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <Paper elevation={2} sx={{ p: 1.5, maxWidth: '80%', bgcolor: message.role === 'user' ? 'primary.main' : 'grey.200', color: message.role === 'user' ? 'white' : 'black' }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{message.content}</Typography>
                </Paper>
              </Box>
            ))}
            {isChatting && <CircularProgress size={24} sx={{ alignSelf: 'center' }} />}
            <div ref={chatEndRef} />
          </Box>
          <Box sx={{ display: 'flex' }}>
            <TextField fullWidth variant="outlined" placeholder='Say "Hey Synoptic, ask..."' value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} />
            <IconButton color="primary" onClick={() => handleSendMessage()} disabled={isChatting}><SendIcon /></IconButton>
          </Box>
        </Box>
      </TabPanel>
    </Box>
  );
};

export default InteractiveWorkspace;