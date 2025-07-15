import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const upload_id = queryParams.get('upload_id');

  const [userEmail, setUserEmail] = useState('');
  const [comparisons, setComparisons] = useState([]);
  const [groupedResults, setGroupedResults] = useState({});
  const [expandedFile, setExpandedFile] = useState(null);
  const [showMatchedLines, setShowMatchedLines] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!upload_id) {
      alert('Invalid or missing upload ID.');
      navigate('/dashboard');
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch('http://localhost:5000/dashboard', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setUserEmail(data.message?.split(',')[1] || '');
        } else {
          navigate('/login');
        }
      } catch {
        navigate('/login');
      }
    };

    const fetchComparisons = async () => {
      try {
        const res = await fetch(`http://localhost:5000/comparison?upload_id=${upload_id}`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok) {
          setComparisons(data.comparisons);
          const grouped = {};
          data.comparisons.forEach(comp => {
            if (!grouped[comp.file1]) grouped[comp.file1] = [];
            grouped[comp.file1].push(comp);
          });
          setGroupedResults(grouped);
        } else {
          alert(data.error || 'Failed to load comparisons.');
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    fetchComparisons();
  }, [upload_id, navigate]);

  const handleLogout = async () => {
    try {
      const res = await fetch('http://localhost:5000/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        navigate('/login');
      } else {
        alert('Logout failed.');
      }
    } catch {
      alert('Network error.');
    }
  };

  const toggleExpandFile = (fileName) => {
    setExpandedFile(prev => (prev === fileName ? null : fileName));
  };

  const toggleMatchedLines = (key) => {
    setShowMatchedLines(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.topbar}>
        <span style={styles.userEmail}>{userEmail}</span>
        <button style={styles.logoutButton} onClick={handleLogout}>Logout</button>
      </div>

      <div style={styles.container}>
        <h2 style={styles.heading}>Plagiarism Report</h2>
        {loading ? (
          <p>Loading...</p>
        ) : Object.keys(groupedResults).length === 0 ? (
          <p>No results available for this upload.</p>
        ) : (
          Object.entries(groupedResults).map(([file1, comparisons], idx) => (
            <div key={idx} style={styles.resultBox}>
              <div style={styles.resultHeader}>
                <span>{file1}</span>
                <button
                  onClick={() => toggleExpandFile(file1)}
                  style={styles.viewButton}
                >
                  {expandedFile === file1 ? 'Hide Results' : 'View Results'}
                </button>
              </div>

              {expandedFile === file1 && (
                <div style={styles.similaritySection}>
                  {comparisons.map((comp, subIdx) => {
                    const matchKey = `${file1}-${subIdx}`;
                    return (
                      <div key={subIdx} style={styles.similarityRow}>
                        <span>{comp.file1} vs {comp.file2}</span>
                        <span style={{ fontWeight: 600 }}>{comp.similarity}%</span>
                        <button
                          onClick={() => toggleMatchedLines(matchKey)}
                          style={styles.matchedLinesButton}
                        >
                          {showMatchedLines[matchKey]
                            ? 'Hide Matched Lines'
                            : 'Matched Lines'}
                        </button>
                        {showMatchedLines[matchKey] && (
                          <ul style={styles.matchedLinesList}>
                            {comp.matches.map((m, i) => (
                              <li key={i}>
                                Line {m.file1_line} ↔ Line {m.file2_line}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    fontFamily: 'Poppins, sans-serif',
    backgroundColor: '#f9fafb',
    minHeight: '100vh',
  },
  topbar: {
    background: 'linear-gradient(135deg, rgba(124,58,237,0.85), rgba(167,139,250,0.85))',
    padding: '12px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#fff',
  },
  userEmail: {
    fontWeight: '500',
  },
  logoutButton: {
    padding: '8px 16px',
    backgroundColor: '#7c3aed',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#fff',
  },
  container: {
    maxWidth: '900px',
    margin: '40px auto',
    padding: '0 20px',
  },
  heading: {
    fontSize: '1.6rem',
    fontWeight: '600',
    marginBottom: '20px',
    color: '#1e1b4b',
  },
  resultBox: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  viewButton: {
    backgroundColor: '#7c3aed',
    color: '#fff',
    padding: '6px 12px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  similaritySection: {
    marginTop: '10px',
    borderTop: '1px solid #e5e7eb',
    paddingTop: '10px',
  },
  similarityRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '16px',
    backgroundColor: '#f3f4f6',
    padding: '10px',
    borderRadius: '6px',
  },
  matchedLinesButton: {
    alignSelf: 'start',
    marginTop: '4px',
    backgroundColor: '#7c3aed',
    color: '#fff',
    border: 'none',
    padding: '4px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  matchedLinesList: {
    marginTop: '10px',
    paddingLeft: '20px',
    color: '#4b5563',
  },
};

export default ResultPage;







