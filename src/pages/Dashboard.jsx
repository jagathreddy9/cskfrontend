import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Search, Star, Clock, MessageSquare, CheckCircle, AlertTriangle, FileText, Users } from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';
import ChatWindow from '../components/ChatWindow';
import { API_BASE_URL, getMediaUrl } from '../config/api';

const Dashboard = () => {
  const { user, token } = useContext(AuthContext);
  const [tutors, setTutors] = useState([]);
  const [searchSkill, setSearchSkill] = useState('');
  const [requests, setRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  
  // Connection States
  const [connections, setConnections] = useState([]);
  const [activeTab, setActiveTab] = useState('sessions');
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingReview, setRatingReview] = useState('');

  // Schedule Session States
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedConnectionForSchedule, setSelectedConnectionForSchedule] = useState(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleMode, setScheduleMode] = useState('Online');
  const [scheduleMeetingLink, setScheduleMeetingLink] = useState('');
  const [scheduleLocation, setScheduleLocation] = useState('');

  useEffect(() => {
    if (user?.role === 'Learner') {
      fetchTutors();
    }
    if (user) {
      fetchRequests();
      fetchSessions();
      fetchConnections();
    }
  }, [user]);

  const fetchTutors = async (skill = '') => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/tutors?skill=${skill}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setTutors(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSessions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchConnections = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/connections`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setConnections(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConnectionStatus = async (connectionId, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/connections/${connectionId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchConnections();
        if (user?.role === 'Learner') {
          fetchTutors();
        }
      } else {
        const errorData = await res.json();
        alert(errorData.msg || 'Failed to update connection status');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRateConnection = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/connections/${selectedConnection._id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ score: ratingScore, review: ratingReview })
      });
      if (res.ok) {
        setRatingModalOpen(false);
        setRatingScore(5);
        setRatingReview('');
        fetchConnections();
        if (user?.role === 'Learner') {
          fetchTutors();
        }
      } else {
        const errorData = await res.json();
        alert(errorData.msg || 'Failed to submit rating');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDisconnect = async (connectionId) => {
    if (!window.confirm("Are you sure you want to disconnect? This action cannot be undone.")) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/connections/${connectionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchConnections();
      } else {
        const errorData = await res.json();
        alert(errorData.msg || 'Failed to disconnect');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTutors(searchSkill);
  };

  const handleRequestStatus = async (requestId, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/requests/${requestId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchRequests();
        fetchSessions(); // Acceptance creates a session
      } else {
        const errorData = await res.json();
        alert(errorData.msg || 'Failed to update request status');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkCompleted = async (sessionId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/complete`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchSessions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleScheduleSession = async (e) => {
    e.preventDefault();
    if (!scheduleDate) {
      alert('Please fill out all required fields');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          learnerId: selectedConnectionForSchedule.learnerId._id,
          skill: selectedConnectionForSchedule.skill,
          schedule: scheduleDate,
          sessionMode: scheduleMode,
          meetingLink: scheduleMode === 'Online' ? scheduleMeetingLink : undefined,
          location: scheduleMode === 'Offline' ? scheduleLocation : undefined
        })
      });
      if (res.ok) {
        setScheduleModalOpen(false);
        fetchSessions();
      } else {
        const errorData = await res.json();
        alert(errorData.msg || 'Failed to schedule session');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to cancel this session? An email notification will be sent to the learner.")) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/cancel`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchSessions();
      } else {
        const errorData = await res.json();
        alert(errorData.msg || 'Failed to cancel session');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  };

  const getDisplayCollege = () => {
    if (user?.collegeName) return user.collegeName;
    if (user?.collegeEmail) {
      try { return user.collegeEmail.split('@')[1].split('.')[0].toUpperCase(); } catch (e) {}
    }
    return 'Campus';
  };
  const displayCollege = getDisplayCollege();

  if (!user) return <Navigate to="/login" />;
  if (user.isProfileComplete === false) return <Navigate to="/complete-profile" />;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--color-accent)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {user.profilePhoto ? <img src={getMediaUrl(user.profilePhoto)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{user.fullName.charAt(0)}</span>}
        </div>
        <div style={{ textAlign: 'left' }}>
            <h1 style={{ fontSize: '2.5rem', margin: 0 }}>
                Welcome, <span style={{ color: 'var(--color-accent)' }}>{user.fullName}</span>
            </h1>
            <p style={{ margin: '5px 0 0 0', opacity: 0.9, fontSize: '1.4rem', fontWeight: '500', color: '#60a5fa' }}>
                {displayCollege}
            </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: user.role === 'Learner' ? '1fr' : '1fr', gap: '30px' }}>
        {user.role === 'Learner' && (
          <div className="glass-panel" style={{ marginBottom: '10px' }}>
            <h2 style={{ marginBottom: '20px' }}>Find a Tutor</h2>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={20} style={{ position: 'absolute', top: '14px', left: '16px', color: 'var(--color-text-secondary)' }} />
                <input 
                  type="text" 
                  value={searchSkill}
                  onChange={(e) => setSearchSkill(e.target.value)}
                  placeholder="Search skills (e.g. React, Python...)" 
                  className="input-field" 
                  style={{ paddingLeft: '48px', marginBottom: 0 }}
                />
              </div>
              <button type="submit" className="btn-primary">Search</button>
            </form>
          </div>
        )}

        {/* Tab Selection Navigation */}
        <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '24px' }}>
          <button 
            onClick={() => setActiveTab('sessions')}
            className={activeTab === 'sessions' ? 'btn-primary' : 'btn-outline'}
            style={{ padding: '8px 18px', fontSize: '0.9rem', marginBottom: 0 }}
          >
            Active Sessions ({sessions.length})
          </button>
          <button 
            onClick={() => setActiveTab('demos')}
            className={activeTab === 'demos' ? 'btn-primary' : 'btn-outline'}
            style={{ padding: '8px 18px', fontSize: '0.9rem', marginBottom: 0 }}
          >
            Demo Requests ({requests.length})
          </button>
          <button 
            onClick={() => setActiveTab('connections')}
            className={activeTab === 'connections' ? 'btn-primary' : 'btn-outline'}
            style={{ padding: '8px 18px', fontSize: '0.9rem', marginBottom: 0 }}
          >
            Connections ({connections.filter(c => c.status === 'Accepted').length})
          </button>
        </div>

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div>
            <h3 style={{ marginBottom: '20px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle size={24} className="text-accent" /> Active Learning Sessions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {sessions.length === 0 ? (
                <p style={{ color: 'var(--color-text-secondary)' }}>No active sessions scheduled.</p>
              ) : (
                sessions.map(sess => (
                  <div key={sess._id} className="glass-panel" style={{ borderLeft: `4px solid ${sess.status === 'Completed' ? '#4ade80' : (sess.status === 'Expired' ? '#ef4444' : 'var(--color-accent)')}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-accent)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {sess.tutorId?.profilePhoto ? <img src={getMediaUrl(sess.tutorId.profilePhoto)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{sess.tutorId?.fullName.charAt(0)}</span>}
                          </div>
                          <h4 style={{ margin: 0, fontSize: '1.2rem' }}>Learning Session</h4>
                          <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)' }}>{sess.status}</span>
                        </div>
                        <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
                          {user.role === 'Learner' ? `Tutor: ${sess.tutorId?.fullName}` : `Learner: ${sess.learnerId?.fullName}`}
                        </p>
                        {user.role === 'Tutor' && sess.learnerId?.resume && (
                          <div style={{ marginTop: '8px' }}>
                            <a 
                              href={getMediaUrl(sess.learnerId.resume)} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#60a5fa', textDecoration: 'none' }}
                            >
                              <FileText size={16} /> View Learner CV
                            </a>
                          </div>
                        )}
                        <p style={{ margin: '8px 0 0', fontSize: '0.9rem', color: 'var(--color-accent)', fontWeight: '500' }}>
                          Scheduled: {formatDate(sess.schedule)}
                        </p>
                        <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                          <strong>Mode:</strong> {sess.sessionMode || 'Online'}
                        </p>
                        {sess.sessionMode === 'Online' && sess.meetingLink && (
                          <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                            <strong>Meeting Link:</strong> <a href={sess.meetingLink} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', textDecoration: 'underline' }}>{sess.meetingLink}</a>
                          </p>
                        )}
                        {sess.sessionMode === 'Offline' && sess.location && (
                          <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                            <strong>Location:</strong> {sess.location}
                          </p>
                        )}
                        {sess.skill && (
                          <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                            <strong>Skill:</strong> {sess.skill}
                          </p>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <button 
                          className="btn-outline" 
                          style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
                          onClick={() => setActiveChat(user.role === 'Learner' ? sess.tutorId : sess.learnerId)}
                        >
                          <MessageSquare size={18} /> Chat
                        </button>
                        {user.role === 'Tutor' && sess.status === 'Confirmed' && (
                          <>
                            <button className="btn-primary" style={{ padding: '8px 16px' }} onClick={() => handleMarkCompleted(sess._id)}>
                              Complete
                            </button>
                            <button 
                              className="btn-outline" 
                              style={{ padding: '8px 16px', borderColor: '#ef4444', color: '#ef4444' }} 
                              onClick={() => handleCancelSession(sess._id)}
                            >
                              Cancel Session
                            </button>
                          </>
                        )}
                        {sess.status === 'Expired' && (
                          <div style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem' }}>
                            <AlertTriangle size={16} /> Expired
                          </div>
                        )}
                        {sess.status === 'Cancelled' && (
                          <div style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem' }}>
                            <AlertTriangle size={16} /> Cancelled
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Demo Requests Tab */}
        {activeTab === 'demos' && (
          <div>
            <h3 style={{ marginBottom: '20px', fontSize: '1.5rem' }}>{user.role === 'Learner' ? 'My Demo Requests' : 'Incoming Requests'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {requests.length === 0 ? (
                <p style={{ color: 'var(--color-text-secondary)' }}>No requests found.</p>
              ) : (
                requests.map(req => (
                  <div key={req._id} className="glass-panel" style={{ borderLeft: req.status === 'Expired' ? '4px solid #ef4444' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem' }}>Skill: {req.skill}</h4>
                        <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
                          {user.role === 'Learner' ? `To: ${req.tutorId?.fullName}` : `From: ${req.learnerId?.fullName}`}
                        </p>
                        {user.role === 'Tutor' && req.learnerId?.resume && (
                          <div style={{ marginTop: '8px' }}>
                            <a 
                              href={getMediaUrl(req.learnerId.resume)} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#60a5fa', textDecoration: 'none' }}
                            >
                              <FileText size={16} /> View Learner CV
                            </a>
                          </div>
                        )}
                        <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                            "{req.description}"
                          </p>
                        </div>
                        <p style={{ margin: '12px 0 0', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                          <Clock size={16} /> {formatDate(req.requestedTime)}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right', marginLeft: '20px' }}>
                        <span style={{ 
                          display: 'inline-block', padding: '6px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold',
                          background: req.status === 'Pending' ? 'rgba(234, 179, 8, 0.2)' : (req.status === 'Accepted' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'),
                          color: req.status === 'Pending' ? '#facc15' : (req.status === 'Accepted' ? '#4ade80' : '#f87171')
                        }}>
                          {req.status}
                        </span>
                        {user.role === 'Tutor' && req.status === 'Pending' && (
                          <div style={{ marginTop: '12px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button onClick={() => handleRequestStatus(req._id, 'Accepted')} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>Accept</button>
                            <button onClick={() => handleRequestStatus(req._id, 'Rejected')} className="btn-outline" style={{ padding: '6px 14px', fontSize: '0.8rem', borderColor: '#ef4444', color: '#ef4444' }}>Reject</button>
                          </div>
                        )}
                        {(req.status === 'Accepted') && (
                          <div style={{ marginTop: '12px' }}>
                            <button 
                              className="btn-outline" 
                              style={{ padding: '8px 16px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}
                              onClick={() => setActiveChat(user.role === 'Learner' ? req.tutorId : req.learnerId)}
                            >
                              <MessageSquare size={16} /> Chat
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Connections Tab */}
        {activeTab === 'connections' && (
          <div>
            {/* Accepted Connections */}
            <h3 style={{ marginBottom: '20px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={24} className="text-accent" /> Established Connections
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
              {connections.filter(c => c.status === 'Accepted').length === 0 ? (
                <p style={{ color: 'var(--color-text-secondary)' }}>No active connections established yet.</p>
              ) : (
                connections.filter(c => c.status === 'Accepted').map(c => {
                  const targetUser = user.role === 'Learner' ? c.tutorId : c.learnerId;
                  return (
                    <div key={c._id} className="glass-panel" style={{ borderLeft: '4px solid var(--color-accent)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-accent)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {targetUser?.profilePhoto ? (
                                <img src={getMediaUrl(targetUser.profilePhoto)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{targetUser?.fullName.charAt(0)}</span>
                              )}
                            </div>
                            <h4 style={{ margin: 0, fontSize: '1.2rem' }}>{targetUser?.fullName}</h4>
                            <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--color-accent)', fontWeight: 'bold' }}>
                              Domain: {c.skill}
                            </span>
                          </div>
                          <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                            College: {targetUser?.collegeName || 'N/A'} • Email: {targetUser?.personalEmail || targetUser?.collegeEmail}
                          </p>
                          <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                            "{c.description}"
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <button 
                            className="btn-outline" 
                            style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
                            onClick={() => setActiveChat(targetUser)}
                          >
                            <MessageSquare size={18} /> Chat
                          </button>
                          {user.role === 'Tutor' && (
                            <button 
                              className="btn-primary" 
                              style={{ padding: '8px 16px' }}
                              onClick={() => {
                                setSelectedConnectionForSchedule(c);
                                setScheduleDate('');
                                setScheduleMode('Online');
                                setScheduleMeetingLink('');
                                setScheduleLocation('');
                                setScheduleModalOpen(true);
                              }}
                            >
                              Schedule Session
                            </button>
                          )}
                          {user.role === 'Learner' && !c.ratingSubmitted && (
                            <button 
                              className="btn-primary" 
                              style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                              onClick={() => {
                                setSelectedConnection(c);
                                setRatingModalOpen(true);
                              }}
                            >
                              <Star size={16} /> Rate Tutor
                            </button>
                          )}
                          {user.role === 'Learner' && c.ratingSubmitted && (
                            <span style={{ color: '#4ade80', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle size={16} /> Rated
                            </span>
                          )}
                          <button 
                            className="btn-outline" 
                            style={{ padding: '8px 16px', borderColor: '#ef4444', color: '#ef4444' }}
                            onClick={() => handleDisconnect(c._id)}
                          >
                            Disconnect
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Connection Requests (Pending) */}
            <h3 style={{ marginBottom: '20px', fontSize: '1.5rem' }}>
              {user.role === 'Learner' ? 'My Connection Requests' : 'Incoming Connection Requests'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {connections.filter(c => c.status === 'Pending').length === 0 ? (
                <p style={{ color: 'var(--color-text-secondary)' }}>No pending connection requests.</p>
              ) : (
                connections.filter(c => c.status === 'Pending').map(c => {
                  const targetUser = user.role === 'Learner' ? c.tutorId : c.learnerId;
                  return (
                    <div key={c._id} className="glass-panel" style={{ borderLeft: '4px solid #eab308' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem' }}>Skill / Domain: {c.skill}</h4>
                          <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
                            {user.role === 'Learner' ? `To: ${targetUser?.fullName}` : `From: ${targetUser?.fullName}`} ({targetUser?.collegeName})
                          </p>
                          <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                              "{c.description}"
                            </p>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', marginLeft: '20px' }}>
                          <span style={{ 
                            display: 'inline-block', padding: '6px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold',
                            background: 'rgba(234, 179, 8, 0.2)', color: '#facc15'
                          }}>
                            Pending
                          </span>
                          {user.role === 'Tutor' && (
                            <div style={{ marginTop: '12px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button onClick={() => handleConnectionStatus(c._id, 'Accepted')} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>Accept</button>
                              <button onClick={() => handleConnectionStatus(c._id, 'Rejected')} className="btn-outline" style={{ padding: '6px 14px', fontSize: '0.8rem', borderColor: '#ef4444', color: '#ef4444' }}>Reject</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {activeChat && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', width: '350px', zIndex: 2000 }}>
          <ChatWindow chatWith={activeChat} onClose={() => setActiveChat(null)} />
        </div>
      )}

      {/* Connection Rating Modal */}
      {ratingModalOpen && selectedConnection && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', position: 'relative' }}>
            <button onClick={() => setRatingModalOpen(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            <h2 style={{ marginBottom: '20px' }}>Rate Tutor: {selectedConnection.tutorId?.fullName}</h2>
            <form onSubmit={handleRateConnection}>
              <div style={{ marginBottom: '16px' }}>
                <label className="label">Rating (1-5 Stars)</label>
                <select 
                  className="input-field" 
                  value={ratingScore} 
                  onChange={(e) => setRatingScore(Number(e.target.value))}
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                  <option value="4">⭐⭐⭐⭐ (4/5)</option>
                  <option value="3">⭐⭐⭐ (3/5)</option>
                  <option value="2">⭐⭐ (2/5)</option>
                  <option value="1">⭐ (1/5)</option>
                </select>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label className="label">Review Comment</label>
                <textarea 
                  className="input-field" 
                  rows="4" 
                  value={ratingReview} 
                  onChange={(e) => setRatingReview(e.target.value)} 
                  placeholder="Share your experience learning with this tutor..."
                ></textarea>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>Submit Rating</button>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Session Modal */}
      {scheduleModalOpen && selectedConnectionForSchedule && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', position: 'relative' }}>
            <button onClick={() => setScheduleModalOpen(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            <h2 style={{ marginBottom: '20px' }}>Schedule Session</h2>
            <p style={{ margin: '-10px 0 20px', color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
              Scheduling for: <strong style={{ color: 'var(--color-accent)' }}>{selectedConnectionForSchedule.learnerId?.fullName}</strong> ({selectedConnectionForSchedule.skill})
            </p>
            <form onSubmit={handleScheduleSession}>
              <div style={{ marginBottom: '16px' }}>
                <label className="label">Date & Time</label>
                <input 
                  type="datetime-local" 
                  className="input-field" 
                  value={scheduleDate} 
                  onChange={(e) => setScheduleDate(e.target.value)}
                  style={{ colorScheme: 'dark' }}
                  required
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label className="label">Session Mode</label>
                <select 
                  className="input-field" 
                  value={scheduleMode} 
                  onChange={(e) => setScheduleMode(e.target.value)}
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="Online">Online (Virtual Meeting)</option>
                  <option value="Offline">Offline (Physical Meetup)</option>
                </select>
              </div>

              {scheduleMode === 'Online' ? (
                <div style={{ marginBottom: '24px' }}>
                  <label className="label">Meeting Link</label>
                  <input 
                    type="url" 
                    className="input-field" 
                    value={scheduleMeetingLink} 
                    onChange={(e) => setScheduleMeetingLink(e.target.value)}
                    placeholder="e.g. https://meet.google.com/abc-defg-hij"
                    required
                  />
                </div>
              ) : (
                <div style={{ marginBottom: '24px' }}>
                  <label className="label">Location Description</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={scheduleLocation} 
                    onChange={(e) => setScheduleLocation(e.target.value)}
                    placeholder="e.g. Main Library, Room 204"
                    required
                  />
                </div>
              )}

              <button type="submit" className="btn-primary" style={{ width: '100%' }}>Create Session</button>
            </form>
          </div>
        </div>
      )}

      {user.role === 'Learner' && tutors.length > 0 && (
         <div style={{ marginTop: '40px' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '1.5rem' }}>Recommended Tutors</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
               {tutors.slice(0, 3).map(t => (
                  <div key={t._id} className="glass-panel">
                     <h4 style={{ margin: 0 }}>{t.fullName}</h4>
                     <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{t.skills.join(', ')}</p>
                     <Link to={`/profile/${t._id}`} className="text-accent" style={{ fontSize: '0.9rem', textDecoration: 'none' }}>View Profile →</Link>
                  </div>
               ))}
            </div>
         </div>
      )}
      
    </div>
  );
};

export default Dashboard;
