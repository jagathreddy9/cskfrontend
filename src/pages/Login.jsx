import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ 
    role: 'Learner',
    collegeEmail: '', 
    password: '' 
  });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Forgot Password States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);

  const { role, collegeEmail, password } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collegeEmail, password, role })
      });
      
      const contentType = res.headers.get('content-type');
      const data = (contentType && contentType.includes('application/json')) ? await res.json() : null;
      
      if (res.ok) {
        login(data.user, data.token);
        navigate('/dashboard'); 
      } else {
        setError(data?.msg || 'Login failed. Please check your credentials or try again later.');
      }
    } catch (err) {
      console.error('Login submit error:', err);
      setError('Cannot connect to server. Please try again soon.');
    }
  };

  const handleSendForgotOtp = async (e) => {
    e.preventDefault();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.ac\.in$/;
    if (!emailRegex.test(forgotEmail)) {
      return setForgotError('Email must strictly be in the format: you@College_name.ac.in');
    }
    setForgotError('');
    setForgotSuccess('');
    setIsForgotSubmitting(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/forgot-password-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collegeEmail: forgotEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setForgotSuccess('OTP code has been sent to your college email ID.');
        setForgotStep(2);
        setIsForgotSubmitting(false);
      } else {
        setForgotError(data.msg || 'Failed to send recovery OTP.');
        setIsForgotSubmitting(false);
      }
    } catch (err) {
      setForgotError('Connection error. Please try again.');
      setIsForgotSubmitting(false);
    }
  };

  const handleVerifyForgotOtp = async (e) => {
    e.preventDefault();
    if (forgotOtp.length !== 6) {
      return setForgotError('Please enter a valid 6-digit OTP.');
    }
    setForgotError('');
    setForgotSuccess('');
    setIsForgotSubmitting(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collegeEmail: forgotEmail, otp: forgotOtp })
      });
      const data = await res.json();
      if (res.ok) {
        setForgotSuccess('OTP verified successfully!');
        setTimeout(() => {
          setForgotStep(3);
          setForgotSuccess('');
          setIsForgotSubmitting(false);
        }, 1000);
      } else {
        setForgotError(data.msg || 'Invalid recovery OTP code.');
        setIsForgotSubmitting(false);
      }
    } catch (err) {
      setForgotError('Connection error. Please try again.');
      setIsForgotSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,16}$/;
    if (!passwordRegex.test(newPassword)) {
      return setForgotError('Password must be 8 to 16 characters and include at least one letter and one number.');
    }
    if (newPassword !== confirmNewPassword) {
      return setForgotError('Passwords do not match.');
    }
    setForgotError('');
    setForgotSuccess('');
    setIsForgotSubmitting(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collegeEmail: forgotEmail, otp: forgotOtp, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setForgotSuccess('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          setShowForgotModal(false);
          setIsForgotSubmitting(false);
        }, 1500);
      } else {
        setForgotError(data.msg || 'Reset failed. Please verify the OTP.');
        setIsForgotSubmitting(false);
      }
    } catch (err) {
      setForgotError('Connection error. Please try again.');
      setIsForgotSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px', fontSize: '2rem' }}>Skill Connect Welcome</h2>
        {error && <div style={{ color: '#ef4444', marginBottom: '16px', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px' }}>{error}</div>}
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            type="button"
            className={role === 'Learner' ? 'btn-primary' : 'btn-outline'} 
            style={{ flex: 1 }}
            onClick={() => setFormData({ ...formData, role: 'Learner' })}
          >Learner</button>
          <button 
            type="button"
            className={role === 'Tutor' ? 'btn-primary' : 'btn-outline'} 
            style={{ flex: 1 }}
            onClick={() => setFormData({ ...formData, role: 'Tutor' })}
          >Tutor</button>
        </div>

        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label className="label">College Email ID</label>
            <input 
              type="email" 
              name="collegeEmail" 
              value={collegeEmail} 
              onChange={onChange} 
              className="input-field" 
              placeholder="you@College_name.ac.in" 
              required 
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="label" style={{ marginBottom: 0 }}>Password</label>
              <span 
                style={{ fontSize: '0.85rem', color: 'var(--color-accent)', cursor: 'pointer' }}
                onClick={() => {
                  setShowForgotModal(true);
                  setForgotStep(1);
                  setForgotEmail('');
                  setForgotOtp('');
                  setNewPassword('');
                  setConfirmNewPassword('');
                  setForgotError('');
                  setForgotSuccess('');
                }}
              >
                Forgot Password?
              </span>
            </div>
            <input 
              type="password" 
              name="password" 
              value={password} 
              onChange={onChange} 
              className="input-field" 
              placeholder="••••••••" 
              required 
            />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>Login as {role}</button>
        </form>
        <p style={{ marginTop: '20px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>

      {showForgotModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', position: 'relative', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }}>
            <button 
              onClick={() => setShowForgotModal(false)} 
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}
            >
              &times;
            </button>
            <h3 style={{ marginBottom: '16px', fontSize: '1.5rem', textAlign: 'center', color: 'white' }}>Reset Password</h3>
            
            {forgotError && <div style={{ color: '#f87171', marginBottom: '16px', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{forgotError}</div>}
            {forgotSuccess && <div style={{ color: '#4ade80', marginBottom: '16px', textAlign: 'center', background: 'rgba(34, 197, 94, 0.1)', padding: '10px', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid rgba(34, 197, 94, 0.2)' }}>{forgotSuccess}</div>}
            
            {forgotStep === 1 && (
              <form onSubmit={handleSendForgotOtp}>
                <div style={{ marginBottom: '20px' }}>
                  <label className="label">College Email ID</label>
                  <input 
                    type="email" 
                    required 
                    value={forgotEmail} 
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="input-field" 
                    placeholder="you@College_name.ac.in" 
                    style={{ background: 'rgba(0,0,0,0.3)' }}
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1rem', fontWeight: 'bold' }} disabled={isForgotSubmitting}>
                  {isForgotSubmitting ? 'Sending OTP...' : 'Send Recovery OTP'}
                </button>
              </form>
            )}

            {forgotStep === 2 && (
              <form onSubmit={handleVerifyForgotOtp}>
                <div style={{ marginBottom: '20px' }}>
                  <label className="label">6-Digit OTP</label>
                  <input 
                    type="text" 
                    maxLength="6"
                    required 
                    value={forgotOtp} 
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                    className="input-field" 
                    placeholder="123456" 
                    style={{ textAlign: 'center', fontSize: '1.4rem', letterSpacing: '4px', background: 'rgba(0,0,0,0.3)', color: 'white' }}
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1rem', fontWeight: 'bold' }} disabled={isForgotSubmitting}>
                  {isForgotSubmitting ? 'Verifying OTP...' : 'Verify OTP'}
                </button>
              </form>
            )}

            {forgotStep === 3 && (
              <form onSubmit={handleResetPassword}>
                <div style={{ marginBottom: '16px' }}>
                  <label className="label">New Password (8-16 chars, 1 letter, 1 number)</label>
                  <input 
                    type="password" 
                    required 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-field" 
                    placeholder="••••••••" 
                    style={{ background: 'rgba(0,0,0,0.3)' }}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label className="label">Confirm New Password</label>
                  <input 
                    type="password" 
                    required 
                    value={confirmNewPassword} 
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="input-field" 
                    placeholder="••••••••" 
                    style={{ background: 'rgba(0,0,0,0.3)' }}
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1rem', fontWeight: 'bold' }} disabled={isForgotSubmitting}>
                  {isForgotSubmitting ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
