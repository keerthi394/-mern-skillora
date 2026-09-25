import { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import { sessionAPI } from '../../services/api';

export default function MentorSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    sessionAPI.getAll().then(r => {
      setSessions(r.data.sessions || []);
      setLoading(false);
    }).catch(() => {
      setError('Unable to load sessions.');
      setLoading(false);
    });
  }, []);

  const update = async (id, status) => {
    try {
      await sessionAPI.update(id, { status });
      setSessions(prev => prev.map(s => s._id === id ? { ...s, status } : s));
      setToast(`Session marked as ${status}.`);
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      setToast(err.response?.data?.message || 'Failed to update.');
      setTimeout(() => setToast(''), 3000);
    }
  };

  const grouped = { upcoming: [], completed: [], other: [] };
  sessions.forEach(s => {
    if (['pending', 'confirmed'].includes(s.status)) grouped.upcoming.push(s);
    else if (s.status === 'completed') grouped.completed.push(s);
    else grouped.other.push(s);
  });
  grouped.upcoming.sort((a, b) => new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`));

  return (
    <AppLayout>
      {toast && <div style={{ position: 'fixed', top: 80, right: 20, background: '#10b981', color: 'white', padding: '0.875rem 1.25rem', borderRadius: '0.75rem', zIndex: 1000 }}>{toast}</div>}

      <div className="page-header">
        <h1>Sessions</h1>
        <p>View and manage your mentorship sessions.</p>
      </div>

      {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>}
      {error && <div className="card empty-state" style={{ color: '#ef4444' }}><p>{error}</p></div>}

      {!loading && !error && (
        <>
          {sessions.length === 0 && <div className="card empty-state"><p>No sessions yet. Accept student requests to start.</p></div>}

          {grouped.upcoming.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontWeight: 700, color: '#1e3a5f', marginBottom: '1rem' }}>Upcoming Sessions</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {grouped.upcoming.map(s => (
                  <div key={s._id} className="card">
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div className="avatar" style={{ width: 44, height: 44 }}>{s.studentId?.name?.[0]}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ fontWeight: 700, color: '#1e3a5f' }}>{s.studentId?.name}</div>
                          <span className={`badge badge-${s.status}`}>{s.status}</span>
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.25rem' }}>📅 {s.date} at {s.time} · {s.duration} min</div>
                        {s.topic && <div style={{ color: '#475569', fontSize: '0.85rem', marginTop: '0.25rem' }}>📌 {s.topic}</div>}
                        {s.notes && <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem', fontStyle: 'italic' }}>{s.notes}</div>}
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.875rem', flexWrap: 'wrap' }}>
                          {s.status === 'pending' && (
                            <button onClick={() => update(s._id, 'confirmed')} className="btn-accent btn-sm">✓ Confirm</button>
                          )}
                          <button onClick={() => update(s._id, 'completed')} className="btn-primary btn-sm">Mark Completed</button>
                          <button onClick={() => update(s._id, 'cancelled')} style={{ padding: '0.375rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem', background: 'white', cursor: 'pointer', fontSize: '0.8rem', color: '#64748b' }}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {grouped.completed.length > 0 && (
            <div>
              <h2 style={{ fontWeight: 700, color: '#1e3a5f', marginBottom: '1rem' }}>Completed Sessions ({grouped.completed.length})</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {grouped.completed.map(s => (
                  <div key={s._id} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ fontSize: '1.5rem' }}>✅</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: '#1e3a5f' }}>Session with {s.studentId?.name}</div>
                      <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{s.date} at {s.time}</div>
                      {s.topic && <div style={{ color: '#475569', fontSize: '0.85rem' }}>📌 {s.topic}</div>}
                    </div>
                    <span className="badge badge-completed">completed</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
}
