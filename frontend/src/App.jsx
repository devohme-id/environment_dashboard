import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TemperaturePage from './pages/TemperaturePage';
import GroundingPage from './pages/GroundingPage';

import Layout from './components/Layout';

import { AlarmProvider } from './context/AlarmContext';

function App() {
  return (
    <AlarmProvider>
      <BrowserRouter>
        <Routes>
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
