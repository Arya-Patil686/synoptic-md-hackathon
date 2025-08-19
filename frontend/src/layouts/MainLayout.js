import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Box, Drawer, AppBar, Toolbar, List, Typography, Divider, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

const drawerWidth = 240;

const MainLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* --- The Header (AppBar) --- */}
      <AppBar
        position="fixed"
        sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            The AI-Powered Clinical Co-Pilot
          </Typography>
        </Toolbar>
      </AppBar>

      {/* --- The Sidebar (Drawer) --- */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        {/* This is the logo/title area at the top of the sidebar */}
        <Toolbar sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalHospitalIcon sx={{ fontSize: '2.5rem' }} />
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
            Synoptic MD
          </Typography>
        </Toolbar>
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={() => navigate('/patients')}>
              <ListItemIcon><PeopleIcon /></ListItemIcon>
              <ListItemText primary="Patient List" />
            </ListItemButton>
          </ListItem>
        </List>
        <Divider />
        <List>
           <ListItem disablePadding>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      {/* --- The Main Content Area --- */}
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: '#f7f9fc', p: 3 }}
      >
        {/* This Toolbar is a spacer to push your content below the top AppBar */}
        <Toolbar />

        {/* The Outlet is where your page (e.g., PatientListPage) will be rendered */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;