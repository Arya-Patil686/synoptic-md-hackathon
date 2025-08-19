import React from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ScienceIcon from '@mui/icons-material/Science'; 

const CarePlan = ({ patient }) => {
  if (!patient || !patient.care_plan) return null;

  return (
    <Card elevation={3} style={{ marginTop: '20px' }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Care Plan & Next Steps
        </Typography>
        <Divider />
        <Typography variant="h6" style={{ marginTop: '16px' }}>
          Upcoming Appointments
        </Typography>
        <List>
          {patient.care_plan.upcoming_appointments.map((appt, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                <EventAvailableIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary={appt} />
            </ListItem>
          ))}
        </List>
        <Typography variant="h6" style={{ marginTop: '16px' }}>
          Pending Tests
        </Typography>
        <List>
          {patient.care_plan.pending_tests.map((test, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                <ScienceIcon color="secondary" />
              </ListItemIcon>
              <ListItemText primary={test} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default CarePlan;