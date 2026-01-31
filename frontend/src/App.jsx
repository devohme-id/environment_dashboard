import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy Load Pages & Layouts
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const PublicWrapper = lazy(() => import('./components/PublicWrapper'));

const LoginPage = lazy(() => import('./pages/LoginPage'));
const TemperaturePage = lazy(() => import('./pages/TemperaturePage'));
const GroundingPage = lazy(() => import('./pages/GroundingPage'));

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminSmtPage = lazy(() => import('./pages/admin/AdminSmtPage'));
const AdminAktPage = lazy(() => import('./pages/admin/AdminAktPage'));
const AdminFctPage = lazy(() => import('./pages/admin/AdminFctPage'));
const AdminGrdPage = lazy(() => import('./pages/admin/AdminGrdPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'));

// Loading Fallback
const LoadingScreen = () => (
  <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-500">
    Loading...
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Admin Routes (No AlarmContext needed) */}
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

          {/* Public Monitoring Routes (Wrapped in AlarmProvider via PublicWrapper) */}
          <Route element={<PublicWrapper />}>
            <Route path="/" element={<Navigate to="/monitor-smt" replace />} />
            <Route path="/monitor-smt" element={<TemperaturePage pageId={1} />} />
            <Route path="/monitor-area" element={<TemperaturePage pageId={2} />} />
            <Route path="/monitor-facility" element={<TemperaturePage pageId={3} />} />
            <Route path="/monitor-grounding" element={<GroundingPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
