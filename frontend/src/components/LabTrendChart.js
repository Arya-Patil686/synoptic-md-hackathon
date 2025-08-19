import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Paper, Typography, Box } from '@mui/material';

const LabTrendChart = ({ patientData }) => {
  if (!patientData?.lab_results || patientData.lab_results.length === 0) {
    return null; 
  }

  const firstLabResult = patientData.lab_results[0];
  const labKeys = Object.keys(firstLabResult).filter(key => key !== 'date');

  const lineColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];

  return (
    <Paper elevation={3} sx={{ p: 2, mt: 3, mb: 3 }}>
      <Box mb={2}>
        <Typography variant="h6">Key Lab Trends</Typography>
      </Box>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={patientData.lab_results}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />

          {/* 3. NEW: Map over the discovered lab keys and create a Line for each one! */}
          {labKeys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key} 
              stroke={lineColors[index % lineColors.length]} 
              name={key.charAt(0).toUpperCase() + key.slice(1)} 
              activeDot={{ r: 8 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default LabTrendChart;