import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "@fontsource/poppins";

function Dashboard() {
  const [userEmail, setUserEmail] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [analysisName, setAnalysisName] = useState('');
  const [analysisResults, setAnalysisResults] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);
  const [lastUploadId, setLastUploadId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const res = await fetch('http://localhost:5000/dashboard', {
          credentials: 'include',
        });
        if (!res.ok) return navigate('/login');
        const data = await res.json();
        setUserEmail(data.message?.split(',')[1] || '');
      } catch {
        navigate('/login');
      }
    };
    verifyAuth();
  }, [navigate]);

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
      const res = await fetch('http://localhost:5000/uploads', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        const formatted = data.uploads.map(up => ({
          name: up.session_name,
          time: new Date(up.created_at).toLocaleString(),
          upload_id: up.upload_id
        }));
        setAnalysisResults(formatted);
      }
    } catch (err) {
      console.error("Failed to fetch uploads:", err);
    }
  };

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

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const validFiles = newFiles.filter(f => ['txt', 'docx'].includes(f.name.split('.').pop().toLowerCase()));
    if (validFiles.length < newFiles.length) alert('Only .txt and .docx files are allowed.');

    const unique = Array.from(new Map([...selectedFiles, ...validFiles].map(f => [f.name + f.lastModified, f])).values());
    setSelectedFiles(unique);
  };

  const handleFileRemove = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDelete = async (upload_id) => {
    if (!window.confirm("Are you sure you want to delete this upload?")) return;
    try {
      const res = await fetch(`http://localhost:5000/delete_upload?upload_id=${upload_id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        alert("Upload deleted successfully.");
        setAnalysisResults(prev => prev.filter(item => item.upload_id !== upload_id));
      } else {
        alert(data.error || 'Deletion failed.');
      }
    } catch (err) {
      alert('Network error while deleting upload.');
      console.error(err);
    }
  };

  const handleAnalyze = async () => {
    const trimmed = analysisName.trim();
    if (!trimmed || selectedFiles.length < 2) {
      return alert('Please enter a valid analysis name and at least two files.');
    }

    setAnalyzing(true);
    setAnalysisDone(false);

    const formData = new FormData();
    selectedFiles.forEach(file => formData.append('files', file));
    formData.append('analysis_name', trimmed);

    try {
      const uploadRes = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const uploadData = await uploadRes.json();

      if (uploadRes.ok && uploadData.upload_id) {
        const compareRes = await fetch('http://localhost:5000/compare', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ upload_id: uploadData.upload_id }),
        });

        const compareData = await compareRes.json();
        if (compareRes.ok) {
          setLastUploadId(uploadData.upload_id);
          setAnalyzing(false);
          setAnalysisDone(true);
          await new Promise(resolve => setTimeout(resolve, 1000)); // ✅ wait before fetching
          fetchUploads();
        } else {
          alert(compareData.error || 'Comparison failed.');
          setAnalyzing(false);
        }
      } else {
        alert(uploadData.error || 'Upload failed.');
        setAnalyzing(false);
      }
    } catch (err) {
      console.error('Error uploading or comparing:', err);
      alert('Something went wrong.');
      setAnalyzing(false);
    }
  };

  const filteredResults = analysisResults.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.wrapper}>
      <div style={styles.topbar}>
        <div style={styles.topbarContent}>
          <span style={styles.userEmail}>{userEmail}</span>
          <button style={styles.logoutButton} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div style={styles.split}>
        {/* Left Section */}
        <div style={styles.left}>
          <h1 style={styles.heading}>PLAGIO</h1>
          <h2 style={styles.subheading}>Comprehensive plagiarism detection</h2>

          <p style={styles.textImportant}>Analyze a dataset</p>
          <p style={styles.text}>Upload multiple files to analyze</p>

          <div style={styles.formGroup}>
            <label style={styles.label}>Upload Files (.txt, .docx):</label>
            <input type="file" multiple onChange={handleFileChange} style={styles.inputFile} accept=".txt,.docx" />
            <div style={styles.fileList}>
              {selectedFiles.map((file, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <p style={styles.fileName}>{file.name}</p>
                  <button onClick={() => handleFileRemove(i)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>✖</button>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Analysis name:</label>
            <input
              type="text"
              placeholder="e.g. Assignment 2"
              value={analysisName}
              onChange={e => setAnalysisName(e.target.value)}
              style={styles.inputText}
            />
          </div>

          <div style={styles.buttonGroup}>
            <button style={styles.analyzeButton} onClick={handleAnalyze} disabled={analyzing}>Analyze</button>
            {analysisDone && lastUploadId && (
              <button
                onClick={() => navigate('/result', { state: { upload_id: lastUploadId } })}
                style={styles.analyzeButton}
              >
                View Result →
              </button>
            )}
          </div>

          {analyzing && <p style={{ marginTop: 10, color: '#6b7280' }}>Analyzing {selectedFiles.length} file(s)...</p>}
        </div>

        {/* Right Section */}
        <div style={styles.right}>
          <div style={{ marginTop: '130px' }}>
            <h2 style={styles.textImportant}>Previous Analysis Results</h2>
            <input
              type="text"
              placeholder="🔍 Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            <div style={styles.resultsHeader}>
              <span><strong>Name</strong></span>
              <span><strong>Upload Time</strong></span>
              <span><strong>Actions</strong></span>
            </div>
            {filteredResults.map((entry, i) => (
              <div key={i} style={styles.resultRow}>
                <span>{entry.name}</span>
                <span>{entry.time}</span>
                <span>
                  <button
                    onClick={() => navigate('/result', { state: { upload_id: entry.upload_id } })}
                    style={{ color: '#4f46e5', border: 'none', background: 'none', cursor: 'pointer', marginRight: '10px' }}
                  >
                    View →
                  </button>
                  <button
                    onClick={() => handleDelete(entry.upload_id)}
                    style={{ color: '#ef060eff', border: 'none', background: 'none', cursor: 'pointer' }}
                  >
                    🗑️
                  </button>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    fontFamily: 'Segoe UI, sans-serif',
    backgroundColor: '#f9fafb',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  topbar: {
    background: 'linear-gradient(135deg, rgba(124,58,237,0.85), rgba(167,139,250,0.85))',
    backdropFilter: 'blur(10px)',
    padding: '12px 24px',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    color: '#fff',
    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
  },
  topbarContent: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  userEmail: {
    color: '#fff',
    fontWeight: '500',
  },
  logoutButton: {
    padding: '8px 16px',
    backgroundColor: '#7c3aed',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: '1rem',
  },
  split: {
    display: 'flex',
    flex: 1,
  },
  left: {
    flex: 1,
    padding: '50px 40px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e5e7eb',
  },
  right: {
    flex: 1,
    padding: '50px 40px',
    backgroundColor: '#f3f4f6',
    overflowY: 'auto',
  },
  heading: {
    fontSize: '2.8rem',
    fontFamily: 'Poppins, sans-serif',
    fontWeight: '700',
    background: 'linear-gradient(to right, #8b5cf6, #a78bfa, #c4b5fd)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '2px 2px 8px rgba(124, 58, 237, 0.2)',
    marginBottom: 10,
  },
  subheading: {
    fontSize: '1.2rem',
    color: '#4b5563',
    marginBottom: 30,
  },
  textImportant: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 10,
  },
  text: {
    fontSize: '1rem',
    color: '#374151',
    marginBottom: 10,
  },
  formGroup: {
    marginTop: 25,
  },
  label: {
    display: 'block',
    marginBottom: 8,
    fontWeight: '500',
    color: '#374151',
  },
  inputFile: {
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
    border: '1px solid #d1d5db',
    width: '100%',
  },
  inputText: {
    padding: 10,
    borderRadius: 4,
    border: '1px solid #d1d5db',
    width: '100%',
  },
  fileList: {
    marginTop: 10,
  },
  fileName: {
    fontSize: '0.9rem',
    color: '#6b7280',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: 30,
    alignItems: 'center',
  },
  analyzeButton: {
    padding: '10px 20px',
    backgroundColor: '#7c3aed',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: '1rem',
  },
  searchInput: {
    width: '100%',
    padding: 10,
    marginBottom: 20,
    borderRadius: 6,
    border: '1px solid #cbd5e1',
  },
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottom: '2px solid #e5e7eb',
    fontSize: '0.95rem',
  },
  resultRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '0.95rem',
    color: '#374151',
  },
};

export default Dashboard;
