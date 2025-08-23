import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiTrash2, FiUpload, FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';

const PlagioDashboard = ({ defaultScanType = null }) => {
  // State Management
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [analysisName, setAnalysisName] = useState('');
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [analysisError, setAnalysisError] = useState('');
  const [scanType, setScanType] = useState(defaultScanType);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [showFileWarning, setShowFileWarning] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Fetch user email on component mount
  React.useEffect(() => {
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

    fetchUserEmail();
  }, []);

  // Embedded CSS Animation
  const GlobalStyles = () => (
    <style>
      {`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}
    </style>
  );

  // Custom Spinner Component
  const LoadingSpinner = () => (
    <div style={{
      display: 'inline-block',
      width: '40px',
      height: '40px',
      border: '3px solid rgba(26, 188, 156, 0.3)',
      borderTopColor: '#1abc9c',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
  );

  // Core Functions
  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  const isValidFile = (file) => {
    const extension = file.name.split('.').pop().toLowerCase();
    if (scanType === 'ai' || scanType === 'text') return ['txt', 'docx'].includes(extension);
    if (scanType === 'code') return ['c', 'cpp'].includes(extension);
    return false;
  };

  const handleFileChange = (e) => {
    if (!scanType) {
      setUploadError('Please select a scan type first');
      return;
    }

    if (e.target.files?.length > 0) {
      const validFiles = Array.from(e.target.files).filter(isValidFile);
      const invalidFiles = Array.from(e.target.files).filter(f => !isValidFile(f));
      
      if (invalidFiles.length > 0) {
        setUploadError(`Invalid file type. Allowed: ${scanType === 'code' ? '.c, .cpp' : '.txt, .docx'}`);
      } else {
        setUploadError('');
      }

      const newFiles = validFiles.filter(newFile => 
        !files.some(existingFile => 
          existingFile.name === newFile.name && existingFile.size === newFile.size
        )
      );
      
      if (newFiles.length < validFiles.length) {
        setUploadError(prev => prev ? `${prev}. Note: Duplicate files ignored` : 'Note: Duplicate files ignored');
      }
      
      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      
      // FIXED: Only show the warning message, don't set upload error
      if ((scanType === 'text' || scanType === 'code') && updatedFiles.length === 1) {
        setShowFileWarning(true);
      } else {
        setShowFileWarning(false);
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (!scanType) return setUploadError('Select scan type first');
    if (e.dataTransfer.files?.length > 0) handleFileChange({ target: { files: e.dataTransfer.files } });
  };

  const handleDeleteFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    
    // Check if warning should be removed
    if ((scanType === 'text' || scanType === 'code') && newFiles.length !== 1) {
      setShowFileWarning(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleScan = async () => {
    if (!scanType) return setUploadError('Select scan type first');
    if (!analysisName.trim()) return setAnalysisError('Enter analysis name');
    
    const minFiles = scanType === 'ai' ? 1 : 2;
    if (files.length < minFiles) {
      return setUploadError(`Upload at least ${minFiles} file(s)`);
    }
    
    setAnalysisError('');
    setUploadError('');
    setIsScanning(true);
    
    try {
      const formData = new FormData();
      formData.append('scanType', scanType);
      formData.append('analysis_name', analysisName);
      
      files.forEach(file => {
        formData.append('files', file);
      });
      
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.status === 201) {
        setScanComplete(true);
        // Store upload_id for later use
        localStorage.setItem('currentUploadId', response.data.upload_id);
      }
    } catch (error) {
      setUploadError('Upload failed. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleViewResults = () => {
    const uploadId = localStorage.getItem('currentUploadId');
    navigate('/results', { 
      state: { 
        files, 
        analysisName, 
        scanType,
        uploadId 
      } 
    });
  };

  const handleNavigateToHistory = () => {
    navigate('/history');
  };

  // Styles
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
    scanTypeSelector: {
      display: 'flex',
      justifyContent: 'center',
      gap: '20px',
      marginBottom: '20px'
    },
    scanTypeButton: {
      padding: '15px 25px',
      borderRadius: '50px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: 'bold',
      transition: 'all 0.3s',
      backgroundColor: '#ecf0f1',
      ':hover': {
        transform: 'scale(1.05)'
      }
    },
    activeScanType: {
      backgroundColor: '#1abc9c',
      color: 'white'
    },
    uploadSection: {
      backgroundColor: 'white',
      borderRadius: '5px',
      padding: '30px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      marginBottom: '20px',
      textAlign: 'center'
    },
    uploadHeading: {
      marginBottom: '20px',
      textAlign: 'center'
    },
    uploadBox: {
      border: `2px dashed ${dragActive ? '#3498db' : '#ccc'}`,
      borderRadius: '5px',
      padding: '30px',
      margin: '20px 0',
      transition: 'border-color 0.3s',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px',
      position: 'relative'
    },
    uploadButton: {
      backgroundColor: '#3498db',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '16px',
      transition: 'background-color 0.3s',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      ':hover': {
        backgroundColor: '#2980b9'
      }
    },
    scanControls: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '20px',
      alignItems: 'center'
    },
    analysisNameInput: {
      width: '70%',
      padding: '10px',
      border: `1px solid ${analysisError ? '#e74c3c' : '#ddd'}`,
      borderRadius: '5px',
      fontSize: '16px'
    },
    scanButton: {
      padding: '10px 20px',
      backgroundColor: '#1abc9c',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '16px',
      transition: 'background-color 0.3s',
      ':hover': {
        backgroundColor: '#16a085'
      }
    },
    loadingIndicator: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '40px'
    },
    resultButton: {
      padding: '10px 20px',
      backgroundColor: '#1abc9c',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'background-color 0.3s',
      ':hover': {
        backgroundColor: '#16a085'
      }
    },
    fileList: {
      width: '100%',
      marginTop: '20px',
      textAlign: 'left',
      maxHeight: '200px',
      overflowY: 'auto'
    },
    fileItem: {
      padding: '8px 0',
      borderBottom: '1px solid #eee',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    deleteButton: {
      background: 'none',
      border: 'none',
      color: '#e74c3c',
      cursor: 'pointer',
      fontSize: '16px',
      display: 'flex',
      alignItems: 'center'
    },
    uploadErrorMessage: {
      color: '#e74c3c',
      fontSize: '14px',
      textAlign: 'center',
      width: '100%',
      position: 'absolute',
      bottom: '10px',
      left: '0'
    },
    analysisErrorMessage: {
      color: '#e74c3c',
      marginTop: '5px',
      fontSize: '14px',
      textAlign: 'left'
    },
    uploadIcon: {
      fontSize: '20px'
    },
    noFilesText: {
      color: '#7f8c8d',
      marginTop: '10px'
    },
    fileWarning: {
      color: '#e67e22',
      fontSize: '14px',
      textAlign: 'center',
      width: '100%',
      marginTop: '10px'
    }
  };

  return (
    <div style={styles.dashboard}>
      <GlobalStyles />
      
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <button style={styles.sidebarCollapseButton} onClick={toggleSidebar}>
          {sidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
        
        <div>
          <div style={styles.logo}>{sidebarCollapsed ? 'P' : 'PLAGIO'}</div>
          <div style={{ ...styles.menuItem, ...styles.activeMenuItem }}>
            {sidebarCollapsed ? 'N' : 'New Scan'}
          </div>
          <div style={styles.menuItem} onClick={handleNavigateToHistory}>
            {sidebarCollapsed ? 'M' : 'My Scans'}
          </div>
        </div>
        
        <button style={styles.logoutButton} onClick={handleLogout}>
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
          <div style={styles.scanTypeSelector}>
            <button
              style={{ ...styles.scanTypeButton, ...(scanType === 'text' && styles.activeScanType) }}
              onClick={() => { setScanType('text'); setFiles([]); setUploadError(''); setScanComplete(false); setShowFileWarning(false); }}
            >
              Text Documents
            </button>
            <button
              style={{ ...styles.scanTypeButton, ...(scanType === 'code' && styles.activeScanType) }}
              onClick={() => { setScanType('code'); setFiles([]); setUploadError(''); setScanComplete(false); setShowFileWarning(false); }}
            >
              Source Code
            </button>
            <button
              style={{ ...styles.scanTypeButton, ...(scanType === 'ai' && styles.activeScanType) }}
              onClick={() => { setScanType('ai'); setFiles([]); setUploadError(''); setScanComplete(false); setShowFileWarning(false); }}
            >
              AI Content
            </button>
          </div>

          <div style={styles.uploadSection}>
            <h2 style={styles.uploadHeading}>Upload Files</h2>
            <div 
              style={styles.uploadBox}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              <button 
                style={styles.uploadButton}
                onClick={() => document.getElementById('fileInput').click()}
              >
                <FiUpload style={styles.uploadIcon} />
                Browse Files
              </button>
              <input 
                id="fileInput"
                type="file" 
                multiple 
                style={{ display: 'none' }} 
                onChange={handleFileChange}
              />
              
              {files.length > 0 ? (
                <div style={styles.fileList}>
                  {files.map((file, index) => (
                    <div key={index} style={styles.fileItem}>
                      <span>{file.name}</span>
                      <button 
                        style={styles.deleteButton}
                        onClick={() => handleDeleteFile(index)}
                        title="Remove file"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={styles.noFilesText}>
                  {scanType 
                    ? `No files selected. Allowed: ${scanType === 'code' ? '.c, .cpp' : '.txt, .docx'}`
                    : 'Please select a scan type first'}
                </div>
              )}
              {showFileWarning && (
                <div style={styles.fileWarning}>
                  Note: You need to upload at least 2 files for this scan type
                </div>
              )}
              {uploadError && <div style={styles.uploadErrorMessage}>{uploadError}</div>}
            </div>
          </div>

          <div style={styles.scanControls}>
            <div style={{ width: '70%' }}>
              <input
                type="text"
                style={styles.analysisNameInput}
                placeholder="Enter analysis name"
                value={analysisName}
                onChange={(e) => { setAnalysisName(e.target.value); setAnalysisError(''); }}
              />
              {analysisError && <div style={styles.analysisErrorMessage}>{analysisError}</div>}
            </div>
            
            {isScanning ? (
              <div style={styles.loadingIndicator}>
                <LoadingSpinner />
              </div>
            ) : scanComplete ? (
              <button style={styles.resultButton} onClick={handleViewResults}>
                <FiCheckCircle /> View Results
              </button>
            ) : (
              <button 
                style={styles.scanButton}
                onClick={handleScan}
                disabled={
                  (scanType === 'text' && files.length < 2) || 
                  (scanType === 'code' && files.length < 2) ||
                  (scanType === 'ai' && files.length < 1)
                }
              >
                Scan
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlagioDashboard;