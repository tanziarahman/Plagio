import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HistoryPage from './pages/HistoryPage';
import PlagioDashboard from './pages/PlagioDashboard';
import ResultsPage from './pages/ResultsPage';
import FileComparisonPage from './pages/FileComparisonPage'; // Add this import

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HistoryPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/plagio-dashboard" element={<PlagioDashboard />} />
        <Route path="/plagio-dashboard/text" element={<PlagioDashboard defaultScanType="text" />} />
        <Route path="/plagio-dashboard/code" element={<PlagioDashboard defaultScanType="code" />} />
        <Route path="/plagio-dashboard/ai" element={<PlagioDashboard defaultScanType="ai" />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/file-comparison" element={<FileComparisonPage />} /> {/* Add this route */}
        <Route path="*" element={<HistoryPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


/*
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HistoryPage from './pages/HistoryPage';
import PlagioDashboard from './pages/PlagioDashboard';
import ResultsPage from './pages/ResultsPage'; // Add this import

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HistoryPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/plagio-dashboard" element={<PlagioDashboard />} />
        <Route path="/plagio-dashboard/text" element={<PlagioDashboard defaultScanType="text" />} />
        <Route path="/plagio-dashboard/code" element={<PlagioDashboard defaultScanType="code" />} />
        <Route path="/plagio-dashboard/ai" element={<PlagioDashboard defaultScanType="ai" />} />
        <Route path="/results" element={<ResultsPage />} /> {/* Add this route }
        <Route path="*" element={<HistoryPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
*/



/*import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HistoryPage from './pages/HistoryPage';
//import Operations from './pages/Operations';
import PlagioDashboard from './pages/PlagioDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HistoryPage />}/>
        <Route path="/PlagioDashboard/text" element={<PlagioDashboard scanType="Text" />} />
        <Route path="/PlagioDashboard/code" element={<PlagioDashboard scanType="Code" />} />
        <Route path="/PlagioDashboard/ai" element={<PlagioDashboard scanType="AI" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;*/

// <Route path="/operations" element={<Operations />} />