import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, BookOpen, Clock, Calendar, Mail, FileText } from 'lucide-react';

const Github = ({ size = 24, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Linkedin = ({ size = 24, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const TutorProfile = () => {
    const { id } = useParams();
    const { token, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const getMediaUrl = (path) => {
        if (!path) return '';
        return path.startsWith('http') ? path : `http://localhost:5000${path}`;
    };
    
    const [tutor, setTutor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Demo Request State
    const [showModal, setShowModal] = useState(false);
    const [reqData, setReqData] = useState({ skill: '', description: '', requestedTime: '' });
    const [reqSuccess, setReqSuccess] = useState('');
    const [reqError, setReqError] = useState('');

    // Connection Request State
    const [showConnectModal, setShowConnectModal] = useState(false);
    const [connectData, setConnectData] = useState({ skill: '', description: '' });
    const [connectSuccess, setConnectSuccess] = useState('');
    const [connectError, setConnectError] = useState('');

    useEffect(() => {
        const fetchTutor = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/users/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) {
                    setTutor(data);
                } else {
                    setError(data.msg || 'Failed to load profile');
                }
            } catch (err) {
                setError('Server error');
            }
            setLoading(false);
        };
        fetchTutor();
    }, [id, token]);

    const handleRequestDemo = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:5000/api/requests`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...reqData, tutorId: id })
            });
            const data = await res.json();
            if (res.ok) {
                setReqSuccess('Demo requested successfully!');
                setTimeout(() => {
                    setShowModal(false);
                    navigate('/dashboard');
                }, 2000);
            } else {
                setReqError(data.msg || 'Request failed');
            }
        } catch (err) {
            setReqError('Server error');
        }
    };

    const handleConnectTutor = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:5000/api/connections`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...connectData, tutorId: id })
            });
            const data = await res.json();
            if (res.ok) {
                setConnectSuccess('Connection requested successfully!');
                setTimeout(() => {
                    setShowConnectModal(false);
                    navigate('/dashboard');
                }, 2000);
            } else {
                setConnectError(data.msg || 'Connection request failed');
            }
        } catch (err) {
            setConnectError('Server error');
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading Profile...</div>;
    if (error) return <div style={{ textAlign: 'center', marginTop: '50px', color: '#ef4444' }}>{error}</div>;
    if (!tutor) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Tutor not found.</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
            <div className="glass-panel" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '30px' }}>
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--color-accent)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {tutor.profilePhoto ? <img src={getMediaUrl(tutor.profilePhoto)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{tutor.fullName.charAt(0)}</span>}
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2rem', margin: 0 }}>{tutor.fullName}</h1>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', margin: '4px 0 0 0' }}>{tutor.course} • {tutor.pursuingYear}</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: '1fr 1fr' }}>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}><BookOpen size={20} className="text-accent" /> Skills</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {tutor.skills?.map((skill, idx) => (
                                <span key={idx} style={{ background: 'rgba(14, 165, 233, 0.15)', color: 'var(--color-accent)', padding: '6px 14px', borderRadius: '16px', fontSize: '0.9rem' }}>
                                    {skill}
                                </span>
                            ))}
                            {(!tutor.skills || tutor.skills.length === 0) && <span style={{ color: 'var(--color-text-secondary)' }}>No skills listed.</span>}
                        </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}><Calendar size={20} className="text-accent" /> Experience</h3>
                        <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>{tutor.experience || 'Not specified'}</p>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px', gridColumn: '1 / -1' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}><Clock size={20} className="text-accent" /> Availability</h3>
                        <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>{tutor.availability || 'Not specified'}</p>
                    </div>
                </div>

                <div style={{ marginTop: '20px', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Mail size={18} className="text-accent"/> <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{tutor.collegeEmail}</span>
                    </div>
                    {tutor.personalEmail && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Mail size={18} style={{ color: '#4ade80' }}/> <span style={{ color: '#4ade80', fontSize: '0.9rem' }}>{tutor.personalEmail} (Personal)</span>
                        </div>
                    )}
                    {tutor.githubLink && (
                        <a href={tutor.githubLink} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f8fafc', transition: 'color 0.2s' }}>
                            <Github size={18} /> <span style={{ fontSize: '0.9rem' }}>GitHub Profile</span>
                        </a>
                    )}
                    {tutor.linkedinLink && (
                        <a href={tutor.linkedinLink} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0077b5', transition: 'color 0.2s' }}>
                            <Linkedin size={18} /> <span style={{ fontSize: '0.9rem' }}>LinkedIn Profile</span>
                        </a>
                    )}
                    {tutor.resume && (
                        <a href={getMediaUrl(tutor.resume)} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#60a5fa', transition: 'color 0.2s' }}>
                            <FileText size={18} /> <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>View Resume/CV</span>
                        </a>
                    )}
                </div>

                {user?.role === 'Learner' && (
                    <div style={{ marginTop: '30px', textAlign: 'center', display: 'flex', gap: '16px', justifyContent: 'center' }}>
                        <button className="btn-primary" style={{ padding: '14px 40px', fontSize: '1.1rem' }} onClick={() => setShowModal(true)}>
                            Request a Demo
                        </button>
                        <button className="btn-outline" style={{ padding: '14px 40px', fontSize: '1.1rem' }} onClick={() => setShowConnectModal(true)}>
                            Connect Direct
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', position: 'relative' }}>
                        <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        <h2 style={{ marginBottom: '20px' }}>Request Demo from {tutor.fullName.split(' ')[0]}</h2>
                        
                        {reqError && <div style={{ color: '#ef4444', marginBottom: '16px', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px' }}>{reqError}</div>}
                        {reqSuccess && <div style={{ color: '#4ade80', marginBottom: '16px', background: 'rgba(34, 197, 94, 0.1)', padding: '10px', borderRadius: '8px' }}>{reqSuccess}</div>}

                        <form onSubmit={handleRequestDemo}>
                            <div style={{ marginBottom: '16px' }}>
                                <label className="label">Topic / Skill to Learn</label>
                                <input type="text" className="input-field" required value={reqData.skill} onChange={(e) => setReqData({...reqData, skill: e.target.value})} placeholder="e.g. React Native basics" />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label className="label">Message / Description</label>
                                <textarea className="input-field" rows="3" required value={reqData.description} onChange={(e) => setReqData({...reqData, description: e.target.value})} placeholder="What exactly do you want to learn?"></textarea>
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label className="label">Preferred Date & Time</label>
                                <input 
                                    type="datetime-local" 
                                    className="input-field" 
                                    required 
                                    value={reqData.requestedTime} 
                                    onChange={(e) => setReqData({...reqData, requestedTime: e.target.value})} 
                                    style={{ colorScheme: 'dark' }} 
                                />
                            </div>
                            <button type="submit" className="btn-primary" style={{ width: '100%' }}>Send Request</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Connect Modal */}
            {showConnectModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', position: 'relative' }}>
                        <button onClick={() => setShowConnectModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        <h2 style={{ marginBottom: '20px' }}>Connect with {tutor.fullName.split(' ')[0]}</h2>
                        
                        {connectError && <div style={{ color: '#ef4444', marginBottom: '16px', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px' }}>{connectError}</div>}
                        {connectSuccess && <div style={{ color: '#4ade80', marginBottom: '16px', background: 'rgba(34, 197, 94, 0.1)', padding: '10px', borderRadius: '8px' }}>{connectSuccess}</div>}

                        <form onSubmit={handleConnectTutor}>
                            <div style={{ marginBottom: '16px' }}>
                                <label className="label">Topic / Skill to Connect</label>
                                <input type="text" className="input-field" required value={connectData.skill} onChange={(e) => setConnectData({...connectData, skill: e.target.value})} placeholder="e.g. React Native basics" />
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label className="label">Message / Description</label>
                                <textarea className="input-field" rows="4" required value={connectData.description} onChange={(e) => setConnectData({...connectData, description: e.target.value})} placeholder="Why do you want to connect with this tutor?"></textarea>
                            </div>
                            <button type="submit" className="btn-primary" style={{ width: '100%' }}>Send Connection Request</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TutorProfile;
