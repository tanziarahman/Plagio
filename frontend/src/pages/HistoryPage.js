import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiSearch,
  FiEye,
  FiTrash2,
  FiFile,
  FiCode,
  FiType
} from 'react-icons/fi';
import axios from 'axios';

const HistoryPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');

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

  // Fetch uploads on mount
  useEffect(() => {
    const fetchUploads = async () => {
      try {
        const response = await axios.get('http://localhost:5000/uploads', { 
          withCredentials: true 
        });
        console.log('Uploads data:', response.data); // Debug log
        
        if (response.data && response.data.uploads) {
          setScans(response.data.uploads.map(upload => ({
            id: upload.upload_id,
            type: upload.upload_type,
            name: upload.session_name,
            date: new Date(upload.created_at).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            }),
            fileCount: upload.file_count
          })));
        }
      } catch (error) {
        console.error('Error fetching uploads:', error);
        // Check if it's an authentication error
        if (error.response && error.response.status === 401) {
          console.log('User not authenticated, redirecting to login');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUploads();
  }, [navigate]);

  // Filter scans based on search query
  const filteredScans = scans.filter(scan => 
    scan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    scan.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Delete a scan
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this upload?")) return;
    
    try {
      const response = await axios.delete('http://localhost:5000/delete_upload', { 
        params: { upload_id: id },
        withCredentials: true
      });
      
      console.log('Delete response:', response.data);
      
      if (response.status === 200) {
        setScans(scans.filter(scan => scan.id !== id));
      } else {
        alert('Failed to delete upload');
      }
    } catch (error) {
      console.error('Error deleting upload:', error);
      
      if (error.response) {
        alert(`Delete failed: ${error.response.data.error || error.response.data.message || 'Unknown error'}`);
      } else if (error.request) {
        alert('Delete failed: No response from server. Please check your connection.');
      } else {
        alert('Delete failed: Could not send request');
      }
    }
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

  // Navigate to new scan
  const handleNewScan = () => navigate('/plagio-dashboard');

  // Navigate to scan result page with uploadId
  const handleViewResult = (uploadId, scanType, scanName) => {
    navigate('/results', { 
      state: { 
        uploadId, 
        scanType, 
        analysisName: scanName,
        files: [] // You might want to fetch files data if needed
      } 
    });
  };

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  const getIconForType = (type) => {
    switch (type.toLowerCase()) {
      case 'code': return <FiCode style={{ color: '#3498db' }} />;
      case 'ai': return <FiType style={{ color: '#9c27b0' }} />;
      default: return <FiFile style={{ color: '#3498db' }} />;
    }
  };

  const styles = {
    dashboard: { display: 'flex', minHeight: '100vh', fontFamily: 'Arial, sans-serif', backgroundColor: '#f5f5f5' },
    sidebar: { width: sidebarCollapsed ? '60px' : '200px', backgroundColor: '#2c3e50', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'width 0.3s ease', position: 'relative', paddingTop: '20px', minHeight: '100vh' },
    sidebarCollapseButton: { position: 'absolute', right: '-15px', top: '20px', backgroundColor: '#34495e', border: 'none', color: 'white', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 1, boxShadow: '0 2px 5px rgba(0,0,0,0.2)' },
    logo: { padding: '0 20px 20px', fontSize: '24px', fontWeight: 'bold', borderBottom: '1px solid #34495e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer' },
    menuItem: { padding: '12px 20px', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    activeMenuItem: { backgroundColor: '#1abc9c', fontWeight: 'bold' },
    logoutButton: { padding: '12px 0', cursor: 'pointer', backgroundColor: '#e74c3c', border: 'none', color: 'white', width: '100%', textAlign: 'center', position: 'absolute', bottom: 0, left: 0, right: 0, borderBottomLeftRadius: '4px' },
    mainContent: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' },
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', backgroundColor: '#347adbff', color: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', height: '60px', boxSizing: 'border-box' },
    userEmail: { fontWeight: 'bold' },
    searchBar: { padding: '15px 20px', display: 'flex', alignItems: 'center', backgroundColor: 'white', borderBottom: '1px solid #ecf0f1' },
    searchInputContainer: { flex: 1, position: 'relative', marginRight: '10px', display: 'flex', alignItems: 'center' },
    searchIcon: { position: 'absolute', left: '15px', color: '#7f8c8d' },
    searchInput: { width: '100%', padding: '8px 15px 8px 40px', border: '1px solid bdc3c7', borderRadius: '4px', fontSize: '16px' },
    newScanButton: { padding: '8px 15px', backgroundColor: '#1abc9c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' },
    scanHistory: { flex: 1, padding: '20px', overflowY: 'auto' },
    historyHeader: { display: 'flex', padding: '12px 15px', backgroundColor: '#34495e', color: 'white', fontWeight: 'bold' },
    historyRow: { display: 'flex', padding: '12px 15px', backgroundColor: 'white', borderBottom: '1px solid #ecf0f1', alignItems: 'center' },
    typeColumn: { width: '120px', padding: '0 10px', display: 'flex', alignItems: 'center', gap: '8px' },
    nameColumn: { flex: 2, padding: '0 10px' },
    dateColumn: { width: '120px', padding: '0 10px' },
    smallColumn: { width: '100px', display: 'flex', justifyContent: 'center' },
    actionButton: { background: 'none', border: 'none', cursor: 'pointer', padding: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' },
    viewButton: { color: '#3498db' },
    deleteButton: { color: '#e74c3c' },
    actionGroup: { display: 'flex', gap: '15px' }
  };

  return (
    <div style={styles.dashboard}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <button style={styles.sidebarCollapseButton} onClick={toggleSidebar}>
          {sidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>

        <div>
          <div style={styles.logo} onClick={() => navigate('/plagio-dashboard')}>
            {sidebarCollapsed ? 'P' : 'PLAGIO'}
          </div>
          <div style={styles.menuItem} onClick={() => navigate('/plagio-dashboard')}>
            {sidebarCollapsed ? 'N' : 'New Scan'}
          </div>
          <div style={{ ...styles.menuItem, ...styles.activeMenuItem }}>
            {sidebarCollapsed ? 'M' : 'My Scans'}
          </div>
        </div>

        <button style={styles.logoutButton} onClick={handleLogout}>
          {sidebarCollapsed ? 'L' : 'Logout'}
        </button>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Top Bar */}
        <div style={styles.topBar}>
          <div></div>
          <div style={styles.userEmail}>{userEmail}</div>
        </div>

        {/* Search Bar */}
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
          <button style={styles.newScanButton} onClick={handleNewScan}>
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
            <div style={{ padding: '20px', textAlign: 'center' }}>Loading scans...</div>
          ) : (
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
                    style={{ ...styles.actionButton, ...styles.viewButton }}
                    onClick={() => handleViewResult(scan.id, scan.type, scan.name)}
                    title="View Results"
                  >
                    <FiEye />
                  </button>
                </div>
                <div style={styles.smallColumn}>
                  <div style={styles.actionGroup}>
                    <button
                      style={{ ...styles.actionButton, ...styles.deleteButton }}
                      onClick={() => handleDelete(scan.id)}
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;


