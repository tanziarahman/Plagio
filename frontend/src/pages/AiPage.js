import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiFile, FiCode, FiArrowLeft, FiCpu } from 'react-icons/fi';

const AiPage = ({ userEmail = "user@example.com" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Get data passed from ResultsPage
  const { files, analysisName, scanType, selectedFile } = location.state || { 
    files: [], 
    analysisName: 'Untitled Analysis', 
    scanType: 'ai',
    selectedFile: ''
  };

  // Mock data for AI content detection
  const [fileContents] = useState({
    'Essay.pdf': {
      content: `Artificial Intelligence in Modern Education

Introduction
Artificial Intelligence (AI) has revolutionized various sectors, and education is no exception. The integration of AI technologies in educational settings has transformed traditional teaching and learning methods, offering personalized learning experiences and efficient administrative processes.

AI-Powered Personalized Learning
One of the most significant contributions of AI in education is personalized learning. AI algorithms analyze students' learning patterns, strengths, and weaknesses to tailor educational content accordingly. This approach ensures that each student receives instruction at their own pace and level, enhancing comprehension and retention.

Intelligent Tutoring Systems
AI-driven tutoring systems provide students with immediate feedback and guidance. These systems simulate one-on-one tutoring sessions, addressing individual queries and explaining complex concepts in simplified manners. They adapt to each student's learning curve, making education more accessible and effective.

Automated Administrative Tasks
Educational institutions benefit from AI through the automation of administrative tasks. AI systems can handle grading, scheduling, and student enrollment, reducing the workload on educators and administrative staff. This automation allows teachers to focus more on teaching and student interaction.

Ethical Considerations
While AI offers numerous advantages, it also raises ethical concerns. Issues such as data privacy, algorithmic bias, and the digital divide need to be addressed to ensure equitable access to AI-powered education. It is crucial to develop ethical guidelines and policies to govern the use of AI in educational contexts.

Conclusion
AI has the potential to significantly enhance educational experiences by providing personalized learning, intelligent tutoring, and administrative automation. However, it is essential to address ethical concerns to maximize its benefits while minimizing potential drawbacks. The future of education lies in the balanced integration of AI technologies with human oversight.`,
      aiDetected: [
        { start: 0, end: 120, score: 92.5 },
        { start: 250, end: 420, score: 88.7 },
        { start: 550, end: 720, score: 95.2 },
        { start: 800, end: 950, score: 84.3 }
      ],
      overallAiScore: 89.8
    },
    'ResearchPaper.docx': {
      content: `The Impact of Machine Learning on Healthcare Diagnostics

Abstract
Machine learning (ML) algorithms have significantly advanced healthcare diagnostics by enabling early detection of diseases and improving treatment planning. This paper explores various ML applications in medical imaging, predictive analytics, and personalized medicine.

Introduction
Healthcare diagnostics have traditionally relied on manual interpretation of medical images and patient data. However, with the advent of machine learning, diagnostic processes have become more accurate and efficient. ML algorithms can analyze vast datasets to identify patterns that may be imperceptible to human eyes.

Applications in Medical Imaging
ML models, particularly deep learning networks, have demonstrated remarkable performance in analyzing medical images such as X-rays, MRIs, and CT scans. These models can detect abnormalities, classify diseases, and even predict disease progression with high accuracy.

Predictive Analytics for Patient Outcomes
Machine learning enables the prediction of patient outcomes based on historical data. By analyzing electronic health records, ML algorithms can identify risk factors and predict the likelihood of disease occurrence, complications, or recovery trajectories.

Personalized Treatment Plans
ML facilitates the development of personalized treatment plans by considering individual patient characteristics, genetic information, and response to previous treatments. This approach enhances treatment efficacy and reduces adverse effects.

Challenges and Future Directions
Despite its potential, the integration of ML in healthcare faces challenges such as data privacy concerns, model interpretability, and regulatory hurdles. Future research should focus on developing transparent, ethical, and robust ML systems for clinical use.

Conclusion
Machine learning has transformative potential in healthcare diagnostics, offering improvements in accuracy, efficiency, and personalization. Addressing existing challenges will be crucial for the widespread adoption of ML in clinical practice.`,
      aiDetected: [
        { start: 30, end: 180, score: 87.2 },
        { start: 300, end: 450, score: 91.5 },
        { start: 600, end: 750, score: 83.4 },
        { start: 850, end: 1000, score: 89.1 }
      ],
      overallAiScore: 87.8
    },
    'Thesis.txt': {
      content: `Blockchain Technology in Supply Chain Management

Introduction
Blockchain technology has emerged as a disruptive force in various industries, with supply chain management being one of the most promising application areas. This thesis examines how blockchain can enhance transparency, traceability, and efficiency in supply chains.

Background
Traditional supply chains often suffer from lack of transparency, inefficiencies, and vulnerability to fraud. Blockchain, as a distributed ledger technology, offers solutions to these challenges by providing an immutable and transparent record of transactions.

Enhanced Traceability
Blockchain enables end-to-end traceability of products throughout the supply chain. Each transaction or movement of goods is recorded on the blockchain, creating an auditable trail from raw material sourcing to final delivery.

Increased Transparency
All participants in a blockchain-based supply chain have access to the same information, reducing information asymmetry and building trust among stakeholders. This transparency helps in verifying the authenticity and provenance of products.

Smart Contracts for Automation
Smart contracts, self-executing contracts with terms directly written into code, can automate various supply chain processes such as payments, compliance checks, and inventory management, reducing administrative overhead.

Challenges and Limitations
Despite its potential, blockchain implementation in supply chains faces challenges including scalability issues, integration with existing systems, regulatory uncertainty, and the need for industry-wide standards.

Case Studies
This research includes case studies of companies that have implemented blockchain in their supply chains, analyzing the benefits realized and lessons learned from these implementations.

Conclusion
Blockchain technology holds significant promise for transforming supply chain management by enhancing transparency, traceability, and efficiency. However, addressing technical and regulatory challenges will be essential for its widespread adoption.`,
      aiDetected: [
        { start: 50, end: 220, score: 90.3 },
        { start: 350, end: 500, score: 85.6 },
        { start: 650, end: 800, score: 92.1 },
        { start: 900, end: 1050, score: 88.7 }
      ],
      overallAiScore: 89.2
    },
    '111.txt': {
      content: `This is the content of file 111.txt.
It contains some original text and some plagiarized content.
The quick brown fox jumps over the lazy dog. This sentence is commonly used for testing.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris.
This is another paragraph that might contain plagiarized material from various sources.
The quick brown fox jumps over the lazy dog appears again here for demonstration purposes.
This document has multiple sections that may match with other files in the database.
Plagiarism detection is an important tool for academic integrity.
Many institutions use software to identify copied content.`,
      aiDetected: [
        { start: 45, end: 118, score: 92.5 },
        { start: 119, end: 213, score: 78.3 },
        { start: 250, end: 320, score: 85.2 }
      ],
      overallAiScore: 85.3
    },
    '222.txt': {
      content: `This is the content of file 222.txt.
It contains text that matches with 111.txt in several places.
The quick brown fox jumps over the lazy dog. This sentence is commonly used for testing.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris.
Vivamus luctus urna sed urna ultricies ac tempor dui sagittis. In condimentum facilisis porta.
The quick brown fox jumps over the lazy dog appears again here for demonstration purposes.
Academic institutions take plagiarism very seriously.
Students should always cite their sources properly.
Using someone else's work without attribution is considered academic dishonesty.`,
      aiDetected: [
        { start: 50, end: 123, score: 92.5 },
        { start: 124, end: 218, score: 78.3 },
        { start: 280, end: 350, score: 81.7 }
      ],
      overallAiScore: 84.2
    },
    '333.txt': {
      content: `This is the content of file 333.txt.
It shares some common phrases with other documents.
The quick brown fox jumps over the lazy dog. This sentence is commonly used for testing.
Vivamus luctus urna sed urna ultricies ac tempor dui sagittis.
Plagiarism can have serious consequences for students and professionals.
Always ensure you properly attribute any sources you use in your work.
Academic integrity is fundamental to the educational process.`,
      aiDetected: [
        { start: 55, end: 128, score: 85.2 },
        { start: 129, end: 200, score: 81.7 }
      ],
      overallAiScore: 83.5
    }
  });

  // Initialize state with proper fallback values
  const initialSelectedFile = selectedFile || (files[0]?.name || '');
  
  const [currentSelectedFile, setCurrentSelectedFile] = useState(initialSelectedFile);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleNavigation = (page) => {
    if (page === 'scans') {
      navigate('/history');
    } else if (page === 'new-scan') {
      navigate('/plagio-dashboard');
    } else if (page === 'dashboard') {
      navigate('/plagio-dashboard');
    } else if (page === 'results') {
      navigate('/results', { state: { files, analysisName, scanType } });
    }
  };

  const getIconForType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (['c', 'cpp', 'js', 'java', 'py', 'html', 'css'].includes(extension)) {
      return <FiCode style={{ color: '#3498db' }} />;
    }
    return <FiFile style={{ color: '#3498db' }} />;
  };

  const highlightColors = [
    { background: '#FFD6E0', text: '#D32F2F' }, // Baby pink
    { background: '#D1ECF1', text: '#0C4B5E' }, // Baby blue
    { background: '#D4EDDA', text: '#155724' }, // Light green
    { background: '#FFF3CD', text: '#856404' }, // Light yellow
    { background: '#E8DAEF', text: '#4A235A' }, // Light purple
  ];

  const highlightAiContent = (content, aiDetections) => {
    if (!aiDetections.length) return content;
    
    let highlightedContent = [];
    let lastIndex = 0;
    
    // Sort detections by start index
    const sortedDetections = [...aiDetections].sort((a, b) => a.start - b.start);
    
    sortedDetections.forEach((detection, index) => {
      // Add non-highlighted text before the detection
      if (detection.start > lastIndex) {
        highlightedContent.push(content.slice(lastIndex, detection.start));
      }
      
      // Get color based on detection index (cycle through colors)
      const colorIndex = index % highlightColors.length;
      const color = highlightColors[colorIndex];
      
      // Add highlighted text
      highlightedContent.push(
        <span 
          key={detection.start} 
          style={{ 
            backgroundColor: color.background, 
            color: color.text, 
            padding: '2px 0',
            borderRadius: '3px',
            fontWeight: '500'
          }}
          title={`AI Score: ${detection.score.toFixed(1)}%`}
        >
          {content.slice(detection.start, detection.end)}
        </span>
      );
      
      lastIndex = detection.end;
    });
    
    // Add remaining text after the last detection
    if (lastIndex < content.length) {
      highlightedContent.push(content.slice(lastIndex));
    }
    
    return highlightedContent.length ? highlightedContent : content;
  };

  const styles = {
    dashboard: {
      display: 'flex',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f8fafc'
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
      textOverflow: 'ellipsis',
      cursor: 'pointer'
    },
    menuItem: {
      padding: '12px 20px',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    menuItemHover: {
      backgroundColor: '#34495e'
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
      marginTop: 'auto',
      borderBottomLeftRadius: '4px'
    },
    logoutButtonHover: {
      backgroundColor: '#c0392b'
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
      flexDirection: 'column',
      position: 'relative'
    },
    comparisonContainer: {
      display: 'flex',
      gap: '20px',
      flex: 1,
      marginBottom: '70px'
    },
    // Left panel - File content with AI highlights
    leftPanel: {
      flex: 3,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'white',
      borderRadius: '5px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    },
    fileHeader: {
      padding: '15px',
      backgroundColor: '#34495e',
      color: 'white',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    fileContent: {
      flex: 1,
      padding: '20px',
      overflowY: 'auto',
      fontFamily: 'monospace',
      whiteSpace: 'pre-wrap',
      lineHeight: '1.5',
      fontSize: '14px'
    },
    // Right panel - AI Score only
    rightPanel: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    },
    aiScoreBox: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '5px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      textAlign: 'center',
      height: 'fit-content'
    },
    aiScoreTitle: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#2c3e50',
      marginBottom: '10px'
    },
    aiScoreValue: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#dc2626',
      margin: '5px 0'
    },
    aiScoreLabel: {
      fontSize: '14px',
      color: '#64748b'
    },
    backButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 16px',
      backgroundColor: '#3498db',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'background-color 0.3s',
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      zIndex: 10
    },
    backButtonHover: {
      backgroundColor: '#2980b9'
    },
    noContentMessage: {
      textAlign: 'center',
      color: '#64748b',
      fontStyle: 'italic',
      padding: '20px'
    }
  };

  const currentFileContent = fileContents[currentSelectedFile] || { content: '', aiDetected: [], overallAiScore: 0 };

  return (
    <div style={styles.dashboard}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <button style={styles.sidebarCollapseButton} onClick={toggleSidebar}>
          {sidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
        
        <div>
          <div style={styles.logo} onClick={() => handleNavigation('dashboard')}>
            {sidebarCollapsed ? 'P' : 'PLAGIO'}
          </div>
          <div 
            style={styles.menuItem} 
            onMouseOver={(e) => e.target.style.backgroundColor = styles.menuItemHover.backgroundColor}
            onMouseOut={(e) => e.target.style.backgroundColor = ''}
            onClick={() => handleNavigation('new-scan')}
          >
            {sidebarCollapsed ? 'N' : 'New Scan'}
          </div>
          <div 
            style={styles.menuItem} 
            onMouseOver={(e) => e.target.style.backgroundColor = styles.menuItemHover.backgroundColor}
            onMouseOut={(e) => e.target.style.backgroundColor = ''}
            onClick={() => handleNavigation('scans')}
          >
            {sidebarCollapsed ? 'M' : 'My Scans'}
          </div>
        </div>
        
        <button 
          style={styles.logoutButton}
          onMouseOver={(e) => e.target.style.backgroundColor = styles.logoutButtonHover.backgroundColor}
          onMouseOut={(e) => e.target.style.backgroundColor = styles.logoutButton.backgroundColor}
        >
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
          {/* Comparison Container */}
          <div style={styles.comparisonContainer}>
            {/* Left Panel - File Content with AI Highlights */}
            <div style={styles.leftPanel}>
              <div style={styles.fileHeader}>
                {getIconForType(currentSelectedFile)}
                {currentSelectedFile}
              </div>
              <div style={styles.fileContent}>
                {currentFileContent.content ? (
                  highlightAiContent(
                    currentFileContent.content, 
                    currentFileContent.aiDetected
                  )
                ) : (
                  <div style={styles.noContentMessage}>
                    No content available for this file
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - AI Score Only */}
            <div style={styles.rightPanel}>
              {/* AI Score Box */}
              <div style={styles.aiScoreBox}>
                <div style={styles.aiScoreTitle}>AI-Generated Content</div>
                <FiCpu style={{ fontSize: '40px', color: '#dc2626', margin: '10px 0' }} />
                <div style={styles.aiScoreValue}>{currentFileContent.overallAiScore.toFixed(1)}%</div>
                <div style={styles.aiScoreLabel}>
                  of this content is AI-generated
                </div>
              </div>
            </div>
          </div>

          {/* Back Button at Bottom Left (outside the file content box) */}
          <button 
            style={styles.backButton}
            onMouseOver={(e) => e.target.style.backgroundColor = styles.backButtonHover.backgroundColor}
            onMouseOut={(e) => e.target.style.backgroundColor = styles.backButton.backgroundColor}
            onClick={() => handleNavigation('results')}
          >
            <FiArrowLeft />
            Back to Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiPage;