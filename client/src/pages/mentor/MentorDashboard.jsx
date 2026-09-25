import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { requestAPI, sessionAPI } from '../../services/api';

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

function Stars({ rating }) {
  return <span>{[1,2,3,4,5].map(i => <span key={i} className={i <= Math.round(rating) ? 'star' : 'star-empty'}>★</span>)}</span>;
}

function ProfileCompletion({ user }) {
  const fields = ['bio', 'education', 'expertise', 'experience', 'availability', 'profilePhoto'];
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
        <Link to="/mentor/profile" style={{ fontSize: '0.8rem', color: '#2ec4a1', marginTop: '0.75rem', display: 'block', textDecoration: 'none' }}>
          Complete your profile to receive more requests →
        </Link>
      )}
    </div>
  );
}

export default function MentorDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      requestAPI.getAll().catch(() => ({ data: { requests: [] } })),
      sessionAPI.getAll().catch(() => ({ data: { sessions: [] } })),
    ]).then(([req, sess]) => {
      setRequests(req.data.requests || []);
      setSessions(sess.data.sessions || []);
      setLoading(false);
    });
  }, []);

  const pending = requests.filter(r => r.status === 'pending');
  const accepted = requests.filter(r => r.status === 'accepted');
  const upcoming = sessions.filter(s => ['pending', 'confirmed'].includes(s.status))
    .sort((a, b) => new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`))
    .slice(0, 3);

  return (
    <AppLayout>
      <div className="page-header">
        <h1>Mentor Dashboard</h1>
        <p>Manage your mentorship sessions and student connections.</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
            <StatCard icon="📨" label="Pending Requests" value={pending.length} color="#f59e0b" />
            <StatCard icon="✅" label="Active Students" value={accepted.length} color="#10b981" />
            <StatCard icon="📅" label="Upcoming Sessions" value={upcoming.length} color="#1e3a5f" />
            <StatCard icon="📚" label="Total Sessions" value={user?.totalSessions || 0} color="#2ec4a1" />
            {user?.ratingCount > 0 && (
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 48, height: 48, background: '#f59e0b15', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>⭐</div>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {(user?.rating || 0).toFixed(1)} <Stars rating={user?.rating || 0} />
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{user?.ratingCount} reviews</div>
                </div>
              </div>
            )}
          </div>

          <ProfileCompletion user={user} />

          {/* Pending Requests */}
          {pending.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontWeight: 700, color: '#1e3a5f' }}>🔔 New Requests</h2>
                <Link to="/mentor/requests" style={{ fontSize: '0.85rem', color: '#2ec4a1', textDecoration: 'none' }}>Manage all →</Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {pending.slice(0, 3).map(req => (
                  <div key={req._id} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className="avatar" style={{ width: 40, height: 40 }}>{req.studentId?.name?.[0]}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: '#1e3a5f' }}>{req.studentId?.name}</div>
                      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{req.studentId?.careerGoal || 'No goal specified'}</div>
                    </div>
                    <Link to="/mentor/requests" className="btn-primary btn-sm">Review</Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Sessions */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontWeight: 700, color: '#1e3a5f' }}>Upcoming Sessions</h2>
              <Link to="/mentor/sessions" style={{ fontSize: '0.85rem', color: '#2ec4a1', textDecoration: 'none' }}>See all →</Link>
            </div>
            {upcoming.length === 0 ? (
              <div className="card empty-state"><p>No upcoming sessions.</p></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {upcoming.map(s => (
                  <div key={s._id} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ fontSize: '1.5rem' }}>📅</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: '#1e3a5f' }}>Session with {s.studentId?.name}</div>
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
