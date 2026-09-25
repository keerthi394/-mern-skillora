import { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import { requestAPI } from '../../services/api';

export default function StudentRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await requestAPI.getAll();
      setRequests(res.data.requests || []);
    } catch {
      setError('Unable to load requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    try {
      await requestAPI.cancel(id);
      setRequests(prev => prev.map(r => r._id === id ? { ...r, status: 'cancelled' } : r));
      setToast('Request cancelled.');
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      setToast(err.response?.data?.message || 'Failed to cancel.');
      setTimeout(() => setToast(''), 3000);
    }
  };

  return (
    <AppLayout>
      {toast && (
        <div style={{ position: 'fixed', top: 80, right: 20, background: '#1e3a5f', color: 'white', padding: '0.875rem 1.25rem', borderRadius: '0.75rem', zIndex: 1000 }}>
          {toast}
        </div>
      )}

      <div className="page-header">
        <h1>My Requests</h1>
        <p>Track your mentorship request status.</p>
      </div>

      {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>}
      {error && <div className="card empty-state" style={{ color: '#ef4444' }}><p>{error}</p></div>}
      {!loading && !error && requests.length === 0 && (
        <div className="card empty-state"><p>No requests yet. Find a mentor and send your first request!</p></div>
      )}

      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {requests.map(req => (
            <div key={req._id} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              {req.mentorId?.profilePhoto ? (
                <img src={req.mentorId.profilePhoto} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div className="avatar" style={{ width: 48, height: 48 }}>{req.mentorId?.name?.[0]}</div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#1e3a5f' }}>{req.mentorId?.name}</div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{req.mentorId?.expertise?.slice(0, 2).join(', ')}</div>
                  </div>
                  <span className={`badge badge-${req.status}`}>{req.status}</span>
                </div>
                {req.message && <p style={{ color: '#475569', fontSize: '0.85rem', marginTop: '0.5rem', fontStyle: 'italic' }}>"{req.message}"</p>}
                <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                  Sent {new Date(req.createdAt).toLocaleDateString()}
                </div>
                {req.status === 'pending' && (
                  <button onClick={() => cancel(req._id)} style={{ marginTop: '0.75rem', background: 'none', border: '1px solid #e2e8f0', borderRadius: '0.375rem', padding: '0.25rem 0.75rem', fontSize: '0.8rem', cursor: 'pointer', color: '#64748b' }}>
                    Cancel Request
                  </button>
                )}
                {req.status === 'accepted' && (
                  <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: '#d1fae5', borderRadius: '0.5rem', fontSize: '0.85rem', color: '#065f46' }}>
                    ✅ Accepted! You can now book a session with {req.mentorId?.name?.split(' ')[0]}.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
