import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';

const AISummary = ({ patient }) => {
  if (!patient) return null;

  
  const formatInsights = (text) => {
    return text.split('\n').map((line, index) => (
      <Typography key={index} variant="body2" style={{ marginBottom: '8px' }}>
        {line}
      </Typography>
    ));
  };

  return (
    <Paper elevation={3} style={{ padding: '16px', marginTop: '20px', backgroundColor: '#e3f2fd' }}>
      <Box display="flex" alignItems="center" mb={2}>
        <SmartToyIcon color="primary" style={{ marginRight: '10px' }} />
        <Typography variant="h6" color="primary">AI Synopsis</Typography>
      </Box>
      <Typography variant="body1" paragraph>
        <strong>Summary:</strong> {patient.ai_summary}
      </Typography>
      <Typography variant="body1">
        <strong>Key Insights:</strong>
      </Typography>
      <Box mt={1}>
        {formatInsights(patient.ai_insights)}
      </Box>
    </Paper>
  );
};

export default AISummary;