import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FileText, Trash2 } from 'lucide-react';

const CompleteProfile = () => {
  const { user, token, updateUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '+91 ',
    gender: 'Other',
    age: '',
    pursuingYear: '1st Year',
    course: '',
    skills: '',
    experience: '',
    availability: '',
    githubLink: '',
    linkedinLink: '',
    personalEmail: ''
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      console.log("[DEBUG] Current user in CompleteProfile (Fresh Check):", user);
      
      setFormData({
        fullName: user.fullName || '',
        phone: user.phone || '+91 ',
        gender: user.gender || 'Other',
        age: user.age || '',
        pursuingYear: user.pursuingYear || '1st Year',
        course: user.course || '',
        skills: user.skills && Array.isArray(user.skills) ? user.skills.join(', ') : '',
        experience: user.experience || '',
        availability: user.availability || '',
        githubLink: user.githubLink || '',
        linkedinLink: user.linkedinLink || '',
        personalEmail: user.personalEmail || ''
      });
      if (user.profilePhoto) {
        setPhotoPreview(user.profilePhoto.startsWith('http') ? user.profilePhoto : `http://localhost:5000${user.profilePhoto}`);
      }
    }
  }, [user]);

  // Defensive extraction for UI display
  const getDisplayCollege = () => {
    if (user?.collegeName) return user.collegeName;
    if (user?.collegeEmail) {
      try {
        return user.collegeEmail.split('@')[1].split('.')[0].toUpperCase();
      } catch (e) {}
    }
    return 'Campus';
  };
  
  const displayCollege = getDisplayCollege();

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeFile(file);
    }
  };

  const onChange = e => {
    const { name, value } = e.target;
    if (name === 'phone') {
      let val = value;
      if (!val.startsWith('+91 ')) val = '+91 ';
      setFormData(prev => ({ ...prev, phone: val }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const { fullName, phone, gender, age, pursuingYear, course, skills, experience, availability, githubLink, linkedinLink, personalEmail } = formData;

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "WARNING: Are you sure you want to permanently delete your account?\n\nThis will permanently delete your profile, active sessions, requests, and messages. This action cannot be undone."
    );
    
    if (confirmDelete) {
      try {
        const res = await fetch('http://localhost:5000/api/users/profile', {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          alert('Your account has been deleted successfully.');
          logout();
          navigate('/');
        } else {
          const data = await res.json();
          setError(data.msg || 'Failed to delete account. Please try again.');
        }
      } catch (err) {
        setError('Connection Error. Failed to delete account.');
      }
    }
  };

  const onSubmit = async e => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const finalPayload = {
        fullName,
        phone,
        gender,
        age: parseInt(age) || 0,
        pursuingYear,
        course,
        personalEmail,
        skills: user.role === 'Tutor' ? skills : undefined,
        experience: user.role === 'Tutor' ? experience : undefined,
        availability: user.role === 'Tutor' ? availability : undefined,
        githubLink: user.role === 'Tutor' ? githubLink : undefined,
        linkedinLink: user.role === 'Tutor' ? linkedinLink : undefined
      };

      console.log("[DEBUG] Submitting to backend:", finalPayload);

      if (photo) {
        const photoData = new FormData();
        photoData.append('profilePhoto', photo);
        const photoRes = await fetch('http://localhost:5000/api/users/uploadPhoto', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: photoData
        });
        if (!photoRes.ok) console.error("Photo upload failed");
      }

      if (resumeFile) {
        const resumeData = new FormData();
        resumeData.append('resume', resumeFile);
        const resumeRes = await fetch('http://localhost:5000/api/users/uploadResume', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: resumeData
        });
        if (!resumeRes.ok) console.error("Resume upload failed");
      }

      const res = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(finalPayload)
      });
      
      const updatedUser = await res.json();
      console.log("[DEBUG] Received response:", updatedUser);

      if (res.ok) {
        updateUser(updatedUser);
        setSuccess('Profile updated successfully! Redirecting to dashboard...');
        setTimeout(() => {
            navigate('/dashboard');
        }, 2000);
      } else {
        setError(updatedUser.msg || 'Update failed. Please try again.');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("[DEBUG] Submit caught error:", err);
      setError('Connection Error. Please check if backend is running.');
      setIsSubmitting(false);
    }
  };

  if (!user) return <div style={{ padding: '20px', color: 'white' }}>Loading user data...</div>;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)', padding: '40px 0' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '650px', padding: '30px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '2.4rem', margin: '0 0 10px 0', background: 'linear-gradient(to right, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Complete Your Profile
            </h2>
            <div style={{ display: 'inline-block', background: 'rgba(96, 165, 250, 0.1)', color: '#60a5fa', padding: '4px 16px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold', border: '1px solid rgba(96, 165, 250, 0.3)', marginTop: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {displayCollege}
            </div>
        </div>
        
        {/* Profile Photo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px', border: '4px solid var(--color-accent)', boxShadow: '0 0 20px rgba(96, 165, 250, 0.3)' }}>
                {photoPreview ? <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '3rem', fontWeight: 'bold' }}>{user.fullName.charAt(0)}</span>}
            </div>
            <label className="btn-outline" style={{ cursor: 'pointer', padding: '8px 20px', fontSize: '0.9rem' }}>
                {photoPreview ? 'Change Photo' : 'Upload Photo'}
                <input type="file" style={{ display: 'none' }} onChange={handlePhotoChange} accept="image/*" />
            </label>
        </div>

        {error && <div style={{ color: '#f87171', marginBottom: '20px', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}
        {success && <div style={{ color: '#4ade80', marginBottom: '20px', textAlign: 'center', background: 'rgba(34, 197, 94, 0.1)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>{success}</div>}
        
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label htmlFor="fullName" className="label">Full Name *</label>
              <input id="fullName" type="text" name="fullName" value={fullName} onChange={onChange} className="input-field" required />
            </div>
            <div className="form-group">
              <label htmlFor="phone" className="label">Phone Number *</label>
              <input id="phone" type="text" name="phone" value={phone} onChange={onChange} className="input-field" required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label htmlFor="collegeEmail" className="label">College Email (From Registration)</label>
              <input id="collegeEmail" type="text" value={user.collegeEmail} disabled className="input-field" style={{ opacity: 0.7, cursor: 'not-allowed' }} />
            </div>
            <div className="form-group">
              <label htmlFor="gender" className="label">Gender *</label>
              <select id="gender" name="gender" value={gender} onChange={onChange} className="input-field" required>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label htmlFor="personalEmail" className="label">Personal Email (Gmail) *</label>
              <input id="personalEmail" type="email" name="personalEmail" value={personalEmail} onChange={onChange} className="input-field" placeholder="example@gmail.com" required />
            </div>
            <div className="form-group">
              <label htmlFor="age" className="label">Your Age *</label>
              <input id="age" type="number" name="age" value={age} onChange={onChange} className="input-field" required min="16" max="60" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label htmlFor="pursuingYear" className="label">Pursuing Year *</label>
              <select id="pursuingYear" name="pursuingYear" value={pursuingYear} onChange={onChange} className="input-field" required>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="course" className="label">Course / Degree *</label>
              <input id="course" type="text" name="course" value={course} onChange={onChange} className="input-field" placeholder="e.g. B.Tech Computer Science" required />
            </div>
          </div>

          {user.role === 'Tutor' && (
            <>
              <div className="form-group">
                <label htmlFor="skills" className="label">Skills You Can Teach * (comma separated)</label>
                <input id="skills" type="text" name="skills" value={skills} onChange={onChange} className="input-field" placeholder="React, Python, Figma" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label htmlFor="experience" className="label">Experience Level *</label>
                  <input id="experience" type="text" name="experience" value={experience} onChange={onChange} className="input-field" placeholder="e.g. 2 years project experience" required />
                </div>
                <div className="form-group">
                  <label htmlFor="availability" className="label">Availability *</label>
                  <input id="availability" type="text" name="availability" value={availability} onChange={onChange} className="input-field" placeholder="e.g. Weekends 4PM - 7PM" required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label htmlFor="githubLink" className="label">GitHub Profile Link</label>
                  <input id="githubLink" type="url" name="githubLink" value={githubLink} onChange={onChange} className="input-field" placeholder="https://github.com/yourusername" />
                </div>
                <div className="form-group">
                  <label htmlFor="linkedinLink" className="label">LinkedIn Profile Link</label>
                  <input id="linkedinLink" type="url" name="linkedinLink" value={linkedinLink} onChange={onChange} className="input-field" placeholder="https://linkedin.com/in/yourusername" />
                </div>
              </div>
            </>
          )}

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label className="label">Resume / CV (PDF, DOC, DOCX)</label>
            <input 
              type="file" 
              onChange={handleResumeChange} 
              accept=".pdf,.doc,.docx" 
              className="input-field" 
              style={{ padding: '8px 12px' }} 
            />
            {user.resume && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '-8px', marginBottom: '8px' }}>
                <FileText size={16} className="text-accent" />
                <a href={user.resume.startsWith('http') ? user.resume : `http://localhost:5000${user.resume}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.9rem', color: 'var(--color-accent)' }}>
                  View Current Resume/CV
                </a>
              </div>
            )}
          </div>
          
          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', padding: '14px', fontSize: '1.1rem', marginTop: '10px' }} 
            disabled={isSubmitting}
          >
              {isSubmitting ? 'Finalizing Profile...' : 'Save & Continue'}
          </button>

          <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ color: '#f87171', margin: '0 0 5px 0', fontSize: '1.1rem' }}>Danger Zone</h4>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              Permanently delete your account and all associated data. This action is irreversible.
            </p>
            <button 
              type="button" 
              onClick={handleDeleteAccount} 
              className="btn-outline" 
              style={{ borderColor: '#ef4444', color: '#ef4444', background: 'rgba(239, 68, 68, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 20px', width: '100%', fontSize: '1rem' }}
            >
              <Trash2 size={18} /> Delete Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
