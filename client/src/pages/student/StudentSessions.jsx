import { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import { sessionAPI, requestAPI, ratingAPI } from '../../services/api';

function BookingModal({ mentors, onBook, onClose }) {
  const [form, setForm] = useState({ mentorId: mentors[0]?._id || '', date: '', time: '', duration: 60, topic: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!form.mentorId || !form.date || !form.time) return setError('Please fill in mentor, date, and time.');
    setLoading(true);
    setError('');
    try {
      await onBook(form);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book session.');
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: 480 }}>
        <h3 style={{ fontWeight: 700, color: '#1e3a5f', marginBottom: '1.25rem' }}>Book a Session</h3>
        {error && <div style={{ background: '#fee2e2', padding: '0.75rem', borderRadius: '0.5rem', color: '#991b1b', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label>Mentor</label>
            <select className="form-input" value={form.mentorId} onChange={e => setForm(p => ({ ...p, mentorId: e.target.value }))}>
              {mentors.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label>Date</label>
              <input type="date" className="form-input" value={form.date} min={new Date().toISOString().split('T')[0]} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Time</label>
              <input type="time" className="form-input" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label>Duration (minutes)</label>
            <select className="form-input" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: +e.target.value }))}>
              {[30, 45, 60, 90, 120].map(d => <option key={d} value={d}>{d} minutes</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Topic</label>
            <input type="text" className="form-input" placeholder="What will you discuss?" value={form.topic} onChange={e => setForm(p => ({ ...p, topic: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Notes (optional)</label>
            <textarea className="form-input" rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={submit} className="btn-primary" disabled={loading}>{loading ? 'Booking...' : 'Book Session'}</button>
            <button onClick={onClose} className="btn-outline">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RatingModal({ session, onRate, onClose }) {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      await onRate({ mentorId: session.mentorId._id, sessionId: session._id, rating, review });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit rating.');
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: 400 }}>
        <h3 style={{ fontWeight: 700, color: '#1e3a5f', marginBottom: '0.5rem' }}>Rate Your Session</h3>
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.25rem' }}>with {session.mentorId?.name}</p>
        {error && <div style={{ background: '#fee2e2', padding: '0.75rem', borderRadius: '0.5rem', color: '#991b1b', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</div>}
        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '2rem', marginBottom: '1rem', justifyContent: 'center' }}>
          {[1,2,3,4,5].map(i => (
            <span key={i} onClick={() => setRating(i)} style={{ cursor: 'pointer', color: i <= rating ? '#f59e0b' : '#e2e8f0', transition: 'color 0.1s' }}>★</span>
          ))}
        </div>
        <textarea className="form-input" rows={3} placeholder="Write a review (optional)..." value={review} onChange={e => setReview(e.target.value)} style={{ resize: 'vertical', marginBottom: '1rem' }} />
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={submit} className="btn-primary" disabled={loading}>{loading ? 'Submitting...' : 'Submit Rating'}</button>
          <button onClick={onClose} className="btn-outline">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function StudentSessions() {
  const [sessions, setSessions] = useState([]);
  const [acceptedMentors, setAcceptedMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBook, setShowBook] = useState(false);
  const [ratingSession, setRatingSession] = useState(null);
  const [toast, setToast] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [sess, reqs] = await Promise.all([sessionAPI.getAll(), requestAPI.getAll()]);
      setSessions(sess.data.sessions || []);
      const mentors = (reqs.data.requests || [])
        .filter(r => r.status === 'accepted')
        .map(r => r.mentorId)
        .filter(Boolean);
      const unique = mentors.filter((m, i, a) => a.findIndex(x => x._id === m._id) === i);
      setAcceptedMentors(unique);
    } catch {
      setError('Unable to load sessions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleBook = async (form) => {
    const res = await sessionAPI.book(form);
    setSessions(prev => [res.data.session, ...prev]);
    setToast('Session booked!');
    setTimeout(() => setToast(''), 3000);
  };

  const handleRate = async (data) => {
    await ratingAPI.submit(data);
    setToast('Rating submitted!');
    setTimeout(() => setToast(''), 3000);
  };

  const updateStatus = async (id, status) => {
    try {
      await sessionAPI.update(id, { status });
      setSessions(prev => prev.map(s => s._id === id ? { ...s, status } : s));
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

  return (
    <AppLayout>
      {toast && <div style={{ position: 'fixed', top: 80, right: 20, background: '#10b981', color: 'white', padding: '0.875rem 1.25rem', borderRadius: '0.75rem', zIndex: 1000 }}>{toast}</div>}
      {showBook && acceptedMentors.length > 0 && <BookingModal mentors={acceptedMentors} onBook={handleBook} onClose={() => setShowBook(false)} />}
      {ratingSession && <RatingModal session={ratingSession} onRate={handleRate} onClose={() => setRatingSession(null)} />}

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>My Sessions</h1>
          <p>Manage your mentorship sessions and bookings.</p>
        </div>
        {acceptedMentors.length > 0 && (
          <button onClick={() => setShowBook(true)} className="btn-primary">+ Book Session</button>
        )}
      </div>

      {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>}
      {error && <div className="card empty-state" style={{ color: '#ef4444' }}><p>{error}</p></div>}

      {!loading && !error && (
        <>
          {sessions.length === 0 && (
            <div className="card empty-state">
              <p>{acceptedMentors.length > 0 ? 'No sessions yet. Book your first session!' : 'Get a mentorship request accepted to book sessions.'}</p>
            </div>
          )}

          {grouped.upcoming.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontWeight: 700, color: '#1e3a5f', marginBottom: '1rem' }}>Upcoming Sessions</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {grouped.upcoming.map(s => (
                  <div key={s._id} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '2rem' }}>📅</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ fontWeight: 700, color: '#1e3a5f' }}>Session with {s.mentorId?.name}</div>
                        <span className={`badge badge-${s.status}`}>{s.status}</span>
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.25rem' }}>📅 {s.date} at {s.time} · {s.duration} min</div>
                      {s.topic && <div style={{ color: '#475569', fontSize: '0.85rem', marginTop: '0.25rem' }}>📌 {s.topic}</div>}
                      {s.notes && <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem', fontStyle: 'italic' }}>{s.notes}</div>}
                      <button onClick={() => updateStatus(s._id, 'cancelled')} style={{ marginTop: '0.75rem', background: 'none', border: '1px solid #e2e8f0', borderRadius: '0.375rem', padding: '0.25rem 0.75rem', fontSize: '0.8rem', cursor: 'pointer', color: '#64748b' }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {grouped.completed.length > 0 && (
            <div>
              <h2 style={{ fontWeight: 700, color: '#1e3a5f', marginBottom: '1rem' }}>Completed Sessions</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {grouped.completed.map(s => (
                  <div key={s._id} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '2rem' }}>✅</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ fontWeight: 700, color: '#1e3a5f' }}>Session with {s.mentorId?.name}</div>
                        <span className="badge badge-completed">completed</span>
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.25rem' }}>📅 {s.date} at {s.time}</div>
                      {s.topic && <div style={{ color: '#475569', fontSize: '0.85rem', marginTop: '0.25rem' }}>📌 {s.topic}</div>}
                      <button onClick={() => setRatingSession(s)} className="btn-accent btn-sm" style={{ marginTop: '0.75rem' }}>⭐ Rate Session</button>
                    </div>
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
