import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  const handleGetStarted = async () => {
    try {
      const res = await fetch('http://localhost:5000/dashboard', {
        method: 'GET',
        credentials: 'include',
      });
      navigate(res.ok ? '/dashboard' : '/login');
    } catch (err) {
      navigate('/login');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.nav}>
        <div style={styles.logo}>PLAGIO</div>
      </div>

      <div style={styles.mainContent}>
        <h1 style={styles.title}>Comprehensive Plagiarism Detection</h1>
        <p style={styles.subtitle}>
          Analyze documents, code, and content for originality with our plagiarism detection system
        </p>

        <div style={styles.buttons}>
          <button 
            style={styles.primaryButton}
            onClick={handleGetStarted}
          >
            Get Started
          </button>
          <Link to="/about" style={styles.secondaryButton}>
            Learn More
          </Link>
        </div>
      </div>

      <div style={styles.footer}>
        <p style={styles.footerText}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.link}>
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
    container: {
    minHeight: '100vh',
    background: `
      linear-gradient(to bottom, 
        rgba(230, 240, 255, 0.3) 0%, 
        #f8f9fa 40%, 
        #f8f9fa 60%, 
        rgba(230, 240, 255, 0.8) 100%
      )
    `,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    display: 'flex',
    flexDirection: 'column',
    padding: '2rem',
    position: 'relative',
    overflow: 'hidden',
  },

  nav: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '4rem',
  },
  logo: {
    fontSize: '4rem',          
    fontWeight: '700',          
    color: '#8c5abaff',
    textAlign: 'center',
    fontFamily: "'Montserrat', sans-serif", 
    letterSpacing: '-0.03em',   
    margin: '0.5rem 0'
  },
  navLink: {
    color: '#2b2d42',
    textDecoration: 'none',
    fontWeight: '500',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#e9ecef',
    },
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#2b2d42',
    marginBottom: '1.5rem',
    lineHeight: '1.3',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#6c757d',
    marginBottom: '3rem',
    lineHeight: '1.6',
    maxWidth: '600px',
  },
  buttons: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '3rem',
  },
  primaryButton: {
    background: 'linear-gradient(45deg, #764ba2, #667eea)',
    color: 'white',
    border: 'none',
    padding: '0.8rem 1.8rem',
    fontSize: '1rem',
    fontWeight: '500',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      background: '#3a56d4',
      transform: 'translateY(-1px)',
    },
  },
  secondaryButton: {
    background: 'transparent',
    color: '#4361ee',
    border: '1px solid #4361ee',
    padding: '0.8rem 1.8rem',
    fontSize: '1rem',
    fontWeight: '500',
    borderRadius: '6px',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'all 0.2s',
    ':hover': {
      background: '#f8f9fa',
      transform: 'translateY(-1px)',
    },
  },
  footer: {
    marginTop: 'auto',
    textAlign: 'center',
    padding: '1rem',
  },
  footerText: {
    color: '#6c757d',
    fontSize: '0.9rem',
  },
  link: {
    color: '#4361ee',
    fontWeight: '500',
    textDecoration: 'none',
    ':hover': {
      textDecoration: 'underline',
    },
  },
};