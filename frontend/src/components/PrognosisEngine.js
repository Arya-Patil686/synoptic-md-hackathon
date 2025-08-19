import React from 'react';
import { Box, Button, Paper, Typography, CircularProgress, Alert } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const PrognosisEngine = ({ onRun, report, isLoading, error }) => {
  return (
    <Paper elevation={3} sx={{ p: 2, mt: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        AI Prognostic Engine
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Click the button or say "Hey Synoptic, run prognosis" to predict future health risks.
      </Typography>
      <Button
        variant="contained"
        onClick={onRun}
        disabled={isLoading}
        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
      >
        {isLoading ? 'Analyzing Future Risks...' : 'Run AI Prognosis'}
      </Button>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {report && (
        <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1, whiteSpace: 'pre-wrap' }}>
          <Typography variant="body1">{report}</Typography>
        </Box>
      )}
    </Paper>
  );
};

export default PrognosisEngine;