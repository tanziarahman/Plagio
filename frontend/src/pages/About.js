import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div style={styles.container}>
      {/* Top Navigation Bar */}
      <nav style={styles.navbar}>
        <div style={styles.logo}>PLAGIO</div>
        <div style={styles.navLinks}>
          <Link to="/" style={styles.navLink}>Home</Link>
          <Link to="/login" style={styles.navLink}>Login</Link>
          <Link to="/register" style={styles.navButton}>Sign Up</Link>
        </div>
      </nav>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Hero Section */}
        {/* <div style={styles.heroSection}>
          <h1 style={styles.heroTitle}>About Plagio</h1>
          <p style={styles.heroSubtitle}>
            Discover how our powerful plagiarism detection system works and how it can help you maintain integrity in your work
          </p>
        </div> */}

        {/* Overview Section */}
        <section style={styles.overviewSection}>
          <div style={styles.sectionContent}>
            <h2 style={styles.sectionTitle}>What is Plagio?</h2>
            <p style={styles.sectionText}>
              Plagio is a comprehensive plagiarism detection system designed to help educators, 
              students, and content creators ensure the originality of their work. Our advanced 
              system analyze text and code to identify similarities and potential plagiarism 
              across multiple sources.
            </p>
            <p style={styles.sectionText}>
              With support for various file formats and programming languages, Plagio provides 
              detailed reports that highlight matching content, making it easier to maintain 
              academic and professional integrity.
            </p>
          </div>
        </section>

        {/* Get Started Section */}
        <section style={styles.getStartedSection}>
          <div style={styles.sectionContent}>
            <h2 style={styles.sectionTitle}>Get Started with Plagio</h2>
            <p style={styles.sectionText}>
              If you're new to Plagio, sign up for free and begin your journey toward ensuring 
              content originality. Our intuitive platform makes it easy to upload documents, 
              analyze content, and review detailed results.
            </p>
            <p style={styles.sectionText}>
              Start your journey today with Plagio to maintain academic 
              integrity and promote original work.
            </p>
            <div style={styles.buttons}>
              <Link to="/register" style={styles.primaryButton}>
                Sign Up for Free
              </Link>
            </div>
          </div>
        </section>

        {/* Features Boxes */}
        <section style={styles.featuresSection}>
          <div style={styles.sectionContent}>
            <h2 style={styles.sectionTitle}>Key Features</h2>
            <div style={styles.features}>
              <div style={styles.featureBox}>
                <div style={styles.featureIcon}>📄</div>
                <h3 style={styles.featureTitle}>Upload and Compare Documents/Code</h3>
                <p style={styles.featureText}>
                  Easily upload multiple files in various formats and compare them for similarities 
                  with our powerful detection system.
                </p>
              </div>
              <div style={styles.featureBox}>
                <div style={styles.featureIcon}>🔍</div>
                <h3 style={styles.featureTitle}>Get Detailed Results with Highlighted Lines</h3>
                <p style={styles.featureText}>
                  Receive comprehensive reports that highlight matching content, making it easy to 
                  identify potential plagiarism and similarities.
                </p>
              </div>
              <div style={styles.featureBox}>
                <div style={styles.featureIcon}>📊</div>
                <h3 style={styles.featureTitle}>View Your Previous Scans</h3>
                <p style={styles.featureText}>
                  Access your scan history anytime to review previous results, track progress, and 
                  manage your documents efficiently.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* File/AI Similarity Detection */}
        <section style={styles.detectionSection}>
          <div style={styles.sectionContent}>
            <h2 style={styles.sectionTitle}>How File/AI Similarity Detection Works</h2>
            <div style={styles.process}>
              <div style={styles.processStep}>
                <div style={styles.stepNumber}>1</div>
                <div style={styles.stepContent}>
                  <h3 style={styles.stepTitle}>Upload Files</h3>
                  <p style={styles.stepText}>
                    Upload multiple .txt, .docx, or .pdf files (text based only) to the platform.
            
                  </p>
                </div>
              </div>
              <div style={styles.processStep}>
                <div style={styles.stepNumber}>2</div>
                <div style={styles.stepContent}>
                  <h3 style={styles.stepTitle}>Initiate Scan</h3>
                  <p style={styles.stepText}>
                    Simply click on the scan button to begin the analysis process.
                  </p>
                </div>
              </div>
              <div style={styles.processStep}>
                <div style={styles.stepNumber}>3</div>
                <div style={styles.stepContent}>
                  <h3 style={styles.stepTitle}>Get Detailed Results</h3>
                  <p style={styles.stepText}>
                    Receive comprehensive results highlighting similarities and potential matches.
                  </p>
                </div>
              </div>
              <div style={styles.processStep}>
                <div style={styles.stepNumber}>4</div>
                <div style={styles.stepContent}>
                  <h3 style={styles.stepTitle}>Results Saved</h3>
                  <p style={styles.stepText}>
                    All scan results are automatically saved in the system for future reference.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Code Similarity Detection */}
        <section style={styles.detectionSection}>
          <div style={styles.sectionContent}>
            <h2 style={styles.sectionTitle}>How Code Similarity Detection Works</h2>
            <div style={styles.process}>
              <div style={styles.processStep}>
                <div style={styles.stepNumber}>1</div>
                <div style={styles.stepContent}>
                  <h3 style={styles.stepTitle}>Upload Code Files</h3>
                  <p style={styles.stepText}>
                    Upload multiple .c, .cpp, .py, .java source code files.
                  </p>
                </div>
              </div>
              <div style={styles.processStep}>
                <div style={styles.stepNumber}>2</div>
                <div style={styles.stepContent}>
                  <h3 style={styles.stepTitle}>Initiate Analysis</h3>
                  <p style={styles.stepText}>
                    Start the specialized code analysis with a single click.
                    Detect similarities through semantic analysis.
                  </p>
                </div>
              </div>
              <div style={styles.processStep}>
                <div style={styles.stepNumber}>3</div>
                <div style={styles.stepContent}>
                  <h3 style={styles.stepTitle}>Receive Code-specific Results</h3>
                  <p style={styles.stepText}>
                    Get detailed reports highlighting code similarities and potential matches.
                  </p>
                </div>
              </div>
              <div style={styles.processStep}>
                <div style={styles.stepNumber}>4</div>
                <div style={styles.stepContent}>
                  <h3 style={styles.stepTitle}>Results Saved</h3>
                  <p style={styles.stepText}>
                    All code analysis results are stored for convenient access and comparison.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
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
    backgroundColor: '#f8f9fa',
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
  mainContent: {
    flex: 1,
    padding: '0 0 3rem',
  },
  heroSection: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '4rem 2rem',
    textAlign: 'center',
  },
  heroTitle: {
    fontSize: '3rem',
    fontWeight: '800',
    marginBottom: '1rem',
    fontFamily: "'Montserrat', sans-serif",
  },
  heroSubtitle: {
    fontSize: '1.2rem',
    maxWidth: '600px',
    margin: '0 auto',
    opacity: 0.9,
    lineHeight: 1.6,
  },
  overviewSection: {
    padding: '5rem 2rem',
    backgroundColor: 'white',
  },
  getStartedSection: {
    padding: '5rem 2rem',
    backgroundColor: '#f8f9fa',
  },
  featuresSection: {
    padding: '5rem 2rem',
    backgroundColor: 'white',
  },
  detectionSection: {
    padding: '5rem 2rem',
    backgroundColor: '#f0f4ff',
  },
  sectionContent: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  sectionTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#2b2d42',
    marginBottom: '2rem',
    textAlign: 'center',
    fontFamily: "'Montserrat', sans-serif",
  },
  sectionText: {
    fontSize: '1.1rem',
    color: '#6c757d',
    lineHeight: '1.8',
    marginBottom: '1.5rem',
    maxWidth: '800px',
    marginLeft: 'auto',
    marginRight: 'auto',
    textAlign: 'center',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '2.5rem',
  },
  primaryButton: {
    background: '#4361ee',
    color: 'white',
    textDecoration: 'none',
    padding: '1rem 2.5rem',
    fontSize: '1.1rem',
    fontWeight: '600',
    borderRadius: '4px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 10px rgba(67, 97, 238, 0.3)',
  },
  features: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '2.5rem',
    marginTop: '3rem',
  },
  featureBox: {
    flex: '1',
    minWidth: '280px',
    maxWidth: '350px',
    backgroundColor: 'white',
    padding: '2.5rem 2rem',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    border: '1px solid rgba(67, 97, 238, 0.1)',
  },
  featureIcon: {
    fontSize: '3rem',
    marginBottom: '1.5rem',
  },
  featureTitle: {
    fontSize: '1.4rem',
    fontWeight: '600',
    color: '#2b2d42',
    marginBottom: '1rem',
  },
  featureText: {
    color: '#6c757d',
    lineHeight: '1.6',
  },
  process: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
    marginTop: '3rem',
  },
  processStep: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1.5rem',
  },
  stepNumber: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: '#4361ee',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    flexShrink: 0,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#2b2d42',
    marginBottom: '0.5rem',
  },
  stepText: {
    color: '#6c757d',
    lineHeight: '1.6',
  },
  footer: {
    backgroundColor: '#2b2d42',
    padding: '2rem',
    color: 'white',
    marginTop: 'auto',
  },
  footerContent: {
    display: 'flex',
    justifyContent: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  copyright: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.9rem',
    margin: 0,
  },
};

// Add hover effects
const addHoverEffects = () => {
  const style = document.createElement('style');
  style.textContent = `
    a[style*="navLink"]:hover {
      color: #4361ee !important;
    }
    a[style*="navButton"]:hover {
      background: #3a56d4 !important;
    }
    a[style*="primaryButton"]:hover {
      background: #3a56d4 !important;
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(67, 97, 238, 0.4) !important;
    }
    div[style*="featureBox"]:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1) !important;
    }
  `;
  document.head.appendChild(style);
};

addHoverEffects();