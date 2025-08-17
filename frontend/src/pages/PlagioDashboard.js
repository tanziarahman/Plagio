import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiTrash2, FiUpload } from 'react-icons/fi';

const PlagioDashboard = ({ userEmail = "user@example.com" }) => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [analysisName, setAnalysisName] = useState('');
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [analysisError, setAnalysisError] = useState('');

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).filter(newFile => 
        !files.some(existingFile => 
          existingFile.name === newFile.name && existingFile.size === newFile.size
        )
      );
      
      if (newFiles.length < e.target.files.length) {
        setUploadError('Some files were not added because they are duplicates');
      } else {
        setUploadError('');
      }
      
      setFiles([...files, ...newFiles]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).filter(newFile => 
        !files.some(existingFile => 
          existingFile.name === newFile.name && existingFile.size === newFile.size
        )
      );
      
      if (newFiles.length < e.dataTransfer.files.length) {
        setUploadError('Some files were not added because they are duplicates');
      } else {
        setUploadError('');
      }
      
      setFiles([...files, ...newFiles]);
    }
  };

  const handleDeleteFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    setUploadError('');
  };

  const handleScan = () => {
    if (!analysisName.trim()) {
      setAnalysisError('Please enter an analysis name');
      return;
    }
    if (files.length === 0) {
      setUploadError('Please upload at least one file');
      return;
    }
    
    setAnalysisError('');
    setUploadError('');
    // Here you would handle the scan logic
    console.log('Scanning files:', files);
    console.log('Analysis name:', analysisName);
    // After scanning, you might navigate to results or history
    navigate('/');
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
    fileList: {
      width: '100%',
      marginTop: '20px',
      textAlign: 'left'
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
    }
  };

  return (
    <div style={styles.dashboard}>
      {/* Sidebar - Consistent with other pages */}
      <div style={styles.sidebar}>
        <button 
          style={styles.sidebarCollapseButton}
          onClick={toggleSidebar}
        >
          {sidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
        
        <div>
          <div style={styles.logo}>
            {sidebarCollapsed ? 'P' : 'PLAGIO'}
          </div>
          <div 
            style={{
              ...styles.menuItem,
              ...styles.activeMenuItem
            }}
          >
            {sidebarCollapsed ? 'N' : 'New Scan'}
          </div>
          <div 
            style={styles.menuItem}
            onClick={() => navigate('/')}
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
        {/* Top Bar with User Email */}
        <div style={styles.topBar}>
          <div></div>
          <div style={styles.userEmail}>{userEmail}</div>
        </div>

        {/* Content Area */}
        <div style={styles.contentArea}>
          {/* Upload Section */}
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
              
              {/* Display selected files with delete buttons */}
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
                <div style={styles.noFilesText}>No files selected</div>
              )}
              {uploadError && (
                <div style={styles.uploadErrorMessage}>{uploadError}</div>
              )}
            </div>
          </div>

          {/* Scan Controls */}
          <div style={styles.scanControls}>
            <div style={{ width: '70%' }}>
              <input
                type="text"
                style={styles.analysisNameInput}
                placeholder="Enter analysis name for uploaded files"
                value={analysisName}
                onChange={(e) => {
                  setAnalysisName(e.target.value);
                  setAnalysisError('');
                }}
              />
              {analysisError && (
                <div style={styles.analysisErrorMessage}>{analysisError}</div>
              )}
            </div>
            <button 
              style={styles.scanButton}
              onClick={handleScan}
              disabled={files.length === 0}
            >
              Scan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlagioDashboard;