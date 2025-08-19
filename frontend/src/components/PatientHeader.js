import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const PatientHeader = ({ patient }) => {
  if (!patient) {
    return null; 
  }

  return (
    <Paper elevation={3} style={{ padding: '16px', marginBottom: '20px' }}>
      {/* We are now using the data from the props. */}
      <Typography variant="h4">
        Patient: {patient.demographics.name}
      </Typography>
      <Box display="flex" gap={4} mt={1}>
        <Typography variant="body1">ID: {patient.id}</Typography>
        <Typography variant="body1">Age: {patient.demographics.age}</Typography>
        <Typography variant="body1">Gender: {patient.demographics.gender}</Typography>
      </Box>
    </Paper>
  );
};

export default PatientHeader;