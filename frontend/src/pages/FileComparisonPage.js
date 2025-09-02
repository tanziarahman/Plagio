import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiFile, FiCode, FiArrowLeft } from 'react-icons/fi';
import axios from 'axios';

const FileComparisonPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [fileContents, setFileContents] = useState({});
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [comparedFileId, setComparedFileId] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);

  const { files, analysisName, scanType, selectedFile, uploadId, fileId } = location.state || {
    files: [],
    analysisName: 'Untitled Analysis',
    scanType: 'text',
    selectedFile: '',
    uploadId: null,
    fileId: null
  };

  const baseFileId = fileId || (files[0]?.id || files[0]?.file_id || null);
  const baseFileName = selectedFile || (files[0]?.name || files[0]?.original_name || '');

  // Fetch current user email
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('http://localhost:5000/me', { withCredentials: true });
        if (response.data?.email) setUserEmail(response.data.email);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        setUserEmail('user@example.com');
      }
    };
    fetchUser();
  }, []);

  // Fetch comparison data
  useEffect(() => {
    const fetchData = async () => {
      if (!uploadId || !baseFileId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Determine which endpoint to call based on scan type
        let endpoint = '';
        let params = { upload_id: uploadId };
        
        if (scanType === 'code') {
          endpoint = 'http://localhost:5000/code-comparison';
        } else {
          endpoint = 'http://localhost:5000/comparison';
          params.file_id = baseFileId;
        }

        // Fetch comparison data from the backend
        const response = await axios.get(endpoint, {
          params: params,
          withCredentials: true
        });

        if (response.data) {
          if (scanType === 'code') {
            // Process code comparison data
            processCodeComparisonData(response.data, baseFileId);
          } else {
            // Process text comparison data
            processTextComparisonData(response.data);
          }
        }
      } catch (error) {
        console.error('Error fetching comparison data:', error);
      } finally {
        setLoading(false);
      }
    };

    const processCodeComparisonData = (data, baseFileId) => {
      setComparisonData(data);
      
      // Process file contents and matches
      const processedData = {};
      
      // Find all comparisons involving the base file
      const baseFileComparisons = data.comparisons.filter(c => 
        c.file1_id === baseFileId || c.file2_id === baseFileId
      );
      
      // Get base file content
      const baseFileComparison = baseFileComparisons[0];
      const baseFileContent = baseFileComparison.file1_id === baseFileId 
        ? baseFileComparison.file1_content 
        : baseFileComparison.file2_content;
      
      // Process matches for the base file
      const baseFileMatches = [];
      
      baseFileComparisons.forEach(comparison => {
        const isFile1Base = comparison.file1_id === baseFileId;
        const targetFileId = isFile1Base ? comparison.file2_id : comparison.file1_id;
        const targetFileName = isFile1Base ? comparison.file2_name : comparison.file1_name;
        
        comparison.matches.forEach(match => {
          baseFileMatches.push({
            source: targetFileName,
            sourceId: targetFileId,
            line_start: isFile1Base ? match.file1_start : match.file2_start,
            line_end: isFile1Base ? match.file1_end : match.file2_end,
            similarity: comparison.similarity
          });
        });
      });
      
      // Add base file to processed data
      processedData[baseFileName] = {
        content: baseFileContent,
        matches: baseFileMatches
      };
      
      setFileContents(processedData);
      
      // Set the initial compared file to the first one with comparisons
      if (baseFileComparisons.length > 0) {
        const firstComparison = baseFileComparisons[0];
        const comparedFileId = firstComparison.file1_id === baseFileId 
          ? firstComparison.file2_id 
          : firstComparison.file1_id;
        setComparedFileId(comparedFileId);
      }
    };

    const processTextComparisonData = (data) => {
      setComparisonData(data);
      
      // Process file contents and matches
      const processedData = {};
      
      // Add base file content
      processedData[data.base_file.name] = {
        content: data.base_file.text,
        matches: []
      };
      
      // Process comparisons for each target file
      data.comparisons.forEach(comp => {
        // For each comparison, add matches to the base file
        processedData[data.base_file.name].matches.push(
          ...comp.matches.map(match => ({
            source: comp.name,
            sourceId: comp.file_id,
            index_start: match.index_start,
            length: match.length,
            similarity: comp.similarity
          }))
        );
        
        // Also store content for other files if available
        if (!processedData[comp.name]) {
          processedData[comp.name] = {
            content: '', // We don't have content for other files in this response
            matches: []
          };
        }
      });
      
      setFileContents(processedData);
      
      // Set the initial compared file to the first one in the comparisons list
      if (data.comparisons.length > 0) {
        setComparedFileId(data.comparisons[0].file_id);
      }
    };

    fetchData();
  }, [uploadId, baseFileId, scanType, baseFileName]);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  const handleNavigation = (page) => {
    if (page === 'scans') navigate('/history');
    else if (page === 'new-scan') navigate('/plagio-dashboard');
    else if (page === 'dashboard') navigate('/plagio-dashboard');
    else if (page === 'results') navigate('/results', { state: { files, analysisName, scanType, uploadId } });
  };

  // Logout function
  const handleLogout = async () => {
    try {
      const res = await fetch('http://localhost:5000/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        window.location.href = '/login';
      } else {
        const data = await res.json();
        alert(data.message || 'Logout failed');
      }
    } catch {
      alert('Network error during logout');
    }
  };

  const getIconForType = (fileName) => {
    if (!fileName) return <FiFile style={{ color: '#3498db' }} />;
    const ext = fileName.split('.').pop().toLowerCase();
    return ['c', 'cpp', 'js', 'java', 'py', 'html', 'css'].includes(ext) ?
      <FiCode style={{ color: '#3498db' }} /> : <FiFile style={{ color: '#3498db' }} />;
  };

  const getSimilarityWithFile = (targetFileId) => {
    if (!comparisonData || !targetFileId) return 0;
    
    if (scanType === 'code') {
      // For code comparisons, find the comparison between base file and target file
      const comparison = comparisonData.comparisons.find(c => 
        (c.file1_id === baseFileId && c.file2_id === targetFileId) ||
        (c.file2_id === baseFileId && c.file1_id === targetFileId)
      );
      return comparison ? comparison.similarity : 0;
    } else {
      // For text comparisons
      const comparison = comparisonData.comparisons.find(c => c.file_id === targetFileId);
      return comparison ? comparison.similarity : 0;
    }
  };

  const highlightColors = [
    { background: '#FFD6E0', text: '#f50b22ff' },
    //{ background: '#D1ECF1', text: '#90e3fdff' },
    //{ background: '#D4EDDA', text: '#9ff0b2ff' },
    // { background: '#FFF3CD', text: '#f8d260ff' },
    // { background: '#E8DAEF', text: '#cd7bedff' },
  ];

  const highlightPlagiarizedContent = (content, matches, currentComparisonId) => {
    if (!content) return <div>No content available</div>;
    
    if (scanType === 'code') {
      // For code comparisons, highlight by line
      if (!matches || !matches.length || !currentComparisonId) {
        return content.split('\n').map((line, i) => <div key={i}>{line}</div>);
      }

      // Filter matches for the current comparison file
      const relevantMatches = matches.filter(m => m.sourceId === currentComparisonId);

      if (!relevantMatches.length) {
        return content.split('\n').map((line, i) => <div key={i}>{line}</div>);
      }

      // Create an array to mark which lines should be highlighted
      const highlightMap = new Array(content.split('\n').length).fill(false);
      
      relevantMatches.forEach(match => {
        const startLine = match.line_start - 1; // Convert to 0-based index
        const endLine = match.line_end - 1; // Convert to 0-based index
        
        for (let i = startLine; i <= endLine && i < highlightMap.length; i++) {
          highlightMap[i] = true;
        }
      });

      // Generate highlighted content
      const lines = content.split('\n');
      const highlightedContent = lines.map((line, lineIndex) => {
        if (highlightMap[lineIndex]) {
          const colorIndex = lineIndex % highlightColors.length;
          return (
            <div 
              key={lineIndex} 
              style={{
                backgroundColor: highlightColors[colorIndex].background,
                color: highlightColors[colorIndex].text,
                padding: '2px 0'
              }}
            >
              {line}
            </div>
          );
        } else {
          return <div key={lineIndex}>{line}</div>;
        }
      });

      return highlightedContent;
    } else {
      // For text comparisons, highlight by character position
      if (!matches || !matches.length || !currentComparisonId) {
        return content.split('\n').map((line, i) => <div key={i}>{line}</div>);
      }

      // Filter matches for the current comparison file
      const relevantMatches = matches.filter(m => m.sourceId === currentComparisonId);

      if (!relevantMatches.length) {
        return content.split('\n').map((line, i) => <div key={i}>{line}</div>);
      }

      // Create an array to mark which characters should be highlighted
      const highlightMap = new Array(content.length).fill(false);
      
      relevantMatches.forEach(match => {
        const start = match.index_start;
        const end = Math.min(start + match.length, content.length);
        
        for (let i = start; i < end; i++) {
          highlightMap[i] = true;
        }
      });

      // Split content into lines and process each line
      const lines = content.split('\n');
      const highlightedContent = [];
      
      let charIndex = 0;
      
      lines.forEach((line, lineIndex) => {
        const lineStartIndex = charIndex;
        const lineEndIndex = lineStartIndex + line.length;
        
        // Check if any part of this line should be highlighted
        const lineHasHighlight = highlightMap.slice(lineStartIndex, lineEndIndex).some(val => val);
        
        if (!lineHasHighlight) {
          highlightedContent.push(<div key={lineIndex}>{line}</div>);
        } else {
          // Process each character in the line to apply highlighting
          const lineElements = [];
          let currentSpan = '';
          let inHighlight = false;
          
          for (let i = 0; i <= line.length; i++) {
            const globalIndex = lineStartIndex + i;
            const shouldHighlight = highlightMap[globalIndex];
            
            if (i === line.length || shouldHighlight !== inHighlight) {
              if (currentSpan) {
                const colorIndex = lineIndex % highlightColors.length;
                const style = inHighlight ? {
                  backgroundColor: highlightColors[colorIndex].background,
                  color: highlightColors[colorIndex].text
                } : {};
                
                lineElements.push(
                  <span key={`${lineIndex}-${i}`} style={style}>
                    {currentSpan}
                  </span>
                );
              }
              
              if (i < line.length) {
                currentSpan = line[i];
                inHighlight = shouldHighlight;
              }
            } else if (i < line.length) {
              currentSpan += line[i];
            }
          }
          
          highlightedContent.push(<div key={lineIndex}>{lineElements}</div>);
        }
        
        charIndex = lineEndIndex + 1; // +1 for the newline character
      });

      return highlightedContent;
    }
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>;

  const currentFileContent = fileContents[baseFileName] || { content: '', matches: [] };
  const similarityScore = getSimilarityWithFile(comparedFileId);
  
  // Get the compared file name and other files
  let comparedFileName = '';
  let otherFiles = [];
  
  if (scanType === 'code' && comparisonData) {
    // For code comparisons, find all files that aren't the base file
    comparisonData.comparisons.forEach(comparison => {
      if (comparison.file1_id === baseFileId && !otherFiles.some(f => f.file_id === comparison.file2_id)) {
        otherFiles.push({
          file_id: comparison.file2_id,
          name: comparison.file2_name
        });
        if (comparison.file2_id === comparedFileId) {
          comparedFileName = comparison.file2_name;
        }
      } else if (comparison.file2_id === baseFileId && !otherFiles.some(f => f.file_id === comparison.file1_id)) {
        otherFiles.push({
          file_id: comparison.file1_id,
          name: comparison.file1_name
        });
        if (comparison.file1_id === comparedFileId) {
          comparedFileName = comparison.file1_name;
        }
      }
    });
  } else if (comparisonData) {
    // For text comparisons
    comparedFileName = comparisonData.comparisons.find(c => c.file_id === comparedFileId)?.name || '';
    otherFiles = comparisonData.all_files || [];
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Arial, sans-serif' }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarCollapsed ? '60px' : '200px',
        backgroundColor: '#2c3e50',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'width 0.3s',
        padding: '20px 0',
        position: 'relative'
      }}>
        <button onClick={toggleSidebar} style={{
          position: 'absolute', top: '20px', right: '-15px', width: '30px', height: '30px', borderRadius: '50%',
          backgroundColor: '#34495e', border: 'none', color: 'white', cursor: 'pointer'
        }}>
          {sidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>

        <div>
          <div style={{ padding: '0 20px 20px', fontSize: '24px', fontWeight: 'bold', borderBottom: '1px solid #34495e', cursor: 'pointer' }}
            onClick={() => handleNavigation('dashboard')}>
            {sidebarCollapsed ? 'P' : 'PLAGIO'}
          </div>
          <div style={{ padding: '12px 20px', cursor: 'pointer' }} onClick={() => handleNavigation('new-scan')}>
            {sidebarCollapsed ? 'N' : 'New Scan'}
          </div>
          <div style={{ padding: '12px 20px', cursor: 'pointer' }} onClick={() => handleNavigation('scans')}>
            {sidebarCollapsed ? 'M' : 'My Scans'}
          </div>
        </div>

        <button style={{
          position: 'absolute', bottom: '0',left: '0',padding: '12px 0', cursor: 'pointer', backgroundColor: '#e74c3c', border: 'none', color: 'white',
          width: '100%', textAlign: 'center', marginTop: 'auto', borderBottomLeftRadius: sidebarCollapsed ? '0' : '4px', transition: 'background-color 0.3s' 
        }} onClick={handleLogout}>
          {sidebarCollapsed ? 'L' : 'Logout'}
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', backgroundColor: '#347adbff', color: 'white' }}>
          <div></div>
          <div style={{ fontWeight: 'bold' }}>{userEmail}</div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px', position: 'relative' }}>
          {/* Comparison Container */}
          <div style={{ display: 'flex', gap: '20px', flex: 1, marginBottom: '70px' }}>
            {/* Left Panel */}
            <div style={{ flex: 2, display: 'flex', flexDirection: 'column', backgroundColor: 'white', borderRadius: '5px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
              <div style={{ padding: '15px', backgroundColor: '#34495e', color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {getIconForType(baseFileName)} {baseFileName}
              </div>
              <div style={{ flex: 1, padding: '20px', fontFamily: scanType === 'code' ? 'monospace' : 'inherit', whiteSpace: 'pre-wrap', overflowY: 'auto' }}>
                {highlightPlagiarizedContent(currentFileContent.content, currentFileContent.matches, comparedFileId)}
              </div>
            </div>

            {/* Right Panel */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '5px', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2c3e50' }}>Plagiarism Similarity</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#dc2626', margin: '5px 0' }}>{similarityScore.toFixed(1)}%</div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>between {baseFileName} and {comparedFileName}</div>
              </div>

              <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '5px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '15px', backgroundColor: '#34495e', color: 'white', fontWeight: 'bold' }}>Other Files</div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                  {otherFiles.map((file, i) => (
                    <div key={i} style={{
                      padding: '12px', borderBottom: '1px solid #e2e8f0', cursor: 'pointer',
                      backgroundColor: file.file_id === comparedFileId ? '#e6f7ff' : 'transparent', 
                      display: 'flex', alignItems: 'center', gap: '10px'
                    }}
                      onClick={() => setComparedFileId(file.file_id)}>
                      {getIconForType(file.name)} {file.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <button onClick={() => handleNavigation('results')} style={{ 
            position: 'absolute', 
            bottom: '20px', 
            left: '20px', 
            padding: '10px 16px', 
            backgroundColor: '#347adbff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            cursor: 'pointer' 
          }}>
            <FiArrowLeft /> Back to Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileComparisonPage;