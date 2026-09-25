import { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import { requestAPI } from '../../services/api';

export default function MentorRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    requestAPI.getAll().then(r => {
      setRequests(r.data.requests || []);
      setLoading(false);
    }).catch(() => {
      setError('Unable to load requests.');
      setLoading(false);
    });
  }, []);

  const handle = async (id, action) => {
    setProcessing(id + action);
    try {
      if (action === 'accept') await requestAPI.accept(id);
      else await requestAPI.reject(id);
      setRequests(prev => prev.map(r => r._id === id ? { ...r, status: action === 'accept' ? 'accepted' : 'rejected' } : r));
      setToast(action === 'accept' ? 'Request accepted! Student can now book sessions.' : 'Request rejected.');
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      setToast(err.response?.data?.message || 'Action failed.');
      setTimeout(() => setToast(''), 3000);
    } finally {
      setProcessing(null);
    }
  };

  const pending = requests.filter(r => r.status === 'pending');
  const others = requests.filter(r => r.status !== 'pending');

  return (
    <AppLayout>
      {toast && <div style={{ position: 'fixed', top: 80, right: 20, background: '#10b981', color: 'white', padding: '0.875rem 1.25rem', borderRadius: '0.75rem', zIndex: 1000 }}>{toast}</div>}

      <div className="page-header">
        <h1>Mentorship Requests</h1>
        <p>Review and respond to student mentorship requests.</p>
      </div>

      {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>}
      {error && <div className="card empty-state" style={{ color: '#ef4444' }}><p>{error}</p></div>}

      {!loading && !error && (
        <>
          {pending.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontWeight: 700, color: '#1e3a5f', marginBottom: '1rem' }}>🔔 Pending ({pending.length})</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pending.map(req => (
                  <div key={req._id} className="card">
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div className="avatar" style={{ width: 52, height: 52, fontSize: '1.25rem' }}>{req.studentId?.name?.[0]}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: '#1e3a5f', fontSize: '1rem' }}>{req.studentId?.name}</div>
                        <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{req.studentId?.education}</div>
                        {req.studentId?.careerGoal && (
                          <div style={{ color: '#475569', fontSize: '0.85rem', marginTop: '0.375rem' }}>🎯 Goal: {req.studentId.careerGoal}</div>
                        )}
                        {req.studentId?.skills?.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '0.5rem' }}>
                            {req.studentId.skills.slice(0, 4).map(s => <span key={s} className="skill-tag">{s}</span>)}
                          </div>
                        )}
                        {req.message && (
                          <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem', fontSize: '0.875rem', color: '#475569', fontStyle: 'italic', borderLeft: '3px solid #2ec4a1' }}>
                            "{req.message}"
                          </div>
                        )}
                        <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                          Received {new Date(req.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                      <button
                        onClick={() => handle(req._id, 'accept')}
                        className="btn-accent"
                        disabled={processing === req._id + 'accept'}
                        style={{ flex: 1, justifyContent: 'center' }}
                      >
                        {processing === req._id + 'accept' ? 'Accepting...' : '✓ Accept'}
                      </button>
                      <button
                        onClick={() => handle(req._id, 'reject')}
                        style={{ flex: 1, padding: '0.625rem', border: '1.5px solid #e2e8f0', borderRadius: '0.5rem', background: 'white', cursor: 'pointer', color: '#64748b', fontWeight: 600 }}
                        disabled={processing === req._id + 'reject'}
                      >
                        {processing === req._id + 'reject' ? 'Rejecting...' : '✕ Decline'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pending.length === 0 && others.length === 0 && (
            <div className="card empty-state"><p>No mentorship requests yet. Complete your profile to attract students.</p></div>
          )}

          {others.length > 0 && (
            <div>
              <h2 style={{ fontWeight: 700, color: '#1e3a5f', marginBottom: '1rem' }}>Past Requests</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {others.map(req => (
                  <div key={req._id} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className="avatar" style={{ width: 40, height: 40 }}>{req.studentId?.name?.[0]}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{req.studentId?.name}</div>
                      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{new Date(req.createdAt).toLocaleDateString()}</div>
                    </div>
                    <span className={`badge badge-${req.status}`}>{req.status}</span>
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
