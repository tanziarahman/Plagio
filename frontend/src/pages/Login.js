import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (location.state?.message) {
      setMessages([location.state.message]);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('http://localhost:5000/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, remember }),
    });

    const data = await response.json();
    console.log("Login response:", data);

    if (response.ok) {
      navigate('/dashboard');
    } else {
      setMessages([data.message || 'Login failed.']);
      setEmail('');
      setPassword('');
    }
  };

  return (
    <div style={styles.body}>
      <div style={styles.card}>
        <h3 style={styles.h3}>Sign in</h3>

        {messages.length > 0 &&
          messages.map((msg, idx) => (
            <div key={idx} style={styles.alert}>
              {msg}
            </div>
          ))}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>Email address</label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={{ ...styles.formGroup, position: 'relative' }}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              style={styles.togglePassword}
            >
              {showPassword ? '👁️‍🗨️' : '👁️'}
            </button>
          </div>

          <div style={styles.checkboxContainer}>
            <input
              type="checkbox"
              name="remember"
              id="remember"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              style={styles.checkbox}
            />
            <label htmlFor="remember" style={styles.checkboxLabel}>
              Remember me
            </label>
          </div>

          <button type="submit" style={styles.submitButton}>
            Login
          </button>

          <div style={styles.registerLink}>
            Don't have an account?{' '}
            <Link to="/register" style={styles.registerLinkText}>
              Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  body: {
    background: `
      linear-gradient(to bottom, 
        rgba(230, 240, 255, 0.3) 0%, 
        #f8f9fa 40%, 
        #f8f9fa 60%, 
        rgba(230, 240, 255, 0.8) 100%
    `,
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: '20px',
  },
  card: {
    borderRadius: '12px',
    backgroundColor: 'white',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    padding: '30px',
    width: '100%',
    maxWidth: '420px',
  },
  h3: {
    color: '#4b3e84',
    fontWeight: '600',
    marginBottom: '24px',
    textAlign: 'center',
    fontSize: '24px',
  },
  alert: {
    backgroundColor: '#fff3cd',
    color: '#856404',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '20px',
    border: '1px solid #ffeeba',
    fontSize: '14px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#495057',
  },
  input: {
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #ced4da',
    fontSize: '14px',
    transition: 'border-color 0.2s',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    ':focus': {
      borderColor: '#764ba2',
      boxShadow: '0 0 0 2px rgba(118, 75, 162, 0.2)',
    },
  },
  togglePassword: {
    position: 'absolute',
    right: '10px',
    top: '34px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
  },
  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '10px',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    accentColor: '#764ba2',
    cursor: 'pointer',
  },
  checkboxLabel: {
    fontSize: '14px',
    color: '#495057',
    cursor: 'pointer',
  },
  submitButton: {
    padding: '12px',
    backgroundColor: '#764ba2',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#5a3a7a',
    },
  },
  registerLink: {
    textAlign: 'center',
    fontSize: '14px',
    marginTop: '16px',
    color: '#495057',
  },
  registerLinkText: {
    color: '#764ba2',
    fontWeight: '500',
    textDecoration: 'none',
    ':hover': {
      textDecoration: 'underline',
    },
  },
};