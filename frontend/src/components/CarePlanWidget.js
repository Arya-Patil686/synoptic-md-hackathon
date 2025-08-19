import React, { useState } from 'react';
import api from '../api';
import { Box, Button, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import MedicationIcon from '@mui/icons-material/Medication';
import ScienceIcon from '@mui/icons-material/Science';

const CarePlanWidget = ({ patient, onDataUpdate }) => {
  const [open, setOpen] = useState(false);
  const [itemType, setItemType] = useState('prescription');
  const [description, setDescription] = useState('');

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSave = () => {
    axios.post(`http://127.0.0.1:5001/api/patient/${patient.id}/careplan`, {
      type: itemType,
      description: description
    })
    .then(response => {
      
      onDataUpdate(response.data);
      handleClose(); 
      setDescription(''); 
    })
    .catch(console.error);
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mt: 3, mb: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Active Care Plan</Typography>
        <Button variant="outlined" startIcon={<AddCircleOutlineIcon />} onClick={handleOpen}>
          Add Order
        </Button>
      </Box>
      <Divider sx={{ my: 1 }} />
      <Typography variant="subtitle1" sx={{ mt: 2 }}>Prescriptions</Typography>
      <List dense>
        {patient.care_plan.prescriptions.map((item, index) => (
          <ListItem key={index}><ListItemIcon><MedicationIcon fontSize="small" /></ListItemIcon><ListItemText primary={item} /></ListItem>
        ))}
      </List>
      <Typography variant="subtitle1" sx={{ mt: 2 }}>Pending Tests</Typography>
      <List dense>
        {patient.care_plan.pending_tests.map((item, index) => (
          <ListItem key={index}><ListItemIcon><ScienceIcon fontSize="small" /></ListItemIcon><ListItemText primary={item} /></ListItem>
        ))}
      </List>

      {/* --- The Pop-up Modal Dialog --- */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Care Plan Order</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Order Type</InputLabel>
            <Select value={itemType} label="Order Type" onChange={(e) => setItemType(e.target.value)}>
              <MenuItem value="prescription">Prescription</MenuItem>
              <MenuItem value="test">Lab Test</MenuItem>
            </Select>
          </FormControl>
          <TextField
            autoFocus
            margin="dense"
            label="Description (e.g., Metformin 500mg BID)"
            type="text"
            fullWidth
            variant="standard"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save Order</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default CarePlanWidget;