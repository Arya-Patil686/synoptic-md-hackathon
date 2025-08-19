import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import EventIcon from '@mui/icons-material/Event';

const HealthTimeline = ({ patient }) => {
  if (!patient || !patient.medical_history) return null;

  const getIconForEvent = (eventText) => {
    const lowerCaseText = eventText.toLowerCase();
    if (lowerCaseText.includes('surgery') || lowerCaseText.includes('graft')) {
      return <VaccinesIcon sx={{ fontSize: 32, color: 'white', backgroundColor: 'primary.main', borderRadius: '50%', p: 0.5 }} />;
    }
    if (lowerCaseText.includes('diagnosed')) {
      return <MedicalInformationIcon sx={{ fontSize: 32, color: 'white', backgroundColor: 'primary.main', borderRadius: '50%', p: 0.5 }} />;
    }
    return <EventIcon sx={{ fontSize: 32, color: 'white', backgroundColor: 'primary.main', borderRadius: '50%', p: 0.5 }} />;
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom style={{ marginTop: '20px' }}>
        Patient History
      </Typography>
      {patient.medical_history.map((event, index) => (
        <Box key={index} sx={{ display: 'flex', position: 'relative', pb: 3 }}>

          {/* This is the vertical line. We use position:absolute for precise control */}
          {index !== patient.medical_history.length - 1 && (
            <Box sx={{ 
              position: 'absolute', 
              top: '48px', 
              left: '19px', 
              width: '2px', 
              height: 'calc(100% - 48px)', 
              bgcolor: 'primary.main' 
            }} />
          )}

          {/* Icon Container. zIndex keeps it on top of the line. */}
          <Box sx={{ mr: 2, position: 'relative', zIndex: 1, bgcolor: 'background.paper', pt: 1 }}>
            {getIconForEvent(event.event)}
          </Box>

          {/* The Event Details Card */}
          <Paper elevation={2} sx={{ p: 2, flexGrow: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {event.date}
            </Typography>
            <Typography variant="h6" component="h3">
              {event.event}
            </Typography>
          </Paper>
        </Box>
      ))}
    </Box>
  );
};

export default HealthTimeline;