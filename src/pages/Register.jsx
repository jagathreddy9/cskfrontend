import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    role: 'Learner',
    fullName: '',
    collegeEmail: '',
    password: '',
    confirmPassword: '',
    phone: '+91 ',
    gender: 'Other'
  });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // OTP States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const { role, fullName, collegeEmail, password, confirmPassword, phone, gender } = formData;

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const onChange = e => {
    if (e.target.name === 'phone') {
      let val = e.target.value;
      if (!val.startsWith('+91 ')) val = '+91 ';
      setFormData({ ...formData, phone: val });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const onSubmit = async e => {
    e.preventDefault();
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,16}$/;
    if (!passwordRegex.test(password)) {
      return setError('Password must be 8 to 16 characters and include at least one letter and one number.');
    }
    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.ac\.in$/;
    if (!emailRegex.test(collegeEmail)) {
      return setError('Email must strictly be in the format: you@College_name.ac.in');
    }
    setError('');

    try {
      const payload = { ...formData };
      delete payload.confirmPassword;

      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const contentType = res.headers.get('content-type');
      const data = (contentType && contentType.includes('application/json')) ? await res.json() : null;
      
      if (res.ok) {
        // Show OTP Modal and trigger cooldown
        setShowOtpModal(true);
        setCooldown(30);
        setOtpError('');
        setOtpSuccess('');
      } else {
        setError(data?.msg || 'Registration failed. Please check your information or try again later.');
      }
    } catch (err) {
      console.error('Register submit error:', err);
      setError('Cannot connect to server. Please try again soon.');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      return setOtpError('Please enter a valid 6-digit OTP.');
    }
    setOtpError('');
    setOtpSuccess('');
    setIsVerifying(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collegeEmail, otp })
      });
      
      const data = await res.json();
      if (res.ok) {
        setOtpSuccess('Email verified successfully! Logging in...');
        setTimeout(() => {
          login(data.user, data.token);
          navigate('/dashboard');
        }, 1500);
      } else {
        setOtpError(data.msg || 'Verification failed. Please check your OTP.');
        setIsVerifying(false);
      }
    } catch (err) {
      setOtpError('Connection error. Please try again.');
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpError('');
    setOtpSuccess('');
    setCooldown(30);

    try {
      const res = await fetch('http://localhost:5000/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collegeEmail })
      });
      
      const data = await res.json();
      if (res.ok) {
        setOtpSuccess('A new OTP has been sent to your college email.');
      } else {
        setOtpError(data.msg || 'Failed to resend OTP.');
      }
    } catch (err) {
      setOtpError('Connection error. Failed to resend OTP.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)', padding: '40px 0' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px', fontSize: '2rem' }}>
          Create Account
        </h2>
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
            <label className="label">Full Name</label>
            <input type="text" name="fullName" value={fullName} onChange={onChange} className="input-field" required />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label className="label">College Email ID</label>
            <input type="email" name="collegeEmail" value={collegeEmail} onChange={onChange} className="input-field" placeholder="you@College_name.ac.in" required />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label className="label">Password (8-16 chars)</label>
              <input type="password" name="password" value={password} onChange={onChange} className="input-field" required minLength="8" maxLength="16" />
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input type="password" name="confirmPassword" value={confirmPassword} onChange={onChange} className="input-field" required minLength="8" maxLength="16" />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label className="label">Phone Number</label>
              <input type="text" name="phone" value={phone} onChange={onChange} className="input-field" required />
            </div>
            <div>
              <label className="label">Gender</label>
              <select name="gender" value={gender} onChange={onChange} className="input-field">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>Register & Continue</button>
        </form>
        <p style={{ marginTop: '20px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>

      </div>

      {showOtpModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', position: 'relative', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ marginBottom: '12px', fontSize: '1.5rem', textAlign: 'center', color: 'white' }}>Verify College Email</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '20px', textAlign: 'center' }}>
              We sent a 6-digit verification code to <strong>{collegeEmail}</strong>. Please check your inbox and verify it within 2 minutes.
            </p>
            
            {otpError && <div style={{ color: '#f87171', marginBottom: '16px', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{otpError}</div>}
            {otpSuccess && <div style={{ color: '#4ade80', marginBottom: '16px', textAlign: 'center', background: 'rgba(34, 197, 94, 0.1)', padding: '10px', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid rgba(34, 197, 94, 0.2)' }}>{otpSuccess}</div>}
            
            <form onSubmit={handleVerifyOtp}>
              <div style={{ marginBottom: '20px' }}>
                <label className="label" style={{ textAlign: 'center', display: 'block' }}>Enter 6-Digit OTP</label>
                <input 
                  type="text" 
                  maxLength="6"
                  required 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="input-field" 
                  placeholder="123456" 
                  style={{ textAlign: 'center', fontSize: '1.8rem', letterSpacing: '6px', padding: '10px', width: '100%', marginTop: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)' }}
                />
              </div>
              
              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1rem', marginBottom: '12px', fontWeight: 'bold' }} disabled={isVerifying}>
                {isVerifying ? 'Verifying...' : 'Verify & Register'}
              </button>
              
              <button 
                type="button" 
                onClick={handleResendOtp} 
                className="btn-outline" 
                style={{ width: '100%', padding: '10px', fontSize: '0.9rem', border: '2px solid var(--color-accent)' }} 
                disabled={cooldown > 0}
              >
                {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
