import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { mentorAPI, requestAPI, sessionAPI } from '../../services/api';

function StatCard({ icon, label, value, color = '#1e3a5f' }) {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ width: 48, height: 48, background: `${color}15`, borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color }}>{value}</div>
        <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{label}</div>
      </div>
    </div>
  );
}

function ProfileCompletion({ user }) {
  const fields = ['bio', 'education', 'skills', 'interests', 'careerGoal', 'profilePhoto'];
  const filled = fields.filter(f => Array.isArray(user[f]) ? user[f].length > 0 : !!user[f]).length;
  const pct = Math.round((filled / fields.length) * 100);
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{ fontWeight: 600, color: '#1e3a5f' }}>Profile Completion</span>
        <span style={{ fontWeight: 700, color: pct === 100 ? '#10b981' : '#f59e0b' }}>{pct}%</span>
      </div>
      <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
      {pct < 100 && (
        <Link to="/student/profile" style={{ fontSize: '0.8rem', color: '#2ec4a1', marginTop: '0.75rem', display: 'block', textDecoration: 'none' }}>
          Complete your profile →
        </Link>
      )}
    </div>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [recommended, setRecommended] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      mentorAPI.getRecommended().catch(() => ({ data: { recommended: [] } })),
      requestAPI.getAll().catch(() => ({ data: { requests: [] } })),
      sessionAPI.getAll().catch(() => ({ data: { sessions: [] } })),
    ]).then(([r, req, sess]) => {
      setRecommended(r.data.recommended?.slice(0, 3) || []);
      setRequests(req.data.requests?.filter(r => r.status === 'pending') || []);
      setSessions(sess.data.sessions?.filter(s => ['pending', 'confirmed'].includes(s.status)) || []);
      setLoading(false);
    });
  }, []);

  const upcomingSessions = sessions.sort((a, b) => new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`)).slice(0, 3);

  return (
    <AppLayout>
      <div className="page-header">
        <h1>Student Dashboard</h1>
        <p>Track your mentorship journey and stay on top of your goals.</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <StatCard icon="📨" label="Pending Requests" value={requests.length} color="#f59e0b" />
            <StatCard icon="📅" label="Upcoming Sessions" value={upcomingSessions.length} color="#1e3a5f" />
            <StatCard icon="👨‍🏫" label="Recommended Mentors" value={recommended.length} color="#2ec4a1" />
          </div>

          <ProfileCompletion user={user} />

          {/* Recommended Mentors */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontWeight: 700, color: '#1e3a5f' }}>Recommended for You</h2>
              <Link to="/student/mentors" style={{ fontSize: '0.85rem', color: '#2ec4a1', textDecoration: 'none' }}>See all →</Link>
            </div>
            {recommended.length === 0 ? (
              <div className="card empty-state">
                <p>Complete your profile to get mentor recommendations.</p>
                <Link to="/student/profile" className="btn-primary btn-sm" style={{ marginTop: '1rem' }}>Complete Profile</Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {recommended.map(({ mentor, score }) => (
                  <div key={mentor._id} className="mentor-card">
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      {mentor.profilePhoto ? (
                        <img src={mentor.profilePhoto} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div className="avatar" style={{ width: 48, height: 48 }}>{mentor.name[0]}</div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: '#1e3a5f', display: 'flex', justifyContent: 'space-between' }}>
                          <span>{mentor.name}</span>
                          {score > 0 && <span style={{ fontSize: '0.75rem', color: '#2ec4a1', fontWeight: 700 }}>{score}% match</span>}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem' }}>{mentor.bio?.slice(0, 60)}...</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                      {mentor.expertise?.slice(0, 3).map(e => <span key={e} className="skill-tag">{e}</span>)}
                    </div>
                    <Link to={`/student/mentors/${mentor._id}`} className="btn-outline btn-sm" style={{ alignSelf: 'flex-start' }}>View Profile</Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Sessions */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontWeight: 700, color: '#1e3a5f' }}>Upcoming Sessions</h2>
              <Link to="/student/sessions" style={{ fontSize: '0.85rem', color: '#2ec4a1', textDecoration: 'none' }}>See all →</Link>
            </div>
            {upcomingSessions.length === 0 ? (
              <div className="card empty-state"><p>No upcoming sessions. Book a session with your mentor!</p></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {upcomingSessions.map(s => (
                  <div key={s._id} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem' }}>
                    <div style={{ fontSize: '1.5rem' }}>📅</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>Session with {s.mentorId?.name}</div>
                      <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{s.date} at {s.time} · {s.duration} min</div>
                    </div>
                    <span className={`badge badge-${s.status}`}>{s.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
