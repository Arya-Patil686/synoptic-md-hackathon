import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import api from '../api';
import { Container, Box, TextField, Button, Typography, Paper, Alert } from '@mui/material';

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 

  const handleLogin = async (e) => {
    e.preventDefault(); 
    setError(''); 

    try {
      const response = await api.post('/api/login', {
        email: email,
        password: password
      });

      console.log('Login successful:', response.data);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/patients');

    } catch (err) {
      console.error('Login error:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={6} sx={{ marginTop: 8, padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Synoptic MD Login
        </Typography>
        {/* The form's onSubmit is linked to our handleLogin function */}
        <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
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
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
          />
          {/* This Alert only shows up if our 'error' memory box has something in it */}
          {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
          <Box textAlign="center">
            <Link to="/register" variant="body2">
              {"Don't have an account? Sign Up"}
            </Link>
            </Box>
          </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;