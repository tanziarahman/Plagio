import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    verificationCode: ''
  });
  const [errors, setErrors] = useState({
    email: false,
    password: false,
    verificationCode: false,
    message: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData(prev => ({
  //     ...prev,
  //     [name]: value
  //   }));
    
  //   // Special handling for password field
  //   if (name === 'password') {
  //     const isPasswordValid = value.length >= 8 && value.length <= 20;
  //     setErrors(prev => ({
  //       ...prev,
  //       password: value ? !isPasswordValid : false,
  //       message: ''
  //     }));
  //   } else {
  //     // Clear error when typing other fields
  //     setErrors(prev => ({
  //       ...prev,
  //       [name]: false,
  //       message: ''
  //     }));
  //   }
  // };

const handleChange = (e) => {
  const { name, value } = e.target;
  
  // Update form data exactly as typed
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));

  // Password validation (unchanged)
  if (name === 'password') {
    const isPasswordValid = value.length >= 8 && value.length <= 20;
    setErrors(prev => ({
      ...prev,
      password: value ? !isPasswordValid : false,
      message: ''
    }));
  } 
  // Email validation - check for capitals but don't auto-fix
  // else if (name === 'email') {
  //   const hasUppercase = /[A-Z]/.test(value);
  //   const isValidFormat = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
    
  //   setErrors(prev => ({
  //     ...prev,
  //     email: hasUppercase || !isValidFormat,
  //     emailMessage: hasUppercase 
  //       ? 'Email must be in lowercase letters' 
  //       : !isValidFormat ? 'Invalid email format' : ''
  //   }));
  // }
  
  else {
    setErrors(prev => ({
      ...prev,
      [name]: false,
      message: ''
    }));
  }
};
  // const validateFields = () => {
  //   const isPasswordValid = formData.password.length >= 8 && formData.password.length <= 20;
    
  //   const newErrors = {
  //     email: !formData.email,
  //     password: !formData.password || !isPasswordValid,
  //     verificationCode: !formData.verificationCode,
  //     message: ''
  //   };

  // if (newErrors.email) {
  //   newErrors.message = 'Email is required';
  // } else if (newErrors.verificationCode) {
  //   newErrors.message = 'Verification code is required';
  // } else if (newErrors.password) {
  //   newErrors.message = !formData.password 
  //     ? 'Password is required' 
  //     : !isPasswordValid 
  //       ? (formData.password.length < 8 
  //           ? 'Password must be at least 8 characters' 
  //           : 'Password cannot exceed 20 characters')
  //       : '';
  // }
  
    
  //   setErrors(newErrors);
  //   return !Object.values(newErrors).some(error => error);
  // };

  const validateFields = () => {
    const isPasswordValid = formData.password.length >= 8 && formData.password.length <= 20;
  
  const newErrors = {
    email: !formData.email,
    password: !formData.password || !isPasswordValid,
    verificationCode: !formData.verificationCode || !isCodeSent, // Check both code existence and if it was sent
    message: '',
    emailMessage: !formData.email ? 'Email is required' : '',
    verificationMessage: !formData.verificationCode 
      ? 'Verification code is required'
      : !isCodeSent
        ? 'Invalid verification code'
        : 'Invalid verification code',
    passwordMessage: !formData.password 
      ? 'Password is required' 
      : !isPasswordValid 
        ? (formData.password.length < 8 
            ? 'Password must be at least 8 characters' 
            : 'Password cannot exceed 20 characters')
        : ''
  };
  // Set the general message to the first error encountered
  if (newErrors.email) {
    newErrors.message = newErrors.emailMessage;
  } else if (newErrors.verificationCode) {
    newErrors.message = newErrors.verificationMessage;
  } else if (newErrors.password) {
    newErrors.message = newErrors.passwordMessage;
  }

  setErrors(newErrors);
  return !Object.values({
    email: newErrors.email,
    password: newErrors.password,
    verificationCode: newErrors.verificationCode
  }).some(error => error);
};

  // const handleSendCode = async (e) => {
  //   e.preventDefault();
    
  //   if (!formData.email) {
  //     setErrors({ ...errors, email: true, message: 'Email is required' });
  //     return;
  //   }

  //   try {
  //     const response = await fetch('http://localhost:5000/send-code', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ email: formData.email }),
  //     });

  //     const data = await response.json();

  //     if (!response.ok) {
  //       setErrors({ ...errors, email: true, message: data.message || 'Failed to send code' });
  //       return;
  //     }

  //     setIsCodeSent(true);
  //     setErrors({ ...errors, email: false, message: '' });
  //   } catch (error) {
  //     setErrors({ ...errors, email: true, message: 'Network error. Please try again.' });
  //   }
  // };

const handleSendCode = async (e) => {
  e.preventDefault();

  if (/[A-Z]/.test(formData.email)) {
    setErrors({ 
      email: true, 
      emailMessage: 'Email must be in lowercase letters',
      verificationCode: false
    });
    return;
  }

  if (!formData.email) {
    setErrors({ 
      email: true, 
      emailMessage: 'Email is required',
      verificationCode: false
    });
    return;
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
    setErrors({ 
      email: true, 
      emailMessage: 'Invalid email format',
      verificationCode: false
    });
    return;
  }
  
  try {
    const response = await fetch('http://localhost:5000/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: formData.email }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Improved error message handling
      let errorMessage = 'Failed to send verification code';
      if (data.message) {
        errorMessage = data.message.toLowerCase().includes('domain') 
          ? 'Please enter an email with a valid domain'
          : data.message;
      } else if (data.Message) { // Some APIs use Message with capital M
        errorMessage = data.Message.toLowerCase().includes('domain')
          ? 'Please enter an email with a valid domain'
          : data.Message;
      }
      
      setErrors({ 
        email: true, 
        emailMessage: errorMessage,
        verificationCode: false
      });
      return;
    }

    // Success case
    setIsCodeSent(true);
    setErrors({ 
      email: false, 
      emailMessage: '',
      verificationCode: false 
    });
  } catch (error) {
    setErrors({ 
      email: true, 
      emailMessage: 'Network error. Please try again.',
      verificationCode: false
    });
  }
};
  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateFields()) return;

  setIsSubmitting(true);

  try {
    const response = await fetch('http://localhost:5000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
        code: formData.verificationCode
      }),
    });

    const data = await response.json();

    if (response.status === 201) {
      navigate('/plagio-dashboard');
    } else {
      setErrors({
        ...errors,
        verificationCode: true,
        verificationMessage: data.message || 'Invalid verification code'
      });
    }
  } catch (error) {
    setErrors({
      ...errors,
      verificationCode: true,
      verificationMessage: 'Network error. Please try again.'
    });
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div style={styles.body}>
      <div style={styles.card}>
        <h3 style={styles.h3}>Create Account</h3>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>Email address</label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              style={{
                ...styles.input,
                borderColor: errors.email ? '#dc3545' : '#ced4da',
              }}
              placeholder="Enter your email"
            />
            {errors.email && (
              <div style={styles.errorContainer}>
                <svg style={styles.errorIcon} viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                </svg>
                <span style={styles.errorText}>{errors.emailMessage}</span>
              </div>
            )}
          </div>

          <div style={{ ...styles.formGroup, position: 'relative' }}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              style={{
                ...styles.input,
                borderColor: errors.password ? '#dc3545' : '#ced4da',
              }}
              placeholder="Enter your password (8-20 characters)"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              style={styles.togglePassword}
            >
              {showPassword ? '👁️‍🗨️' : '👁️'}
            </button>
            {errors.password && (
              <div style={styles.errorContainer}>
                <svg style={styles.errorIcon} viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                </svg>
                <span style={styles.errorText}>
                  {!formData.password ? 'Password is required' : 
                   formData.password.length < 8 ? 'Password must be at least 8 characters' :
                   'Password cannot exceed 20 characters'}
                </span>
              </div>
            )}
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="verificationCode" style={styles.label}>Verification Code</label>
            <div style={styles.codeContainer}>
              <input
                type="text"
                name="verificationCode"
                id="verificationCode"
                value={formData.verificationCode}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  borderColor: errors.verificationCode ? '#dc3545' : '#ced4da',
                  flex: 1,
                }}
                placeholder="Enter 6-digit code"
              />
              <button
                type="button"
                onClick={handleSendCode}
                style={{
                  ...styles.sendCodeButton,
                  backgroundColor: isCodeSent ? '#e9ecef' : '#f8f9fa',
                  color: isCodeSent ? '#6c757d' : '#4b6ac6ff',
                  borderColor: isCodeSent ? '#dee2e6' : '#4b6ac6ff',
                  cursor: isCodeSent ? 'not-allowed' : 'pointer'
                }}
                disabled={isCodeSent}
              >
                {isCodeSent ? 'Sent' : 'Send Code'}
              </button>
            </div>
            {errors.verificationCode && (
              <div style={styles.errorContainer}>
                <svg style={styles.errorIcon} viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                </svg>
                <span style={styles.errorText}>{errors.verificationMessage}</span>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            style={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Register'}
          </button>

          <div style={styles.loginLinkContainer}>
            Already have an account?{' '}
            <Link to="/login" style={styles.loginLink}>
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
    color: '#4b6ac6ff',
    fontWeight: '600',
    marginBottom: '24px',
    textAlign: 'center',
    fontSize: '24px',
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
  },
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '4px',
  },
  errorIcon: {
    width: '16px',
    height: '16px',
    fill: '#dc3545',
    marginRight: '6px',
  },
  errorText: {
    color: '#dc3545',
    fontSize: '13px',
    fontWeight: '400',
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
  codeContainer: {
    display: 'flex',
    gap: '10px',
  },
  sendCodeButton: {
    padding: '0 16px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #5064a1ff',
    color: '#4b6ac6ff',
    borderRadius: '6px',
    fontWeight: '500',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
    ':hover': {
      backgroundColor: '#4b6ac6ff',
      color: 'white',
    },
  },
  submitButton: {
    padding: '12px',
    backgroundColor: '#4b6ac6ff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginTop: '10px',
    ':hover': {
      backgroundColor: '#5a3a7a',
    },
    ':disabled': {
      backgroundColor: '#a78bc1',
      cursor: 'not-allowed',
    },
  },
  loginLinkContainer: {
    textAlign: 'center',
    fontSize: '14px',
    marginTop: '16px',
    color: '#495057',
  },
  loginLink: {
    color: '#4b6ac6ff',
    fontWeight: '500',
    textDecoration: 'none',
    ':hover': {
      textDecoration: 'underline',
    },
  },
};