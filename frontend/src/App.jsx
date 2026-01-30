import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TemperaturePage from './pages/TemperaturePage';
import GroundingPage from './pages/GroundingPage';

import Layout from './components/Layout';

import { AlarmProvider } from './context/AlarmContext';

import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminSmtPage from './pages/admin/AdminSmtPage';
import AdminAktPage from './pages/admin/AdminAktPage';
import AdminFctPage from './pages/admin/AdminFctPage';
import AdminGrdPage from './pages/admin/AdminGrdPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

function App() {
  return (
    <AlarmProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="settings" replace />} />
              <Route path="smt" element={<AdminSmtPage />} />
              <Route path="akt" element={<AdminAktPage />} />
              <Route path="fct" element={<AdminFctPage />} />
              <Route path="grd" element={<AdminGrdPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>
          </Route>

          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/monitor-smt" replace />} />
            <Route path="/monitor-smt" element={<TemperaturePage pageId={1} />} />
            <Route path="/monitor-area" element={<TemperaturePage pageId={2} />} />
            <Route path="/monitor-facility" element={<TemperaturePage pageId={3} />} />
            <Route path="/monitor-grounding" element={<GroundingPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AlarmProvider>
  );
}

export default App;
