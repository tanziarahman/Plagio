import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiFile, FiArrowLeft } from 'react-icons/fi';

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

  // Mock similarity data
  const [similarityResults] = useState({
    overallSimilarity: 42.7
  });

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleNavigation = (page) => {
    if (page === 'scans') {
      navigate('/history'); // Changed to match App.js route
    } else if (page === 'new-scan') {
      navigate('/plagio-dashboard'); // Changed to match App.js route
    } else if (page === 'dashboard') {
      navigate('/plagio-dashboard'); // Changed to match App.js route
    }
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
      flexDirection: 'column',
      position: 'relative'
    },
    headerSection: {
      marginBottom: '20px',
      padding: '15px',
      backgroundColor: 'white',
      borderRadius: '5px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    },
    analysisTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#2c3e50',
      margin: 0
    },
    analysisType: {
      fontSize: '16px',
      color: '#64748b',
      marginTop: '8px',
      fontStyle: 'italic'
    },
    resultsContainer: {
      display: 'flex',
      gap: '20px',
      flex: 1
    },
    // LEFT COLUMN - Uploaded Files
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
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      flex: 1
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '15px',
      color: '#2c3e50'
    },
    fileList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    fileItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      border: '1px solid #e2e8f0',
      borderRadius: '5px',
      backgroundColor: '#f8fafc'
    },
    fileIcon: {
      color: '#3498db'
    },
    fileInfo: {
      flex: 1
    },
    fileName: {
      fontWeight: '500',
      color: '#2d3748'
    },
    fileType: {
      color: '#64748b',
      fontSize: '14px',
      marginTop: '2px'
    },
    // RIGHT COLUMN - Overall Similarity
    rightColumn: {
      width: '300px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    similarityBox: {
      backgroundColor: 'white',
      padding: '24px',
      textAlign: 'center',
      border: '2px solid #e2e8f0',
      borderRadius: '8px'
    },
    similarityTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#2d3748',
      margin: '0 0 16px 0',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    similarityScore: {
      fontSize: '42px',
      fontWeight: '700',
      color: '#dc2626',
      margin: '8px 0',
      lineHeight: '1.2'
    },
    similarityLabel: {
      fontSize: '14px',
      color: '#64748b',
      fontWeight: '500',
      marginBottom: '16px'
    },
    // Visual similarity indicator
    similarityVisual: {
      width: '100%',
      height: '8px',
      backgroundColor: '#e5e7eb',
      borderRadius: '4px',
      overflow: 'hidden',
      marginBottom: '8px'
    },
    similarityProgress: {
      height: '100%',
      backgroundColor: '#dc2626',
      borderRadius: '4px',
      width: `${similarityResults.overallSimilarity}%`,
      transition: 'width 0.5s ease-in-out'
    },
    similarityLegend: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '12px',
      color: '#6b7280'
    },
    backButton: {
      position: 'absolute',
      bottom: '20px',
      right: '20px',
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
            <div style={styles.analysisType}>{scanType.toUpperCase()} Analysis</div>
          </div>

          {/* Results Container */}
          <div style={styles.resultsContainer}>
            {/* Left Column - Uploaded Files */}
            <div style={styles.leftColumn}>
              <div style={styles.filesSection}>
                <h2 style={styles.sectionTitle}>Uploaded Files ({files.length})</h2>
                <div style={styles.fileList}>
                  {files.map((file, index) => (
                    <div key={index} style={styles.fileItem}>
                      <FiFile style={styles.fileIcon} />
                      <div style={styles.fileInfo}>
                        <div style={styles.fileName}>{file.name}</div>
                        <div style={styles.fileType}>{file.name.split('.').pop().toUpperCase()} file</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Overall Similarity */}
            <div style={styles.rightColumn}>
              <div style={styles.similarityBox}>
                <h3 style={styles.similarityTitle}>Overall Similarity</h3>
                <div style={styles.similarityScore}>{similarityResults.overallSimilarity}%</div>
                <div style={styles.similarityLabel}>across all files</div>
                
                {/* Visual Similarity Indicator */}
                <div style={styles.similarityVisual}>
                  <div style={styles.similarityProgress}></div>
                </div>
                <div style={styles.similarityLegend}>
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Back to Dashboard Button */}
          <button 
            style={styles.backButton}
            onClick={() => handleNavigation('dashboard')}
          >
            <FiArrowLeft />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;