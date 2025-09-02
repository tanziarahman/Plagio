import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import plagio from '../images/plagio.jpeg';

export default function Home() {
  const navigate = useNavigate();

  const handleGetStarted = async () => {
    try {
      const res = await fetch('http://localhost:5000/dashboard', {
        method: 'GET',
        credentials: 'include',
      });
      navigate(res.ok ? '/plagio-dashboard' : '/login');
    } catch (err) {
      navigate('/login');
    }
  };

  return (
    <div style={styles.container}>
      {/* Top Navigation Bar */}
      <nav style={styles.navbar}>
        <div style={styles.logo}>PLAGIO</div>
        <div style={styles.navLinks}>
          <Link to="/about" style={styles.navLink}>Learn More</Link>
          <Link to="/login" style={styles.navLink}>Login</Link>
          <Link to="/register" style={styles.navButton}>Sign Up</Link>
        </div>
      </nav>

      {/* Main Content - Split Layout */}
      <div style={styles.mainSection}>
        <div style={styles.leftColumn}>
          <img 
            src={plagio}
            alt="Plagiarism Detection" 
            style={styles.image}
          />
        </div>
        <div style={styles.rightColumn}>
          <h1 style={styles.title}>Comprehensive Plagiarism Detection</h1>
          <p style={styles.subtitle}>
            Analyze documents, code, and content for originality with our plagiarism detection system. Ensure integrity with our powerful tools.
          </p>
          <div style={styles.buttons}>
            <button 
              style={styles.primaryButton}
              onClick={handleGetStarted}
            >
              Get Started
            </button>
          </div>
        </div>
      </div>

      {/* Feature Boxes */}
      <div style={styles.featuresContainer}>
        <div style={styles.features}>
          <div style={styles.featureBox}>
            <div style={styles.featureIcon}>📄</div>
            <h3 style={styles.featureTitle}>Compare Documents</h3>
            <p style={styles.featureText}>Easily compare multiple documents to identify similarities and potential plagiarism.</p>
          </div>
          <div style={styles.featureBox}>
            <div style={styles.featureIcon}>💻</div>
            <h3 style={styles.featureTitle}>Code Detection</h3>
            <p style={styles.featureText}>Specialized detection for source code to identify plagiarism in multiple programming languages.</p>
          </div>
          <div style={styles.featureBox}>
            <div style={styles.featureIcon}>🤖</div>
            <h3 style={styles.featureTitle}>AI Detection</h3>
            <p style={styles.featureText}>Detect AI-generated text and ensure content authenticity with our comprehensive verification system.</p>
          </div>
        </div>
      </div>

      {/* Footer - Simplified for University Project */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <p style={styles.copyright}>© 2025 PLAGIO - Plagiarism Checker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflowX: 'hidden',
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: 'white',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  logo: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#4361ee',
    fontFamily: "'Montserrat', sans-serif",
    letterSpacing: '-0.03em',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  navLink: {
    color: '#4a4a4a',
    textDecoration: 'none',
    fontWeight: '500',
    padding: '0.5rem 0',
    position: 'relative',
    transition: 'all 0.2s ease',
  },
  navButton: {
    background: '#4361ee',
    color: 'white',
    textDecoration: 'none',
    fontWeight: '500',
    padding: '0.5rem 1.2rem',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
  },
  mainSection: {
    display: 'flex',
    flexDirection: 'row',
    minHeight: '70vh',
    padding: '2rem',
    backgroundColor: '#f8f9fa',
  },
  leftColumn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  rightColumn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '2rem',
  },
  image: {
    width: '100%',
    maxWidth: '500px',
    borderRadius: '10px',
    boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#2b2d42',
    marginBottom: '1.5rem',
    lineHeight: '1.2',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#6c757d',
    marginBottom: '2.5rem',
    lineHeight: '1.6',
    maxWidth: '500px',
  },
  buttons: {
    display: 'flex',
    gap: '1.5rem',
  },
  primaryButton: {
    background: '#4361ee',
    color: 'white',
    border: 'none',
    padding: '1rem 2.5rem',
    fontSize: '1.1rem',
    fontWeight: '600',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 10px rgba(67, 97, 238, 0.3)',
  },
  featuresContainer: {
    backgroundColor: 'white',
    padding: '4rem 2rem',
  },
  features: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  featureBox: {
    flex: '1',
    minWidth: '250px',
    maxWidth: '350px',
    backgroundColor: '#f8f9fa',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
    textAlign: 'center',
    transition: 'all 0.3s ease',
  },
  featureIcon: {
    fontSize: '2.5rem',
    marginBottom: '1.5rem',
  },
  featureTitle: {
    fontSize: '1.3rem',
    fontWeight: '600',
    color: '#2b2d42',
    marginBottom: '1rem',
  },
  featureText: {
    color: '#6c757d',
    lineHeight: '1.6',
  },
  footer: {
    backgroundColor: '#2b2d42',
    padding: '3rem 2rem 1rem',
    color: 'white',
  },
  footerContent: {
    display: 'flex',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: '2rem',
    maxWidth: '1200px',
    margin: '0 auto 2rem',
  },
  footerSection: {
    flex: 1,
    minWidth: '200px',
  },
  footerTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: 'white',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: '1.6',
    marginBottom: '1rem',
  },
  footerLink: {
    display: 'block',
    color: 'rgba(255, 255, 255, 0.7)',
    textDecoration: 'none',
    marginBottom: '0.5rem',
    transition: 'all 0.2s ease',
  },
  footerBottom: {
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    paddingTop: '1.5rem',
    textAlign: 'center',
  },
  copyright: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '0.9rem',
    margin: 0,
  },
};

// Add hover effects
const addHoverEffects = () => {
  const style = document.createElement('style');
  style.textContent = `
    .nav-link:hover {
      color: #4361ee;
    }
    .nav-button:hover {
      background: #3a56d4;
    }
    .primary-button:hover {
      background: #3a56d4;
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(67, 97, 238, 0.4);
    }
    .feature-box:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }
    .footer-link:hover {
      color: white;
    }
  `;
  document.head.appendChild(style);
};


addHoverEffects();