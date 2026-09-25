import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import { mentorAPI, requestAPI, ratingAPI } from '../../services/api';

function Stars({ rating }) {
  return <span>{[1,2,3,4,5].map(i => <span key={i} className={i <= Math.round(rating) ? 'star' : 'star-empty'}>★</span>)}</span>;
}

export default function MentorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reqMessage, setReqMessage] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [toast, setToast] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    Promise.all([
      mentorAPI.getById(id),
      ratingAPI.getMentorRatings(id),
    ]).then(([m, r]) => {
      setMentor(m.data.mentor);
      setRatings(r.data.ratings || []);
      setLoading(false);
    }).catch(() => {
      setError('Unable to load mentor profile.');
      setLoading(false);
    });
  }, [id]);

  const sendRequest = async () => {
    setRequesting(true);
    try {
      await requestAPI.send({ mentorId: id, message: reqMessage || 'Hi! I would love to learn from you.' });
      setToast('Request sent successfully!');
      setShowForm(false);
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      setToast(err.response?.data?.message || 'Failed to send request.');
      setTimeout(() => setToast(''), 3000);
    } finally {
      setRequesting(false);
    }
  };

  if (loading) return <AppLayout><div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div></AppLayout>;
  if (error) return <AppLayout><div className="card empty-state" style={{ color: '#ef4444' }}><p>{error}</p></div></AppLayout>;

  return (
    <AppLayout>
      {toast && (
        <div style={{ position: 'fixed', top: 80, right: 20, background: toast.includes('success') ? '#10b981' : '#ef4444', color: 'white', padding: '0.875rem 1.25rem', borderRadius: '0.75rem', zIndex: 1000 }}>
          {toast}
        </div>
      )}

      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.9rem' }}>
        ← Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem' }}>
        {/* Left: Profile card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            {mentor.profilePhoto ? (
              <img src={mentor.profilePhoto} alt="" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 1rem' }} />
            ) : (
              <div className="avatar" style={{ width: 100, height: 100, fontSize: '2.5rem', margin: '0 auto 1rem' }}>{mentor.name[0]}</div>
            )}
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e3a5f' }}>{mentor.name}</h1>
            {mentor.experience && <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>{mentor.experience}</p>}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
              <Stars rating={mentor.rating || 0} />
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{(mentor.rating || 0).toFixed(1)} ({mentor.ratingCount || 0} reviews)</span>
            </div>
            {mentor.totalSessions > 0 && <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.5rem' }}>✅ {mentor.totalSessions} sessions completed</div>}
            <button onClick={() => setShowForm(!showForm)} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1.25rem' }}>
              Request Mentorship
            </button>
          </div>

          {/* Details */}
          <div className="card">
            {mentor.location && <div style={{ marginBottom: '0.75rem' }}><span style={{ fontWeight: 600, fontSize: '0.85rem' }}>📍 Location</span><div style={{ color: '#475569', fontSize: '0.85rem', marginTop: '0.25rem' }}>{mentor.location}</div></div>}
            {mentor.sessionDuration && <div style={{ marginBottom: '0.75rem' }}><span style={{ fontWeight: 600, fontSize: '0.85rem' }}>⏱ Session Duration</span><div style={{ color: '#475569', fontSize: '0.85rem', marginTop: '0.25rem' }}>{mentor.sessionDuration} minutes</div></div>}
            {mentor.availability?.length > 0 && <div><span style={{ fontWeight: 600, fontSize: '0.85rem' }}>🕐 Availability</span><div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>{mentor.availability.map(a => <div key={a} style={{ color: '#475569', fontSize: '0.8rem', background: '#f8fafc', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>{a}</div>)}</div></div>}
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {showForm && (
            <div className="card" style={{ border: '2px solid #1e3a5f' }}>
              <h3 style={{ fontWeight: 700, color: '#1e3a5f', marginBottom: '0.75rem' }}>Send Mentorship Request</h3>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Introduce yourself and explain what you hope to learn..."
                value={reqMessage}
                onChange={e => setReqMessage(e.target.value)}
                style={{ resize: 'vertical' }}
              />
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button onClick={sendRequest} className="btn-primary" disabled={requesting}>{requesting ? 'Sending...' : 'Send Request'}</button>
                <button onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
              </div>
            </div>
          )}

          {mentor.bio && (
            <div className="card">
              <h2 style={{ fontWeight: 700, color: '#1e3a5f', marginBottom: '0.75rem' }}>About</h2>
              <p style={{ color: '#475569', lineHeight: 1.7 }}>{mentor.bio}</p>
            </div>
          )}

          {mentor.expertise?.length > 0 && (
            <div className="card">
              <h2 style={{ fontWeight: 700, color: '#1e3a5f', marginBottom: '0.75rem' }}>Expertise</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {mentor.expertise.map(e => <span key={e} className="skill-tag" style={{ fontSize: '0.85rem', padding: '0.3rem 0.8rem' }}>{e}</span>)}
              </div>
            </div>
          )}

          {mentor.education && (
            <div className="card">
              <h2 style={{ fontWeight: 700, color: '#1e3a5f', marginBottom: '0.75rem' }}>Education</h2>
              <p style={{ color: '#475569' }}>{mentor.education}</p>
            </div>
          )}

          {/* Reviews */}
          <div className="card">
            <h2 style={{ fontWeight: 700, color: '#1e3a5f', marginBottom: '1rem' }}>Reviews ({ratings.length})</h2>
            {ratings.length === 0 ? <p style={{ color: '#64748b' }}>No reviews yet.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {ratings.map(r => (
                  <div key={r._id} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <div className="avatar" style={{ width: 36, height: 36, fontSize: '0.875rem' }}>{r.studentId?.name?.[0]}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.studentId?.name}</div>
                        <Stars rating={r.rating} />
                        {r.review && <p style={{ color: '#475569', fontSize: '0.85rem', marginTop: '0.375rem' }}>{r.review}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`@media(max-width:768px){.mentor-detail-grid{grid-template-columns:1fr!important}}`}</style>
    </AppLayout>
  );
}
