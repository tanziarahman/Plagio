import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HistoryPage from './pages/HistoryPage';
import PlagioDashboard from './pages/PlagioDashboard';
import ResultsPage from './pages/ResultsPage';
import FileComparisonPage from './pages/FileComparisonPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/plagio-dashboard" element={<PlagioDashboard />} />
        <Route path="/plagio-dashboard/text" element={<PlagioDashboard defaultScanType="text" />} />
        <Route path="/plagio-dashboard/code" element={<PlagioDashboard defaultScanType="code" />} />
        <Route path="/plagio-dashboard/ai" element={<PlagioDashboard defaultScanType="ai" />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/file-comparison" element={<FileComparisonPage />} />
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;