import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiFile, FiCode, FiArrowLeft } from 'react-icons/fi';

const FileComparisonPage = ({ userEmail = "user@example.com" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [fileContents, setFileContents] = useState({});
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Get data passed from ResultsPage
  const { analysisName, scanType, selectedFile, uploadId } = location.state || { 
    analysisName: 'Untitled Analysis', 
    scanType: 'text',
    selectedFile: '',
    uploadId: null
  };

  // Initialize state with proper fallback values
  const [currentSelectedFile, setCurrentSelectedFile] = useState(selectedFile);
  const [comparedFile, setComparedFile] = useState('');

  useEffect(() => {
    const fetchComparisonData = async () => {
      if (!uploadId) {
        setError('No upload ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/comparison?upload_id=${uploadId}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch comparison data');
        }
        
        const data = await response.json();
        setComparisonData(data);
        
        // Extract file names from the comparison data
        const fileNames = [];
        data.comparisons.forEach(comparison => {
          if (!fileNames.includes(comparison.file1_name)) {
            fileNames.push(comparison.file1_name);
          }
          if (!fileNames.includes(comparison.file2_name)) {
            fileNames.push(comparison.file2_name);
          }
        });
        
        // Set initial selected and compared files
        if (fileNames.length > 0) {
          if (selectedFile && fileNames.includes(selectedFile)) {
            setCurrentSelectedFile(selectedFile);
          } else {
            setCurrentSelectedFile(fileNames[0]);
          }
          
          // Set the first other file as compared file
          if (fileNames.length > 1) {
            const otherFile = fileNames.find(name => name !== currentSelectedFile) || fileNames[1];
            setComparedFile(otherFile);
          }
        }
        
      } catch (error) {
        console.error('Error fetching comparison data:', error);
        setError('Failed to load comparison data');
      } finally {
        setLoading(false);
      }
    };

    fetchComparisonData();
  }, [uploadId, selectedFile, currentSelectedFile]);

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
      navigate('/results', { state: { analysisName, scanType, uploadId } });
    }
  };

  const getIconForType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (['c', 'cpp', 'js', 'java', 'py', 'html', 'css'].includes(extension)) {
      return <FiCode style={{ color: '#3498db' }} />;
    }
    return <FiFile style={{ color: '#3498db' }} />;
  };

  const getSimilarityBetweenFiles = (file1, file2) => {
    if (!comparisonData) return 0;
    
    const comparison = comparisonData.comparisons.find(comp => 
      (comp.file1_name === file1 && comp.file2_name === file2) ||
      (comp.file1_name === file2 && comp.file2_name === file1)
    );
    
    return comparison ? comparison.similarity : 0;
  };

  const getMatchesForComparison = (file1, file2) => {
    if (!comparisonData) return [];
    
    const comparison = comparisonData.comparisons.find(comp => 
      comp.file1_name === file1 && comp.file2_name === file2
    );
    
    return comparison ? comparison.matches : [];
  };

  const highlightPlagiarizedContent = (content, matches) => {
    if (!matches || matches.length === 0) return content;
    
    let highlightedContent = [];
    let lastIndex = 0;
    
    // Sort matches by index_start
    const sortedMatches = [...matches].sort((a, b) => a.index_start - b.index_start);
    
    sortedMatches.forEach((match, index) => {
      // Add non-highlighted text before the match
      if (match.index_start > lastIndex) {
        highlightedContent.push(content.slice(lastIndex, match.index_start));
      }
      
      // Add highlighted text
      highlightedContent.push(
        <span 
          key={index} 
          style={{ 
            backgroundColor: '#FFD6E0', 
            color: '#D32F2F', 
            padding: '2px 0',
            borderRadius: '3px',
            fontWeight: '500'
          }}
        >
          {content.slice(match.index_start, match.index_start + match.length)}
        </span>
      );
      
      lastIndex = match.index_start + match.length;
    });
    
    // Add remaining text after the last match
    if (lastIndex < content.length) {
      highlightedContent.push(content.slice(lastIndex));
    }
    
    return highlightedContent.length ? highlightedContent : content;
  };

  const getOtherFiles = () => {
    if (!comparisonData) return [];
    
    const fileNames = [];
    comparisonData.comparisons.forEach(comparison => {
      if (!fileNames.includes(comparison.file1_name)) {
        fileNames.push(comparison.file1_name);
      }
      if (!fileNames.includes(comparison.file2_name)) {
        fileNames.push(comparison.file2_name);
      }
    });
    
    return fileNames.filter(name => name !== currentSelectedFile);
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
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '200px'
    },
    errorContainer: {
      padding: '20px',
      backgroundColor: '#fee',
      color: '#c53030',
      borderRadius: '5px',
      textAlign: 'center'
    }
  };

  const similarityScore = getSimilarityBetweenFiles(currentSelectedFile, comparedFile);
  const otherFiles = getOtherFiles();
  const matches = getMatchesForComparison(currentSelectedFile, comparedFile);

  // Get the content for the currently selected file
  const getCurrentFileContent = () => {
    if (!comparisonData) return '';
    
    const comparison = comparisonData.comparisons.find(comp => 
      comp.file1_name === currentSelectedFile || comp.file2_name === currentSelectedFile
    );
    
    if (!comparison) return 'Content not available';
    
    return currentSelectedFile === comparison.file1_name 
      ? comparison.file1_text 
      : comparison.file2_text;
  };

  const currentFileContent = getCurrentFileContent();

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
          {loading ? (
            <div style={styles.loadingContainer}>Loading comparison data...</div>
          ) : error ? (
            <div style={styles.errorContainer}>{error}</div>
          ) : !comparisonData ? (
            <div style={styles.errorContainer}>No comparison data available</div>
          ) : (
            <>
              {/* Comparison Container */}
              <div style={styles.comparisonContainer}>
                {/* Left Panel - File Content with Highlights */}
                <div style={styles.leftPanel}>
                  <div style={styles.fileHeader}>
                    {getIconForType(currentSelectedFile)}
                    {currentSelectedFile}
                  </div>
                  <div style={styles.fileContent}>
                    {highlightPlagiarizedContent(currentFileContent, matches)}
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
                            ...(file === comparedFile && styles.selectedOtherFile)
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = styles.otherFileItemHover.backgroundColor}
                          onMouseOut={(e) => e.target.style.backgroundColor = (file === comparedFile ? styles.selectedOtherFile.backgroundColor : '')}
                          onClick={() => setComparedFile(file)}
                        >
                          {getIconForType(file)}
                          {file}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Back Button at Bottom Left */}
              <button 
                style={styles.backButton}
                onMouseOver={(e) => e.target.style.backgroundColor = styles.backButtonHover.backgroundColor}
                onMouseOut={(e) => e.target.style.backgroundColor = styles.backButton.backgroundColor}
                onClick={() => handleNavigation('results')}
              >
                <FiArrowLeft />
                Back to Results
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileComparisonPage;