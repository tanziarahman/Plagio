import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiDownload, FiPrinter, FiArrowLeft, FiFile } from 'react-icons/fi';

const ResultsPage = ({ userEmail = "user@example.com" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Get data passed from PlagioDashboard
  const { files, analysisName, scanType } = location.state || { 
    files: [], 
    analysisName: 'Untitled Analysis', 
    scanType: 'text' 
  };

  // Mock similarity data (replace with actual results from your backend)
  const [similarityResults] = useState({
    overallSimilarity: 42.7,
    fileComparisons: [
      { file1: 'document1.txt', file2: 'document2.txt', similarity: 65.2 },
      { file1: 'document1.txt', file2: 'document3.docx', similarity: 28.4 },
      { file1: 'document2.txt', file2: 'document3.docx', similarity: 34.8 }
    ],
    detailedResults: files.map(file => ({
      name: file.name,
      matches: [
        { matchedFile: 'document2.txt', similarity: 65.2, sections: ['Introduction', 'Conclusion'] },
        { matchedFile: 'document3.docx', similarity: 28.4, sections: ['Methodology'] }
      ]
    }))
  });

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleNavigateToHistory = () => {
    navigate('/history');
  };

  const handleBackToDashboard = () => {
    navigate('/plagio-dashboard');
  };

  const handleFileClick = (fileName) => {
    console.log(`File clicked: ${fileName}`);
    // Navigate to file details page
    // navigate('/file-details', { state: { fileName, comparisons: similarityResults.fileComparisons } });
  };

  const styles = {
    dashboard: {
      display: 'flex',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5'
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
      textOverflow: 'ellipsis'
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
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      padding: '15px',
      backgroundColor: 'white',
      borderRadius: '5px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    },
    analysisTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#2c3e50'
    },
    actionButtons: {
      display: 'flex',
      gap: '10px'
    },
    actionButton: {
      padding: '8px 15px',
      backgroundColor: '#1abc9c',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      transition: 'background-color 0.3s',
      ':hover': {
        backgroundColor: '#16a085'
      }
    },
    backButton: {
      backgroundColor: '#95a5a6',
      ':hover': {
        backgroundColor: '#7f8c8d'
      }
    },
    resultsContainer: {
      display: 'flex',
      gap: '20px',
      flex: 1
    },
    // RIGHT COLUMN - Overall Similarity (Top Right)
    rightColumn: {
      width: '300px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    similarityBox: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '5px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    similarityTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '15px',
      color: '#2c3e50'
    },
    similarityPercentage: {
      fontSize: '48px',
      fontWeight: 'bold',
      color: '#e74c3c',
      margin: '10px 0'
    },
    similarityLabel: {
      fontSize: '14px',
      color: '#7f8c8d',
      marginBottom: '15px'
    },
    // LEFT COLUMN - Files and Comparisons
    leftColumn: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    filesSection: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '5px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    },
    filesTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '15px',
      color: '#2c3e50'
    },
    fileList: {
      maxHeight: '400px',
      overflowY: 'auto'
    },
    fileItem: {
      padding: '12px',
      borderBottom: '1px solid #ecf0f1',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      ':hover': {
        backgroundColor: '#f8f9fa'
      }
    },
    fileIcon: {
      color: '#3498db'
    },
    fileName: {
      fontWeight: '500',
      flex: 1
    },
    fileType: {
      color: '#7f8c8d',
      fontSize: '12px'
    },
    comparisonSection: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '5px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    },
    comparisonTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '15px',
      color: '#2c3e50'
    },
    comparisonList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    },
    comparisonItem: {
      padding: '12px',
      border: '1px solid #ecf0f1',
      borderRadius: '4px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    comparisonText: {
      fontSize: '14px'
    },
    comparisonPercentage: {
      fontWeight: 'bold',
      color: '#e74c3c'
    },
    // BOTTOM BUTTON
    bottomButtonContainer: {
      marginTop: 'auto',
      padding: '20px 0'
    }
  };

  return (
    <div style={styles.dashboard}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <button style={styles.sidebarCollapseButton} onClick={toggleSidebar}>
          {sidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
        
        <div>
          <div style={styles.logo}>{sidebarCollapsed ? 'P' : 'PLAGIO'}</div>
          <div style={styles.menuItem} onClick={handleBackToDashboard}>
            {sidebarCollapsed ? 'N' : 'New Scan'}
          </div>
          <div style={{ ...styles.menuItem, ...styles.activeMenuItem }}>
            {sidebarCollapsed ? 'R' : 'Results'}
          </div>
          <div style={styles.menuItem} onClick={handleNavigateToHistory}>
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
            <div style={styles.analysisTitle}>{analysisName} - {scanType.toUpperCase()} Analysis</div>
            <div style={styles.actionButtons}>
              <button style={styles.actionButton}>
                <FiDownload /> Download Report
              </button>
              <button style={styles.actionButton}>
                <FiPrinter /> Print
              </button>
            </div>
          </div>

          {/* Results Container */}
          <div style={styles.resultsContainer}>
            {/* Left Column - Files and Comparisons */}
            <div style={styles.leftColumn}>
              {/* Uploaded Files */}
              <div style={styles.filesSection}>
                <div style={styles.filesTitle}>Uploaded Files ({files.length})</div>
                <div style={styles.fileList}>
                  {files.map((file, index) => (
                    <div 
                      key={index} 
                      style={styles.fileItem}
                      onClick={() => handleFileClick(file.name)}
                    >
                      <FiFile style={styles.fileIcon} />
                      <div>
                        <div style={styles.fileName}>{file.name}</div>
                        <div style={styles.fileType}>{file.name.split('.').pop().toUpperCase()} file</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* File Comparisons */}
              <div style={styles.comparisonSection}>
                <div style={styles.comparisonTitle}>File Comparisons</div>
                <div style={styles.comparisonList}>
                  {similarityResults.fileComparisons.map((comparison, index) => (
                    <div key={index} style={styles.comparisonItem}>
                      <div style={styles.comparisonText}>
                        {comparison.file1} ↔ {comparison.file2}
                      </div>
                      <div style={styles.comparisonPercentage}>{comparison.similarity}% similar</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Overall Similarity (Top Right) */}
            <div style={styles.rightColumn}>
              <div style={styles.similarityBox}>
                <div style={styles.similarityTitle}>Overall Similarity</div>
                <div style={styles.similarityPercentage}>{similarityResults.overallSimilarity}%</div>
                <div style={styles.similarityLabel}>across all files</div>
              </div>
            </div>
          </div>

          {/* Back to Dashboard Button (Bottom) */}
          <div style={styles.bottomButtonContainer}>
            <button 
              style={{...styles.actionButton, ...styles.backButton}} 
              onClick={handleBackToDashboard}
            >
              <FiArrowLeft /> Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;