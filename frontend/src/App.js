import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HistoryPage from './pages/HistoryPage';
import Operations from './pages/Operations';
import PlagioDashboard from './pages/PlagioDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HistoryPage />}/>
        <Route path="/operations" element={<Operations />} />
        <Route path="/dashboard/text" element={<PlagioDashboard scanType="Text" />} />
        <Route path="/dashboard/code" element={<PlagioDashboard scanType="Code" />} />
        <Route path="/dashboard/ai" element={<PlagioDashboard scanType="AI" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;