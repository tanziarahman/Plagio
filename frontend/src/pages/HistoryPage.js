import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiSearch,
  FiEye,
  FiDownload,
  FiTrash2,
  FiFile,
  FiCode,
  FiType
} from 'react-icons/fi';

const HistoryPage = ({ userEmail = "user@example.com" }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/uploads', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch upload history');
        }
        
        const data = await response.json();
        
        // Transform the API data to match the original format
        const transformedScans = data.uploads.map(upload => ({
          id: upload.upload_id,
          type: upload.comparison_type,
          name: upload.session_name,
          date: new Date(upload.created_at).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          }),
          file_count: upload.file_count
        }));
        
        setScans(transformedScans);
      } catch (error) {
        console.error('Error fetching upload history:', error);
        // Fallback to original mock data if API fails
        setScans([
          { id: 1, type: 'Text', name: 'Document1.txt', date: 'Aug 9, 2025', file_count: 3 },
          { id: 2, type: 'Code', name: 'script.js', date: 'Aug 8, 2025', file_count: 2 },
          { id: 3, type: 'AI', name: 'Essay.pdf', date: 'Aug 7, 2025', file_count: 1 },
          { id: 4, type: 'Text', name: 'Report.docx', date: 'Aug 6, 2025', file_count: 4 },
          { id: 5, type: 'Code', name: 'program.cpp', date: 'Aug 5, 2025', file_count: 2 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchUploads();
  }, []);

  const filteredScans = scans.filter(scan => 
    scan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    scan.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/upload/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete scan');
      }
      
      setScans(scans.filter(scan => scan.id !== id));
    } catch (error) {
      console.error('Error deleting scan:', error);
      alert('Failed to delete scan. Please try again.');
    }
  };

  const handleViewResults = (scan) => {
    navigate('/results', { 
      state: { 
        analysisName: scan.name, 
        scanType: scan.type.toLowerCase(),
        uploadId: scan.id
      } 
    });
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleNewScan = () => {
    navigate('/plagio-dashboard');
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
      height: '100vh',
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
      padding: '20px 0 0 0'
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
    searchBar: {
      padding: '15px 20px',
      display: 'flex',
      alignItems: 'center',
      backgroundColor: 'white',
      borderBottom: '1px solid #ecf0f1'
    },
    searchInputContainer: {
      flex: 1,
      position: 'relative',
      marginRight: '10px',
      display: 'flex',
      alignItems: 'center'
    },
    searchIcon: {
      position: 'absolute',
      left: '15px',
      color: '#7f8c8d'
    },
    searchInput: {
      width: '100%',
      padding: '8px 15px 8px 40px',
      border: '1px solid ',
      borderRadius: '4px'
    },
    newScanButton: {
      padding: '8px 15px',
      backgroundColor: '#1abc9c',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
      ':hover': {
        backgroundColor: '#16a085'
      }
    },
    scanHistory: {
      flex: 1,
      padding: '20px',
      overflowY: 'auto'
    },
    historyHeader: {
      display: 'flex',
      padding: '12px 15px',
      backgroundColor: '#34495e',
      color: 'white',
      fontWeight: 'bold'
    },
    historyRow: {
      display: 'flex',
      padding: '12px 15px',
      backgroundColor: 'white',
      borderBottom: '1px solid #ecf0f1',
      alignItems: 'center'
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
    smallColumn: {
      width: '100px',
      display: 'flex',
      justifyContent: 'center'
    },
    actionButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '5px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      transition: 'all 0.2s',
      ':hover': {
        transform: 'scale(1.1)'
      }
    },
    viewButton: {
      color: '#3498db'
    },
    downloadButton: {
      color: '#2ecc71'
    },
    deleteButton: {
      color: '#e74c3c'
    },
    actionGroup: {
      display: 'flex',
      gap: '15px'
    },
    loadingContainer: {
      padding: '20px',
      textAlign: 'center',
      color: '#64748b'
    }
  };

  return (
    <div style={styles.dashboard}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <button 
          style={styles.sidebarCollapseButton}
          onClick={toggleSidebar}
        >
          {sidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
        
        <div>
          <div style={styles.logo} onClick={() => navigate('/plagio-dashboard')}>
            {sidebarCollapsed ? 'P' : 'PLAGIO'}
          </div>
          <div 
            style={styles.menuItem}
            onClick={() => navigate('/plagio-dashboard')}
          >
            {sidebarCollapsed ? 'N' : 'New Scan'}
          </div>
          <div 
            style={{
              ...styles.menuItem,
              ...styles.activeMenuItem
            }}
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

        {/* Search Bar with Integrated Search Icon */}
        <div style={styles.searchBar}>
          <div style={styles.searchInputContainer}>
            <FiSearch style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search scans..."
              style={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            style={styles.newScanButton} 
            onClick={handleNewScan}
          >
            + New Scan
          </button>
        </div>

        {/* Scan History */}
        <div style={styles.scanHistory}>
          <div style={styles.historyHeader}>
            <div style={styles.typeColumn}>Type</div>
            <div style={styles.nameColumn}>Name</div>
            <div style={styles.dateColumn}>Date</div>
            <div style={styles.smallColumn}>View</div>
            <div style={styles.smallColumn}>Actions</div>
          </div>

          {loading ? (
            <div style={styles.loadingContainer}>Loading scan history...</div>
          ) : filteredScans.length > 0 ? (
            filteredScans.map(scan => (
              <div key={scan.id} style={styles.historyRow}>
                <div style={styles.typeColumn}>
                  {getIconForType(scan.type)}
                  {scan.type}
                </div>
                <div style={styles.nameColumn}>{scan.name}</div>
                <div style={styles.dateColumn}>{scan.date}</div>
                <div style={styles.smallColumn}>
                  <button 
                    style={{...styles.actionButton, ...styles.viewButton}}
                    title="View"
                    onClick={() => handleViewResults(scan)}
                  >
                    <FiEye />
                  </button>
                </div>
                <div style={styles.smallColumn}>
                  <div style={styles.actionGroup}>
                    <button 
                      style={{...styles.actionButton, ...styles.downloadButton}}
                      title="Download"
                    >
                      <FiDownload />
                    </button>
                    <button 
                      style={{...styles.actionButton, ...styles.deleteButton}}
                      onClick={() => handleDelete(scan.id)}
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={styles.loadingContainer}>No scans found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;