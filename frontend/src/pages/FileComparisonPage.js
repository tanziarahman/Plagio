import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiFile, FiCode, FiArrowLeft } from 'react-icons/fi';

const FileComparisonPage = ({ userEmail = "user@example.com" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Get data passed from ResultsPage
  const { files, analysisName, scanType, selectedFile } = location.state || { 
    files: [], 
    analysisName: 'Untitled Analysis', 
    scanType: 'text',
    selectedFile: ''
  };

  // Mock data for file content and plagiarism matches
  const [fileContents] = useState({
    '111.txt': {
      content: `This is the content of file 111.txt.
It contains some original text and some plagiarized content.
The quick brown fox jumps over the lazy dog. This sentence is commonly used for testing.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris.
This is another paragraph that might contain plagiarized material from various sources.
The quick brown fox jumps over the lazy dog appears again here for demonstration purposes.
This document has multiple sections that may match with other files in the database.
Plagiarism detection is an important tool for academic integrity.
Many institutions use software to identify copied content.`,
      matches: [
        { start: 45, end: 118, source: '222.txt', similarity: 92.5 },
        { start: 119, end: 213, source: '222.txt', similarity: 78.3 },
        { start: 250, end: 320, source: '333.txt', similarity: 85.2 }
      ]
    },
    '222.txt': {
      content: `This is the content of file 222.txt.
It contains text that matches with 111.txt in several places.
The quick brown fox jumps over the lazy dog. This sentence is commonly used for testing.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris.
Vivamus luctus urna sed urna ultricies ac tempor dui sagittis. In condimentum facilisis porta.
The quick brown fox jumps over the lazy dog appears again here for demonstration purposes.
Academic institutions take plagiarism very seriously.
Students should always cite their sources properly.
Using someone else's work without attribution is considered academic dishonesty.`,
      matches: [
        { start: 50, end: 123, source: '111.txt', similarity: 92.5 },
        { start: 124, end: 218, source: '111.txt', similarity: 78.3 },
        { start: 280, end: 350, source: '333.txt', similarity: 81.7 }
      ]
    },
    '333.txt': {
      content: `This is the content of file 333.txt.
It shares some common phrases with other documents.
The quick brown fox jumps over the lazy dog. This sentence is commonly used for testing.
Vivamus luctus urna sed urna ultricies ac tempor dui sagittis.
Plagiarism can have serious consequences for students and professionals.
Always ensure you properly attribute any sources you use in your work.
Academic integrity is fundamental to the educational process.`,
      matches: [
        { start: 55, end: 128, source: '111.txt', similarity: 85.2 },
        { start: 129, end: 200, source: '222.txt', similarity: 81.7 }
      ]
    }
  });

  // Initialize state with proper fallback values
  const initialSelectedFile = selectedFile || (files[0]?.name || '');
  const initialComparedFile = files.find(file => file.name !== initialSelectedFile)?.name || '';
  
  const [currentSelectedFile, setCurrentSelectedFile] = useState(initialSelectedFile);
  const [comparedFile, setComparedFile] = useState(initialComparedFile);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleNavigation = (page) => {
    if (page === 'scans') {
      navigate('/history');
    } else if (page === 'new-scan') {
      navigate('/plagio-dashboard');
    } else if (page === 'dashboard') {
      navigate('/plagio-dashboard');
    } else if (page === 'results') {
      navigate('/results', { state: { files, analysisName, scanType } });
    }
  };

  const getIconForType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (['c', 'cpp', 'js', 'java', 'py', 'html', 'css'].includes(extension)) {
      return <FiCode style={{ color: '#3498db' }} />;
    }
    return <FiFile style={{ color: '#3498db' }} />;
  };

  const getSimilarityWithFile = (file1, file2) => {
    // Find the similarity between two specific files
    const matches = fileContents[file1]?.matches || [];
    const match = matches.find(m => m.source === file2);
    return match ? match.similarity : 0;
  };

  const highlightColors = [
    { background: '#FFD6E0', text: '#D32F2F' }, // Baby pink
    { background: '#D1ECF1', text: '#0C4B5E' }, // Baby blue
    { background: '#D4EDDA', text: '#155724' }, // Light green
    { background: '#FFF3CD', text: '#856404' }, // Light yellow
    { background: '#E8DAEF', text: '#4A235A' }, // Light purple
  ];

  const highlightPlagiarizedContent = (content, matches, currentComparison) => {
    if (!matches.length) return content;
    
    let highlightedContent = [];
    let lastIndex = 0;
    
    // Sort matches by start index
    const sortedMatches = [...matches].sort((a, b) => a.start - b.start);
    
    // Only highlight matches that are relevant to the current comparison
    const relevantMatches = currentComparison 
      ? sortedMatches.filter(m => m.source === currentComparison)
      : sortedMatches;
    
    relevantMatches.forEach((match, index) => {
      // Add non-highlighted text before the match
      if (match.start > lastIndex) {
        highlightedContent.push(content.slice(lastIndex, match.start));
      }
      
      // Get color based on match index (cycle through colors)
      const colorIndex = index % highlightColors.length;
      const color = highlightColors[colorIndex];
      
      // Add highlighted text
      highlightedContent.push(
        <span 
          key={match.start} 
          style={{ 
            backgroundColor: color.background, 
            color: color.text, 
            padding: '2px 0',
            borderRadius: '3px',
            fontWeight: '500'
          }}
        >
          {content.slice(match.start, match.end)}
        </span>
      );
      
      lastIndex = match.end;
    });
    
    // Add remaining text after the last match
    if (lastIndex < content.length) {
      highlightedContent.push(content.slice(lastIndex));
    }
    
    return highlightedContent.length ? highlightedContent : content;
  };

  const styles = {
    dashboard: {
      display: 'flex',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f8fafc'
    },
    sidebar: {
      width: sidebarCollapsed ? '60px' : '200px',
      backgroundColor: '#2c3e50',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      transition: 'width 0.3s ease',
      position: 'relative',
      padding: '20px 0 0 0',
      minHeight: '100vh'
    },
    sidebarCollapseButton: {
      position: 'absolute',
      right: '-15px',
      top: '20px',
      backgroundColor: '#34495e',
      border: 'none',
      color: 'white',
      borderRadius: '50%',
      width: '30px',
      height: '30px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      zIndex: 1,
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
    },
    logo: {
      padding: '0 20px 20px',
      fontSize: '24px',
      fontWeight: 'bold',
      borderBottom: '1px solid #34495e',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      cursor: 'pointer'
    },
    menuItem: {
      padding: '12px 20px',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    menuItemHover: {
      backgroundColor: '#34495e'
    },
    activeMenuItem: {
      backgroundColor: '#1abc9c',
      fontWeight: 'bold'
    },
    logoutButton: {
      padding: '12px 0',
      cursor: 'pointer',
      backgroundColor: '#e74c3c',
      border: 'none',
      color: 'white',
      width: '100%',
      textAlign: 'center',
      transition: 'background-color 0.3s',
      marginTop: 'auto',
      borderBottomLeftRadius: '4px'
    },
    logoutButtonHover: {
      backgroundColor: '#c0392b'
    },
    mainContent: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    },
    topBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px 20px',
      backgroundColor: '#3498db',
      color: 'white',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    },
    userEmail: {
      fontWeight: 'bold'
    },
    contentArea: {
      flex: 1,
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    },
    comparisonContainer: {
      display: 'flex',
      gap: '20px',
      flex: 1,
      marginBottom: '70px'
    },
    // Left panel - File content with highlights
    leftPanel: {
      flex: 2,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'white',
      borderRadius: '5px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    },
    fileHeader: {
      padding: '15px',
      backgroundColor: '#34495e',
      color: 'white',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    fileContent: {
      flex: 1,
      padding: '20px',
      overflowY: 'auto',
      fontFamily: 'monospace',
      whiteSpace: 'pre-wrap',
      lineHeight: '1.5',
      fontSize: '14px'
    },
    // Right panel - Similarity and other files
    rightPanel: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    similarityBox: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '5px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      textAlign: 'center'
    },
    similarityTitle: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#2c3e50',
      marginBottom: '10px'
    },
    similarityScore: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#dc2626',
      margin: '5px 0'
    },
    similarityLabel: {
      fontSize: '14px',
      color: '#64748b'
    },
    otherFilesBox: {
      flex: 1,
      backgroundColor: 'white',
      borderRadius: '5px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    },
    otherFilesHeader: {
      padding: '15px',
      backgroundColor: '#34495e',
      color: 'white',
      fontWeight: 'bold'
    },
    otherFilesList: {
      flex: 1,
      overflowY: 'auto',
      padding: '10px'
    },
    otherFileItem: {
      padding: '12px',
      borderBottom: '1px solid #e2e8f0',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      transition: 'background-color 0.2s'
    },
    otherFileItemHover: {
      backgroundColor: '#f1f5f9'
    },
    selectedOtherFile: {
      backgroundColor: '#e6f7ff',
      borderLeft: '4px solid #3498db'
    },
    backButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 16px',
      backgroundColor: '#3498db',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'background-color 0.3s',
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      zIndex: 10
    },
    backButtonHover: {
      backgroundColor: '#2980b9'
    }
  };

  const currentFileContent = fileContents[currentSelectedFile] || { content: 'No content available', matches: [] };
  const similarityScore = getSimilarityWithFile(currentSelectedFile, comparedFile);
  const otherFiles = files.filter(file => file.name !== currentSelectedFile);

  return (
    <div style={styles.dashboard}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <button style={styles.sidebarCollapseButton} onClick={toggleSidebar}>
          {sidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
        
        <div>
          <div style={styles.logo} onClick={() => handleNavigation('dashboard')}>
            {sidebarCollapsed ? 'P' : 'PLAGIO'}
          </div>
          <div 
            style={styles.menuItem} 
            onMouseOver={(e) => e.target.style.backgroundColor = styles.menuItemHover.backgroundColor}
            onMouseOut={(e) => e.target.style.backgroundColor = ''}
            onClick={() => handleNavigation('new-scan')}
          >
            {sidebarCollapsed ? 'N' : 'New Scan'}
          </div>
          <div 
            style={styles.menuItem} 
            onMouseOver={(e) => e.target.style.backgroundColor = styles.menuItemHover.backgroundColor}
            onMouseOut={(e) => e.target.style.backgroundColor = ''}
            onClick={() => handleNavigation('scans')}
          >
            {sidebarCollapsed ? 'M' : 'My Scans'}
          </div>
        </div>
        
        <button 
          style={styles.logoutButton}
          onMouseOver={(e) => e.target.style.backgroundColor = styles.logoutButtonHover.backgroundColor}
          onMouseOut={(e) => e.target.style.backgroundColor = styles.logoutButton.backgroundColor}
        >
          {sidebarCollapsed ? 'L' : 'Logout'}
        </button>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.topBar}>
          <div></div>
          <div style={styles.userEmail}>{userEmail}</div>
        </div>

        <div style={styles.contentArea}>
          {/* Comparison Container */}
          <div style={styles.comparisonContainer}>
            {/* Left Panel - File Content with Highlights */}
            <div style={styles.leftPanel}>
              <div style={styles.fileHeader}>
                {getIconForType(currentSelectedFile)}
                {currentSelectedFile}
              </div>
              <div style={styles.fileContent}>
                {highlightPlagiarizedContent(
                  currentFileContent.content, 
                  currentFileContent.matches,
                  comparedFile
                )}
              </div>
            </div>

            {/* Right Panel - Similarity and Other Files */}
            <div style={styles.rightPanel}>
              {/* Similarity Box */}
              <div style={styles.similarityBox}>
                <div style={styles.similarityTitle}>Plagiarism Similarity</div>
                <div style={styles.similarityScore}>{similarityScore.toFixed(1)}%</div>
                <div style={styles.similarityLabel}>
                  between {currentSelectedFile} and {comparedFile}
                </div>
              </div>

              {/* Other Files Box */}
              <div style={styles.otherFilesBox}>
                <div style={styles.otherFilesHeader}>Other Files</div>
                <div style={styles.otherFilesList}>
                  {otherFiles.map((file, index) => (
                    <div 
                      key={index}
                      style={{
                        ...styles.otherFileItem,
                        ...(file.name === comparedFile && styles.selectedOtherFile)
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = styles.otherFileItemHover.backgroundColor}
                      onMouseOut={(e) => e.target.style.backgroundColor = (file.name === comparedFile ? styles.selectedOtherFile.backgroundColor : '')}
                      onClick={() => setComparedFile(file.name)}
                    >
                      {getIconForType(file.name)}
                      {file.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Back Button at Bottom Left (outside the file content box) */}
          <button 
            style={styles.backButton}
            onMouseOver={(e) => e.target.style.backgroundColor = styles.backButtonHover.backgroundColor}
            onMouseOut={(e) => e.target.style.backgroundColor = styles.backButton.backgroundColor}
            onClick={() => handleNavigation('results')}
          >
            <FiArrowLeft />
            Back to Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileComparisonPage;