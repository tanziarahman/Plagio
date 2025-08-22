import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiFile, FiCode, FiType, FiArrowLeft } from 'react-icons/fi';

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
    'Document1.txt': {
      content: `This is a sample text document that contains some plagiarized content.
The quick brown fox jumps over the lazy dog. This sentence is commonly used for testing.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris.
Vivamus luctus urna sed urna ultricies ac tempor dui sagittis. In condimentum facilisis porta.
Sed non mauris vitae erat consequat auctor eu in elit. Class aptent taciti sociosqu ad litora torquent.
This is another paragraph that might contain plagiarized material from various sources.
The quick brown fox jumps over the lazy dog appears again here for demonstration purposes.`,
      matches: [
        { start: 12, end: 85, source: 'script.js', similarity: 92.5 },
        { start: 86, end: 180, source: 'Essay.pdf', similarity: 78.3 },
        { start: 250, end: 320, source: 'program.cpp', similarity: 85.7 }
      ]
    },
    'script.js': {
      content: `// JavaScript code example
function calculateSum(a, b) {
  return a + b;
}

// This function multiplies two numbers
function multiplyNumbers(x, y) {
  return x * y;
}

// Common algorithm pattern
const quickBrownFox = "jumps over the lazy dog";
console.log(quickBrownFox);

// Another code snippet that might be similar to other files
for (let i = 0; i < 10; i++) {
  console.log("Iteration: " + i);
}`,
      matches: [
        { start: 120, end: 160, source: 'Document1.txt', similarity: 92.5 },
        { start: 200, end: 250, source: 'program.cpp', similarity: 88.2 }
      ]
    },
    'Essay.pdf': {
      content: `Academic Essay on Modern Technology

Introduction: Technology has revolutionized the way we live and work. 
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris.
The quick brown fox jumps over the lazy dog is an example sentence.

Body: The impact of technology on society cannot be overstated. 
Vivamus luctus urna sed urna ultricies ac tempor dui sagittis. 
This paragraph contains content that may be similar to other sources.

Conclusion: In conclusion, technology will continue to shape our future. 
Sed non mauris vitae erat consequat auctor eu in elit.`,
      matches: [
        { start: 80, end: 150, source: 'Document1.txt', similarity: 78.3 },
        { start: 180, end: 250, source: 'Report.docx', similarity: 82.1 }
      ]
    },
    'Report.docx': {
      content: `Business Report Q3 2025

Executive Summary: Our company has seen significant growth this quarter.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris.

Financial Analysis: Revenue increased by 15% compared to last quarter.
Vivamus luctus urna sed urna ultricies ac tempor dui sagittis.

Conclusion: We expect continued growth in Q4 based on current trends.
Sed non mauris vitae erat consequat auctor eu in elit.`,
      matches: [
        { start: 60, end: 130, source: 'Essay.pdf', similarity: 82.1 },
        { start: 170, end: 240, source: 'program.cpp', similarity: 76.4 }
      ]
    },
    'program.cpp': {
      content: `#include <iostream>
using namespace std;

// Function to calculate sum
int calculateSum(int a, int b) {
  return a + b;
}

// Function to multiply numbers
int multiplyNumbers(int x, int y) {
  return x * y;
}

// Main function
int main() {
  cout << "The quick brown fox jumps over the lazy dog" << endl;
  
  // Loop example
  for (int i = 0; i < 10; i++) {
  cout << "Iteration: " << i << endl;
  }
  
  return 0;
}`,
      matches: [
        { start: 150, end: 190, source: 'Document1.txt', similarity: 85.7 },
        { start: 220, end: 270, source: 'script.js', similarity: 88.2 },
        { start: 300, end: 350, source: 'Report.docx', similarity: 76.4 }
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
    
    relevantMatches.forEach(match => {
      // Add non-highlighted text before the match
      if (match.start > lastIndex) {
        highlightedContent.push(content.slice(lastIndex, match.start));
      }
      
      // Add highlighted text
      highlightedContent.push(
        <span key={match.start} style={{ backgroundColor: '#ffeb3b', color: '#d32f2f', padding: '2px 0' }}>
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
      textOverflow: 'ellipsis',
      ':hover': {
        backgroundColor: '#34495e'
      }
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
      ':hover': {
        backgroundColor: '#c0392b'
      },
      marginTop: 'auto',
      borderBottomLeftRadius: '4px'
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
      flexDirection: 'column'
    },
    headerSection: {
      marginBottom: '20px',
      padding: '15px',
      backgroundColor: 'white',
      borderRadius: '5px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    analysisTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#2c3e50',
      margin: 0
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
      ':hover': {
        backgroundColor: '#2980b9'
      }
    },
    comparisonContainer: {
      display: 'flex',
      gap: '20px',
      flex: 1,
      height: 'calc(100vh - 200px)'
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
      transition: 'background-color 0.2s',
      ':hover': {
        backgroundColor: '#f1f5f9'
      }
    },
    selectedOtherFile: {
      backgroundColor: '#e6f7ff',
      borderLeft: '4px solid #3498db'
    }
  };

  const currentFileContent = fileContents[currentSelectedFile] || { content: '', matches: [] };
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
            onClick={() => handleNavigation('new-scan')}
          >
            {sidebarCollapsed ? 'N' : 'New Scan'}
          </div>
          <div 
            style={styles.menuItem} 
            onClick={() => handleNavigation('scans')}
          >
            {sidebarCollapsed ? 'M' : 'My Scans'}
          </div>
        </div>
        
        <button style={styles.logoutButton}>
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
          {/* Header Section */}
          <div style={styles.headerSection}>
            <h1 style={styles.analysisTitle}>{analysisName}</h1>
            <button 
              style={styles.backButton}
              onClick={() => handleNavigation('results')}
            >
              <FiArrowLeft />
              Back to Results
            </button>
          </div>

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
        </div>
      </div>
    </div>
  );
};

export default FileComparisonPage;