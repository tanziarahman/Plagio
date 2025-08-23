import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiFile, FiCode, FiType } from 'react-icons/fi';
import axios from 'axios';

const ResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [resultsData, setResultsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  
  // Get data passed from PlagioDashboard
  const { files, analysisName, scanType, uploadId } = location.state || { 
    files: [], 
    analysisName: 'Untitled Analysis', 
    scanType: 'text',
    uploadId: null
  };

  useEffect(() => {
    const fetchResults = async () => {
      try {
        if (!uploadId) return;
        
        // First, trigger the comparison
        await axios.post('/api/compare-txt', {
          upload_id: uploadId
        });
        
        // Then get the average similarity results
        const response = await axios.get('/api/avg-similarity', {
          params: { upload_id: uploadId }
        });
        
        if (response.data) {
          setResultsData(response.data.map(item => ({
            id: item.file_id,
            type: scanType.charAt(0).toUpperCase() + scanType.slice(1),
            name: item.file_name,
            date: new Date().toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            }),
            plagiarismPercent: item.average_similarity
          })));
        }
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserEmail = async () => {
      try {
        const response = await axios.get('/api/user');
        if (response.data && response.data.email) {
          setUserEmail(response.data.email);
        }
      } catch (error) {
        console.error('Error fetching user email:', error);
      }
    };

    if (uploadId) {
      fetchResults();
    }
    fetchUserEmail();
  }, [location.state, scanType, uploadId]);

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
    }
  };

  const handleFileClick = (fileId, fileName) => {
    navigate('/file-comparison', { 
      state: { 
        files, 
        analysisName, 
        scanType, 
        selectedFile: fileName,
        uploadId: uploadId,
        fileId: fileId
      } 
    });
  };

  const getColorForPercentage = (percent) => {
    if (percent >= 70) return '#dc2626'; // High plagiarism - red
    if (percent >= 40) return '#ea580c'; // Medium plagiarism - orange
    if (percent >= 20) return '#ca8a04'; // Low plagiarism - yellow
    return '#16a34a'; // Very low plagiarism - green
  };

  const getIconForType = (type) => {
    switch (type.toLowerCase()) {
      case 'code': return <FiCode style={{ color: '#3498db' }} />;
      case 'ai': return <FiType style={{ color: '#9c27b0' }} />;
      default: return <FiFile style={{ color: '#3498db' }} />;
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
      flexDirection: 'column'
    },
    resultsTable: {
      backgroundColor: 'white',
      borderRadius: '5px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    },
    tableHeader: {
      display: 'flex',
      padding: '12px 15px',
      backgroundColor: '#34495e',
      color: 'white',
      fontWeight: 'bold'
    },
    tableRow: {
      display: 'flex',
      padding: '12px 15px',
      borderBottom: '1px solid #e2e8f0',
      alignItems: 'center',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      ':hover': {
        backgroundColor: '#f1f5f9'
      }
    },
    typeColumn: {
      width: '120px',
      padding: '0 10px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    nameColumn: {
      flex: 2,
      padding: '0 10px'
    },
    dateColumn: {
      width: '120px',
      padding: '0 10px'
    },
    percentColumn: {
      width: '120px',
      padding: '0 10px',
      textAlign: 'center',
      fontWeight: 'bold'
    },
    noResults: {
      textAlign: 'center',
      padding: '40px',
      color: '#64748b',
      fontSize: '18px'
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
          {/* Results Table */}
          <div style={styles.resultsTable}>
            <div style={styles.tableHeader}>
              <div style={styles.typeColumn}>Type</div>
              <div style={styles.nameColumn}>Name</div>
              <div style={styles.dateColumn}>Date</div>
              <div style={styles.percentColumn}>Plagiarism %</div>
            </div>
            
            {resultsData.length > 0 ? (
              resultsData.map((item) => (
                <div 
                  key={item.id} 
                  style={styles.tableRow}
                  onClick={() => handleFileClick(item.id, item.name)}
                >
                  <div style={styles.typeColumn}>
                    {getIconForType(item.type)}
                    {item.type}
                  </div>
                  <div style={styles.nameColumn}>{item.name}</div>
                  <div style={styles.dateColumn}>{item.date}</div>
                  <div 
                    style={{
                      ...styles.percentColumn,
                      color: getColorForPercentage(item.plagiarismPercent)
                    }}
                  >
                    {item.plagiarismPercent}%
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.noResults}>No files analyzed</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;