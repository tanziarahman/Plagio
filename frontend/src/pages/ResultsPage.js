
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiFile, FiCode, FiType, FiCpu, FiAlertTriangle } from 'react-icons/fi';
import axios from 'axios';

const ResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [resultsData, setResultsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [comparisonError, setComparisonError] = useState(null);
  const [noComparisonsFound, setNoComparisonsFound] = useState(false); // New state for no comparisons

  // Data from previous page
  const { files, analysisName, scanType, uploadId } = location.state || {
    files: [],
    analysisName: 'Untitled Analysis',
    scanType: 'text',
    uploadId: null
  };

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

  // Fetch results
  useEffect(() => {
    const fetchResults = async () => {
      if (!uploadId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setComparisonError(null);
        setNoComparisonsFound(false); // Reset state

        // For code scans, first trigger the code comparison
        if (scanType === 'code') {
          try {
            const comparisonResponse = await axios.post('http://localhost:5000/compare-code', 
              { upload_id: uploadId },
              { withCredentials: true }
            );
            
            // Check if the comparison was successful
            if (comparisonResponse.data.error) {
              setComparisonError(comparisonResponse.data.error);
              // We'll still try to fetch any existing results
            }
          } catch (error) {
            console.log('Code comparison error:', error.message);
            if (error.response && error.response.data && error.response.data.error) {
              setComparisonError(error.response.data.error);
            } else {
              setComparisonError('Code comparison failed due to an unexpected error');
            }
            // We'll still try to fetch any existing results
          }
        }
        // For AI scans, trigger AI detection first
        else if (scanType === 'ai') {
          try {
            await axios.post('http://localhost:5000/ai-detection', 
              { upload_id: uploadId },
              { withCredentials: true }
            );
          } catch (error) {
            console.log('AI detection may have already been completed:', error.message);
          }
        }

        // Fetch results based on scan type
        let response;
        if (scanType === 'ai') {
          response = await axios.get('http://localhost:5000/ai-results', { 
            params: { upload_id: uploadId },
            withCredentials: true
          });
        } else {
          // For both text and code, use the average-similarity endpoint
          response = await axios.get('http://localhost:5000/average-similarity', { 
            params: { upload_id: uploadId },
            withCredentials: true
          });
        }

        if (response.data) {
          // Check if no comparisons were found (for code scans)
          if (scanType === 'code' && response.data.error && response.data.error.includes('No comparisons found')) {
            setNoComparisonsFound(true);
            
            // Create basic file info without similarity percentages
            const basicFileData = files.map((file, index) => ({
              id: file.id || file.file_id || index,
              type: scanType.charAt(0).toUpperCase() + scanType.slice(1),
              name: file.name || file.original_name || `File ${index + 1}`,
              date: new Date().toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              }),
              plagiarismPercent: 0 // Set to 0 when no comparisons found
            }));
            
            setResultsData(basicFileData);
          } 
          else if (response.data.results) {
            // Process results to ensure we have percentage values
            const data = response.data.results.map(item => {
              // For AI results
              if (scanType === 'ai' && item.ai_percentage !== undefined) {
                return {
                  id: item.file_id,
                  type: 'AI',
                  name: item.file_name,
                  date: item.detected_at ? new Date(item.detected_at).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  }) : new Date().toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  }),
                  plagiarismPercent: Math.round(item.ai_percentage * 100) / 100
                };
              }
              // For text and code results
              else if (item.average_similarity !== undefined) {
                return {
                  id: item.file_id,
                  type: scanType.charAt(0).toUpperCase() + scanType.slice(1),
                  name: item.file_name,
                  date: item.calculated_at ? new Date(item.calculated_at).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  }) : new Date().toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  }),
                  plagiarismPercent: Math.round(item.average_similarity * 100) / 100
                };
              }
              // Fallback for any other format
              return {
                id: item.file_id || item.id,
                type: scanType.charAt(0).toUpperCase() + scanType.slice(1),
                name: item.file_name || item.name,
                date: new Date().toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                }),
                plagiarismPercent: item.similarity || item.plagiarismPercent || 0
              };
            });
            
            setResultsData(data);
          }
        }
      } catch (error) {
        console.error('Error fetching results:', error);
        
        // If we can't get results from the API, create a fallback display
        const fallbackData = files.map((file, index) => ({
          id: file.id || file.file_id || index,
          type: scanType.charAt(0).toUpperCase() + scanType.slice(1),
          name: file.name || file.original_name || `File ${index + 1}`,
          date: new Date().toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          }),
          plagiarismPercent: 0 // Default to 0 if we can't get the actual value
        }));
        
        setResultsData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [uploadId, scanType, files]);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

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

  const handleNavigation = (page) => {
    if (page === 'scans') navigate('/history');
    else if (page === 'new-scan') navigate('/plagio-dashboard');
  };

  const handleFileClick = (fileId, fileName) => {
    // Don't allow navigation to detailed comparison if code comparison failed or no comparisons found
    if (scanType === 'code' && (comparisonError || noComparisonsFound)) {
      return;
    }
    
    if (scanType === 'ai') {
      navigate('/ai-analysis', {
        state: { files, analysisName, scanType, selectedFile: fileName, uploadId, fileId }
      });
    } else if (scanType === 'text' || scanType === 'code') {
      navigate('/file-comparison', {
        state: { files, analysisName, scanType, selectedFile: fileName, uploadId, fileId }
      });
    }
  };

  const getColorForPercentage = (percent) => {
    if (percent >= 70) return '#dc2626';
    if (percent >= 40) return '#ea580c';
    if (percent >= 20) return '#ca8a04';
    return '#16a34a';
  };

  const getIconForType = (type) => {
    switch (type.toLowerCase()) {
      case 'code': return <FiCode style={{ color: '#3498db' }} />;
      case 'ai': return <FiCpu style={{ color: '#9c27b0' }} />;
      default: return <FiFile style={{ color: '#3498db' }} />;
    }
  };

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
      paddingTop: '20px',
      minHeight: '100vh'
    },
    sidebarCollapseButton: {
      position: 'absolute', right: '-15px', top: '20px', backgroundColor: '#34495e',
      border: 'none', color: 'white', borderRadius: '50%', width: '30px', height: '30px',
      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 1,
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
    },
    logo: { 
      padding: '0 20px 20px', 
      fontSize: '24px', 
      fontWeight: 'bold', 
      borderBottom: '1px solid #34495e', 
      cursor: 'pointer', 
      whiteSpace: 'nowrap', 
      overflow: 'hidden', 
      textOverflow: 'ellipsis' 
    },
    menuItem: { 
      padding: '12px 20px', 
      cursor: 'pointer', 
      whiteSpace: 'nowrap', 
      overflow: 'hidden', 
      textOverflow: 'ellipsis', 
      transition: 'background-color 0.3s' 
    },
    menuItemHover: { backgroundColor: '#34495e' },
    logoutButton: { 
      padding: '12px 0', 
      cursor: 'pointer', 
      backgroundColor: '#e74c3c', 
      border: 'none', 
      color: 'white', 
      width: '100%', 
      textAlign: 'center', 
      marginTop: 'auto', 
      borderBottomLeftRadius: '4px',
      transition: 'background-color 0.3s'
    },
    logoutButtonHover: { backgroundColor: '#c0392b' },
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
    contentArea: { flex: 1, padding: '20px', display: 'flex', flexDirection: 'column' },
    resultsHeader: { marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    analysisName: { fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' },
    scanTypeBadge: { 
      padding: '5px 15px', 
      borderRadius: '20px', 
      backgroundColor: scanType === 'ai' ? '#9c27b0' : scanType === 'code' ? '#3498db' : '#1abc9c', 
      color: 'white', 
      fontSize: '14px', 
      fontWeight: 'bold' 
    },
    resultsTable: { backgroundColor: 'white', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', overflow: 'hidden' },
    tableHeader: { display: 'flex', padding: '12px 15px', backgroundColor: '#34495e', color: 'white', fontWeight: 'bold' },
    tableRow: { 
      display: 'flex', 
      padding: '12px 15px', 
      borderBottom: '1px solid #e2e8f0', 
      alignItems: 'center', 
      cursor: 'pointer', 
      transition: 'background-color 0.2s' 
    },
    tableRowDisabled: {
      display: 'flex', 
      padding: '12px 15px', 
      borderBottom: '1px solid #e2e8f0', 
      alignItems: 'center', 
      cursor: 'not-allowed',
      opacity: 0.6
    },
    tableRowHover: { backgroundColor: '#f8fafc' },
    typeColumn: { width: '120px', display: 'flex', alignItems: 'center', gap: '8px' },
    nameColumn: { flex: 2 },
    dateColumn: { width: '120px' },
    percentColumn: { width: '120px', textAlign: 'center', fontWeight: 'bold' },
    noResults: { textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '18px' },
    errorBanner: {
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      color: '#dc2626',
      padding: '12px 16px',
      borderRadius: '6px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    infoBanner: {
      backgroundColor: '#eff6ff',
      border: '1px solid #bfdbfe',
      color: '#1e40af',
      padding: '12px 16px',
      borderRadius: '6px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  };

  return (
    <div style={styles.dashboard}>
      <div style={styles.sidebar}>
        <button style={styles.sidebarCollapseButton} onClick={toggleSidebar}>
          {sidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
        <div>
          <div style={styles.logo} onClick={() => navigate('/plagio-dashboard')}>
            {sidebarCollapsed ? 'P' : 'PLAGIO'}
          </div>
          <div 
            style={styles.menuItem} 
            onMouseOver={(e) => e.target.style.backgroundColor = styles.menuItemHover.backgroundColor}
            onMouseOut={(e) => e.target.style.backgroundColor = ''}
            onClick={() => navigate('/plagio-dashboard')}
          >
            {sidebarCollapsed ? 'N' : 'New Scan'}
          </div>
          <div 
            style={styles.menuItem} 
            onMouseOver={(e) => e.target.style.backgroundColor = styles.menuItemHover.backgroundColor}
            onMouseOut={(e) => e.target.style.backgroundColor = ''}
            onClick={() => navigate('/history')}
          >
            {sidebarCollapsed ? 'M' : 'My Scans'}
          </div>
        </div>
        <button 
          style={styles.logoutButton}
          onMouseOver={(e) => e.target.style.backgroundColor = styles.logoutButtonHover.backgroundColor}
          onMouseOut={(e) => e.target.style.backgroundColor = styles.logoutButton.backgroundColor}
          onClick={handleLogout}
        >
          {sidebarCollapsed ? 'L' : 'Logout'}
        </button>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.topBar}>
          <div></div>
          <div style={styles.userEmail}>{userEmail}</div>
        </div>

        <div style={styles.contentArea}>
          <div style={styles.resultsHeader}>
            <div style={styles.analysisName}>{analysisName}</div>
            <div style={styles.scanTypeBadge}>{scanType.toUpperCase()} SCAN</div>
          </div>

          {comparisonError && (
            <div style={styles.errorBanner}>
              <FiAlertTriangle />
              <div>
                <strong>Code comparison failed:</strong> {comparisonError}
                <div style={{ fontSize: '14px', marginTop: '4px' }}>
                  No detailed comparison data is available. The results below show only basic file information.
                </div>
              </div>
            </div>
          )}

          {noComparisonsFound && (
            <div style={styles.infoBanner}>
              <FiAlertTriangle />
              <div>
                <strong>No comparisons found:</strong> The code comparison did not find any similar code segments between your files.
                <div style={{ fontSize: '14px', marginTop: '4px' }}>
                  The results below show basic file information with 0% similarity.
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading results...</div>
          ) : (
            <div style={styles.resultsTable}>
              <div style={styles.tableHeader}>
                <div style={styles.typeColumn}>Type</div>
                <div style={styles.nameColumn}>Name</div>
                <div style={styles.dateColumn}>Date</div>
                <div style={styles.percentColumn}>{scanType === 'ai' ? 'AI Content %' : 'Max Plag %'}</div>
              </div>

              {resultsData.length > 0 ? (
                resultsData.map(item => (
                  <div 
                    key={item.id} 
                    style={(scanType === 'code' && (comparisonError || noComparisonsFound)) ? styles.tableRowDisabled : styles.tableRow}
                    onMouseOver={(e) => {
                      if (!(scanType === 'code' && (comparisonError || noComparisonsFound))) {
                        e.target.style.backgroundColor = styles.tableRowHover.backgroundColor;
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!(scanType === 'code' && (comparisonError || noComparisonsFound))) {
                        e.target.style.backgroundColor = '';
                      }
                    }}
                    onClick={() => handleFileClick(item.id, item.name)}
                  >
                    <div style={styles.typeColumn}>{getIconForType(item.type)} {item.type}</div>
                    <div style={styles.nameColumn}>{item.name}</div>
                    <div style={styles.dateColumn}>{item.date}</div>
                    <div style={{ ...styles.percentColumn, color: getColorForPercentage(item.plagiarismPercent) }}>
                      {item.plagiarismPercent}%
                    </div>
                  </div>
                ))
              ) : (
                <div style={styles.noResults}>No files analyzed</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;