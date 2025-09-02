import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Register from './pages/Register';
import Login from './pages/Login';
import PlagioDashboard from './pages/PlagioDashboard';
import ResultsPage from './pages/ResultsPage';
import HistoryPage from './pages/HistoryPage';
import FileComparisonPage from './pages/FileComparisonPage';
import AiPage from './pages/AiPage';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/plagio-dashboard" element={<PlagioDashboard />} />
        <Route 
          path="/plagio-dashboard/text" 
          element={<PlagioDashboard defaultScanType="text" />} 
        />
        <Route 
          path="/plagio-dashboard/code" 
          element={<PlagioDashboard defaultScanType="code" />} 
        />
        <Route 
          path="/plagio-dashboard/ai" 
          element={<PlagioDashboard defaultScanType="ai" />} 
        />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/file-comparison" element={<FileComparisonPage />} />
        <Route path="/ai-analysis" element={<AiPage/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;