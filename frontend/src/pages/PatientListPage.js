import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Container, Typography, Paper, List, ListItem, ListItemButton, ListItemText, CircularProgress, Alert, Chip } from '@mui/material'; // 'Box' is removed

const getRiskChip = (riskScore) => {
  let color = 'default';
  if (riskScore === 'High') {
    color = 'error';
  } else if (riskScore === 'Moderate') {
    color = 'warning';
  } else if (riskScore === 'Low') {
    color = 'success';
  }
  return <Chip label={riskScore || 'Unknown'} color={color} size="small" />;
};

const PatientListPage = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    if (!loggedInUser) {
      navigate('/login');
      return;
    }
    setUser(loggedInUser);

    api.get(`/api/patients/${loggedInUser.id}`)
      .then(response => {
        setPatients(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching patients:", err);
        setError("Could not fetch patient list.");
        setLoading(false);
      });
  }, [navigate]);

  const handlePatientClick = (patientId) => {
    navigate(`/dashboard/${patientId}`);
  };

  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 5 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>AI is analyzing patient risks...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={4} sx={{ mt: 4, p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, Dr. {user?.username}
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Your Patient Command Center
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <List>
          {patients.map(patient => (
            <ListItem key={patient.id} disablePadding secondaryAction={getRiskChip(patient.riskScore)}>
              <ListItemButton onClick={() => handlePatientClick(patient.id)}>
                <ListItemText 
                  primary={patient.demographics.name} 
                  secondary={`Age: ${patient.demographics.age} | Gender: ${patient.demographics.gender}`} 
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
};

export default PatientListPage;