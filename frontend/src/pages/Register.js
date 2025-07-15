import React, { useState } from 'react';
import { useNavigate,Link } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('http://localhost:5000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.status === 201) {
      navigate('/login', { state: { message: 'Account created successfully. Please login.' } });
    } else {
      setMessages([data.message || 'Registration failed.']);
      setEmail('');
      setPassword('');
    }
  };

  return (
    <div style={styles.body}>
      <div style={styles.card}>
        <h3 style={styles.h3}>Create Account</h3>

        {messages.length > 0 &&
          messages.map((msg, idx) => (
            <div key={idx} className="alert alert-warning" style={styles.alert}>
              {msg}
            </div>
          ))}

        <form onSubmit={handleSubmit}>
          <div className="form-floating mb-3">
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Email"
              className="form-control"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.formControl}
            />
            <label htmlFor="email">Email address</label>
          </div>

          <div className="form-floating mb-3">
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Password"
              className="form-control"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.formControl}
            />
            <label htmlFor="password">Password</label>
          </div>

          <div className="d-grid mb-3">
            <button type="submit" className="btn btn-dark" style={styles.btnDark}>
              Register
            </button>
          </div>

          <div className="text-center small">
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#764ba2', fontWeight: 600, textDecoration: 'none' }}>
              Login
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
  },
  card: {
    borderRadius: '1rem',
    background: 'linear-gradient(145deg, #ffffffdd, #f1f3f5dd)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '400px',
  },
  h3: {
    color: '#4b3e84',
    fontWeight: 700,
    marginBottom: '2rem',
    textAlign: 'center',
    letterSpacing: '1.2px',
  },
  formControl: {
    borderRadius: '0.5rem',
    border: '1.5px solid #ccc',
    transition: 'border-color 0.3s ease',
    outline: 'none',
  },
  alert: {
    fontSize: '0.9rem',
    borderRadius: '0.5rem',
    marginBottom: '1rem',
  },
  btnDark: {
    background: 'linear-gradient(45deg, #764ba2, #667eea)',
    border: 'none',
    fontWeight: 600,
    transition: 'background 0.3s ease',
    borderRadius: '0.5rem',
  },
};
