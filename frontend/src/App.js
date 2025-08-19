import React from 'react';
import { Routes, Route } from 'react-router-dom'; // Notice: BrowserRouter is NOT imported here

import MainLayout from './layouts/MainLayout';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PatientListPage from './pages/PatientListPage';

import { CssBaseline } from '@mui/material';

function App() {
  return (
    <>
      <CssBaseline />
      <Routes>
        {/* Routes WITHOUT the sidebar layout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<LoginPage />} />

        {/* Routes WITH the sidebar layout */}
        <Route element={<MainLayout />}>
          <Route path="/patients" element={<PatientListPage />} />
          <Route path="/dashboard/:patientId" element={<DashboardPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;