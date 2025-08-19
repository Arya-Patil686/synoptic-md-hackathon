import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { Container, Box, TextField, Button, Typography, Paper, Alert } from '@mui/material';

const RegisterPage = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      const response = await axios.post('http://127.0.0.1:5001/api/register', {
        username: username,
        email: email,
        password: password
      });

      console.log('Registration successful:', response.data);
      setSuccessMessage('Registration successful! Redirecting to login...');

      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      console.error('Registration error:', err.response.data);
      setError(err.response.data.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={6} sx={{ marginTop: 8, padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Create Doctor Account
        </Typography>
        <Box component="form" onSubmit={handleRegister} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Full Name"
            name="username"
            autoComplete="name"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {/* Show a success or error message */}
          {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}
          {successMessage && <Alert severity="success" sx={{ width: '100%', mt: 2 }}>{successMessage}</Alert>}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign Up
          </Button>
          <Box textAlign="center">
            <Link to="/login" variant="body2">
              {"Already have an account? Sign In"}
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterPage;