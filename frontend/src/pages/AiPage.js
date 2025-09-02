import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiFile, FiCode, FiArrowLeft, FiCpu } from 'react-icons/fi';
import axios from 'axios';

const AiPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [fileContents, setFileContents] = useState({});
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [hoverStates, setHoverStates] = useState({});

  const { files, analysisName, scanType, selectedFile, uploadId } = location.state || {
    files: [],
    analysisName: 'Untitled Analysis',
    scanType: 'ai',
    selectedFile: '',
    uploadId: null
  };

  const initialSelectedFile = selectedFile || (files && files[0]?.name || '');
  const [currentSelectedFile, setCurrentSelectedFile] = useState(initialSelectedFile);

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

  // Fetch AI results
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!uploadId) {
          setLoading(false);
          return;
        }

        // First, trigger AI detection if not already done
        try {
          await axios.post('http://localhost:5000/ai-detection', 
            { upload_id: uploadId },
            { withCredentials: true }
          );
        } catch (error) {
          // If detection was already done, this might return an error, but we can still try to get results
          console.log('AI detection may have already been completed:', error.message);
        }

        // Fetch AI results
        const response = await axios.get('http://localhost:5000/ai-results', { 
          params: { upload_id: uploadId },
          withCredentials: true
        });
        
        if (response.data && response.data.results) {
          const processed = {};
          response.data.results.forEach(f => {
            processed[f.file_name] = {
              content: f.score_html || '', // HTML with highlights from backend
              aiDetected: [], // fallback empty, optional parsing if needed
              overallAiScore: f.ai_percentage || 0
            };
          });
          setFileContents(processed);
        }
      } catch (error) {
        console.error('Error fetching AI results:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [uploadId]);

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
    const extension = fileName.split('.').pop().toLowerCase();
    if (['c', 'cpp', 'js', 'java', 'py', 'html', 'css'].includes(extension)) return <FiCode style={{ color: '#3498db' }} />;
    return <FiFile style={{ color: '#3498db' }} />;
  };

  const handleMouseOver = (item) => {
    setHoverStates(prev => ({ ...prev, [item]: true }));
  };

  const handleMouseOut = (item) => {
    setHoverStates(prev => ({ ...prev, [item]: false }));
  };

  const highlightAiContent = (htmlContent) => {
    if (!htmlContent) return <div style={styles.noContentMessage}>No content available for this file</div>;
    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading AI detection results...</div>;

  const currentFileContent = fileContents[currentSelectedFile] || { content: '', overallAiScore: 0 };
  
  // FIXED: Added null check for files before calling filter
  const otherFiles = files && Array.isArray(files) ? files.filter(f => f.name !== currentSelectedFile) : [];

  const styles = {
    dashboard: { display: 'flex', minHeight: '100vh', fontFamily: 'Arial, sans-serif', backgroundColor: '#f8fafc' },
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
      backgroundColor: hoverStates.menuItem ? '#34495e' : 'transparent'
    },
    logoutButton: { 
      padding: '12px 0', 
      cursor: 'pointer', 
      backgroundColor: hoverStates.logoutButton ? '#c0392b' : '#e74c3c', 
      border: 'none', 
      color: 'white', 
      width: '100%', 
      textAlign: 'center', 
      transition: 'background-color 0.3s', 
      marginTop: 'auto', 
      borderBottomLeftRadius: '4px' 
    },
    mainContent: { flex: 1, display: 'flex', flexDirection: 'column' },
    topBar: { 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '15px 20px', 
      backgroundColor: '#347adbff', 
      color: 'white', 
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)' 
    },
    userEmail: { fontWeight: 'bold' },
    contentArea: { flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', position: 'relative' },
    comparisonContainer: { display: 'flex', gap: '20px', flex: 1, marginBottom: '70px' },
    leftPanel: { 
      flex: 3, 
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
    rightPanel: { flex: 1, display: 'flex', flexDirection: 'column' },
    aiScoreBox: { 
      backgroundColor: 'white', 
      padding: '20px', 
      borderRadius: '5px', 
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)', 
      textAlign: 'center', 
      height: 'fit-content' 
    },
    aiScoreTitle: { fontSize: '16px', fontWeight: 'bold', color: '#2c3e50', marginBottom: '10px' },
    aiScoreValue: { fontSize: '32px', fontWeight: 'bold', color: '#dc2626', margin: '5px 0' },
    aiScoreLabel: { fontSize: '14px', color: '#64748b' },
    backButton: { 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px', 
      padding: '10px 16px', 
      backgroundColor: hoverStates.backButton ? '#347adbff' : '#3498db', 
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
    noContentMessage: { textAlign: 'center', color: '#64748b', fontStyle: 'italic', padding: '20px' },
    fileList: { marginTop: '20px', backgroundColor: 'white', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', overflow: 'hidden' },
    fileListItem: { 
      padding: '10px 15px', 
      cursor: 'pointer', 
      borderBottom: '1px solid #e2e8f0', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '10px',
      backgroundColor: '#ffffff',
      transition: 'background-color 0.3s'
    },
    fileListItemSelected: { backgroundColor: '#edf2f7' },
    fileListItemHover: { backgroundColor: '#f8fafc' }
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
            onMouseOver={() => handleMouseOver('menuItem')}
            onMouseOut={() => handleMouseOut('menuItem')}
            onClick={() => handleNavigation('new-scan')}
          >
            {sidebarCollapsed ? 'N' : 'New Scan'}
          </div>
          <div
            style={styles.menuItem}
            onMouseOver={() => handleMouseOver('menuItem')}
            onMouseOut={() => handleMouseOut('menuItem')}
            onClick={() => handleNavigation('scans')}
          >
            {sidebarCollapsed ? 'M' : 'My Scans'}
          </div>
        </div>

        <button
          style={styles.logoutButton}
          onMouseOver={() => handleMouseOver('logoutButton')}
          onMouseOut={() => handleMouseOut('logoutButton')}
          onClick={handleLogout}
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
          <div style={styles.comparisonContainer}>
            <div style={styles.leftPanel}>
              <div style={styles.fileHeader}>
                {getIconForType(currentSelectedFile)} {currentSelectedFile}
              </div>
              <div style={styles.fileContent}>
                {highlightAiContent(currentFileContent.content)}
              </div>
            </div>

            <div style={styles.rightPanel}>
              <div style={styles.aiScoreBox}>
                <div style={styles.aiScoreTitle}>AI-Generated Content</div>
                <FiCpu style={{ fontSize: '40px', color: '#dc2626', margin: '10px 0' }} />
                <div style={styles.aiScoreValue}>{currentFileContent.overallAiScore.toFixed(1)}%</div>
                <div style={styles.aiScoreLabel}>of this content is AI-generated</div>
              </div>
              
              {otherFiles.length > 0 && (
                <div style={styles.fileList}>
                  <div style={{...styles.fileHeader, fontSize: '14px'}}>Other Files</div>
                  {otherFiles.map(file => (
                    <div
                      key={file.name}
                      style={{
                        ...styles.fileListItem,
                        ...(file.name === currentSelectedFile ? styles.fileListItemSelected : {}),
                        backgroundColor: hoverStates[`file-${file.name}`] ? 
                          styles.fileListItemHover.backgroundColor : 
                          (file.name === currentSelectedFile ? 
                            styles.fileListItemSelected.backgroundColor : 
                            styles.fileListItem.backgroundColor)
                      }}
                      onMouseOver={() => handleMouseOver(`file-${file.name}`)}
                      onMouseOut={() => handleMouseOut(`file-${file.name}`)}
                      onClick={() => setCurrentSelectedFile(file.name)}
                    >
                      {getIconForType(file.name)} {file.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            style={styles.backButton}
            onMouseOver={() => handleMouseOver('backButton')}
            onMouseOut={() => handleMouseOut('backButton')}
            onClick={() => handleNavigation('results')}
          >
            <FiArrowLeft /> Back to Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiPage;

