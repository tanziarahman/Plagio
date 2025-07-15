import React, { useState } from 'react';
import { useNavigate,useLocation,Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false); // <-- Added this line
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
      body: JSON.stringify({ email, password, remember }), // sending remember if you want to handle it backend
    });

    const data = await response.json();
    console.log("Login response:", data);

    if (response.ok) {
      // Login successful → go to dashboard
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

          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              name="remember"
              id="remember"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <label className="form-check-label small" htmlFor="remember" style={{ color: '#6c6c80' }}>
              Remember me
            </label>
          </div>

          <div className="d-grid mb-3">
            <button type="submit" className="btn btn-dark" style={styles.btnDark}>
              Login
            </button>
          </div>

          <div className="text-center small">
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#764ba2', fontWeight: 600, textDecoration: 'none' }}>
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
    // background: 'linear-gradient(to right, #3f87a6, #ebf8e1, #f69d3c)',
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
    padding: '2rem',
    width: '100%',
    maxWidth: '400px',
  },
  h3: {
    color: '#4b3e84',
    fontWeight: 700,
    marginBottom: '1.5rem',
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
