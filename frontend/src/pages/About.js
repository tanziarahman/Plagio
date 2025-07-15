import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div style={styles.container}>
      <div style={styles.nav}>
        <Link to="/" style={styles.logo}>Plagio</Link>
      </div>

      <div style={styles.content}>
        <h1 style={styles.title}>About Plagio</h1>
        
        <div style={styles.section}>
          <p style={styles.text}>
            Plagio is your intelligent document analysis platform designed to help writers, 
            educators, and professionals maintain content originality. Our core file similarity 
            feature provides detailed comparisons to ensure your work stays authentic.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.subtitle}>How File Similarity Works</h2>
          <div style={styles.featureCard}>
            <h3 style={styles.featureTitle}>→ Upload & Compare</h3>
            <p style={styles.text}>
              Simply upload your .txt or .docx files (2 or more) and our system will:
            </p>
            <ul style={styles.list}>
              <li>Analyze text content at the line level</li>
              <li>Identify matching lines in each file pair</li>
              <li>Calculate precise line level similarity percentages</li>
            </ul>
          </div>

          <div style={styles.featureCard}>
            <h3 style={styles.featureTitle}>→ Detailed Results</h3>
            <p style={styles.text}>
              Your comprehensive report includes:
            </p>
            <ul style={styles.list}>
              <li>Side-by-side document comparison</li>
              <li>Highlighted matching lines with numbers</li>
              <li>Similarity percentage for each file pair</li>
            </ul>
          </div>

          <div style={styles.featureCard}>
            <h3 style={styles.featureTitle}>→ Previous Analysis Management</h3>
            <p style={styles.text}>
              All your analyses are saved for future reference:
            </p>
            <ul style={styles.list}>
              <li>View previous comparisons</li>
              <li>Track changes over time</li>
              <li>Download reports when needed</li>
            </ul>
          </div>
        </div>

        <Link to="/" style={styles.backButton}>
          ← Back to Home
        </Link>
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
    `,
    fontFamily: "'Inter', sans-serif",
    display: 'flex',
    flexDirection: 'column',
  },
  nav: {
    padding: '2rem',
    borderBottom: '1px solid #e2e8f0',
  },
  logo: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#8757b5ff',
    textDecoration: 'none',
  },
  content: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem',
    flex: 1,
  },
  title: {
    fontSize: '2.5rem',
    color: '#2b2d42',
    marginBottom: '2rem',
  },
  subtitle: {
    fontSize: '1.5rem',
    color: '#4a5568',
    margin: '2rem 0 1rem 0',
    borderBottom: '2px solid #e2e8f0',
    paddingBottom: '0.5rem'
  },
  text: {
    color: '#4a5568',
    lineHeight: '1.6',
    marginBottom: '1.5rem',
  },
  list: {
    color: '#4a5568',
    lineHeight: '1.6',
    paddingLeft: '1.5rem',
    marginBottom: '1rem',
  },
  backButton: {
    display: 'inline-block',
    marginTop: '2rem',
    color: '#667eea',
    fontWeight: '600',
    textDecoration: 'none',
    ':hover': {
      textDecoration: 'underline',
    },
  },
  featureCard: {
    background: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  featureTitle: {
    color: '#667eea',
    margin: '0 0 1rem 0',
    fontSize: '1.2rem'
  }
};