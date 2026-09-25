import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import { mentorAPI, requestAPI } from '../../services/api';

function Stars({ rating }) {
  return (
    <span>
      {[1,2,3,4,5].map(i => <span key={i} className={i <= rating ? 'star' : 'star-empty'}>★</span>)}
    </span>
  );
}

function MentorCard({ mentor, onRequest, requesting }) {
  return (
    <div className="mentor-card">
      <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
        {mentor.profilePhoto ? (
          <img src={mentor.profilePhoto} alt="" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div className="avatar" style={{ width: 56, height: 56, fontSize: '1.25rem' }}>{mentor.name[0]}</div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
            <div style={{ fontWeight: 700, color: '#1e3a5f', fontSize: '1rem' }}>{mentor.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
              <Stars rating={Math.round(mentor.rating || 0)} />
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>({mentor.ratingCount || 0})</span>
            </div>
          </div>
          {mentor.experience && <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.125rem' }}>{mentor.experience}</div>}
          {mentor.bio && <div style={{ color: '#475569', fontSize: '0.85rem', marginTop: '0.5rem', lineHeight: 1.4 }}>{mentor.bio.slice(0, 100)}{mentor.bio.length > 100 ? '...' : ''}</div>}
        </div>
      </div>

      {mentor.expertise?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
          {mentor.expertise.slice(0, 5).map(e => <span key={e} className="skill-tag">{e}</span>)}
        </div>
      )}

      {mentor.availability?.length > 0 && (
        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
          🕐 {mentor.availability.slice(0, 2).join(', ')}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
        <Link to={`/student/mentors/${mentor._id}`} className="btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }}>View Profile</Link>
        <button
          onClick={() => onRequest(mentor._id)}
          className="btn-primary btn-sm"
          style={{ flex: 1, justifyContent: 'center' }}
          disabled={requesting === mentor._id}
        >
          {requesting === mentor._id ? 'Sending...' : 'Request Mentorship'}
        </button>
      </div>
    </div>
  );
}

export default function FindMentors() {
  const [mentors, setMentors] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [skill, setSkill] = useState('');
  const [requesting, setRequesting] = useState(null);
  const [toast, setToast] = useState('');

  const fetchMentors = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search) params.search = search;
      if (skill) params.skill = skill;
      const res = await mentorAPI.getAll(params);
      setMentors(res.data.mentors || []);
    } catch {
      setError('Unable to load mentors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
    mentorAPI.getRecommended().then(r => setRecommended(r.data.recommended?.slice(0, 3) || [])).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMentors();
  };

  const handleRequest = async (mentorId) => {
    setRequesting(mentorId);
    try {
      await requestAPI.send({ mentorId, message: 'Hi! I would love to learn from you.' });
      setToast('Request sent successfully!');
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      setToast(err.response?.data?.message || 'Failed to send request.');
      setTimeout(() => setToast(''), 3000);
    } finally {
      setRequesting(null);
    }
  };

  return (
    <AppLayout>
      {toast && (
        <div style={{ position: 'fixed', top: 80, right: 20, background: toast.includes('success') ? '#10b981' : '#ef4444', color: 'white', padding: '0.875rem 1.25rem', borderRadius: '0.75rem', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 1000, fontSize: '0.9rem' }}>
          {toast}
        </div>
      )}

      <div className="page-header">
        <h1>Find Mentors</h1>
        <p>Discover mentors who match your skills and career goals.</p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search by name, skill, or expertise..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 220 }}
        />
        <input
          type="text"
          className="form-input"
          placeholder="Filter by skill..."
          value={skill}
          onChange={e => setSkill(e.target.value)}
          style={{ width: 180 }}
        />
        <button type="submit" className="btn-primary">Search</button>
        <button type="button" className="btn-outline" onClick={() => { setSearch(''); setSkill(''); setTimeout(fetchMentors, 0); }}>Clear</button>
      </form>

      {/* Recommended */}
      {recommended.length > 0 && !search && !skill && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontWeight: 700, color: '#1e3a5f', marginBottom: '1rem' }}>⭐ Recommended for You</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {recommended.map(({ mentor, score }) => (
              <div key={mentor._id} style={{ position: 'relative' }}>
                {score > 0 && (
                  <div style={{ position: 'absolute', top: '-8px', right: '12px', background: '#2ec4a1', color: 'white', borderRadius: '999px', padding: '0.2rem 0.6rem', fontSize: '0.7rem', fontWeight: 700, zIndex: 1 }}>
                    {score}% Match
                  </div>
                )}
                <MentorCard mentor={mentor} onRequest={handleRequest} requesting={requesting} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All mentors */}
      <h2 style={{ fontWeight: 700, color: '#1e3a5f', marginBottom: '1rem' }}>
        {search || skill ? `Search Results (${mentors.length})` : `All Mentors (${mentors.length})`}
      </h2>

      {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>}
      {error && <div className="card empty-state" style={{ color: '#ef4444' }}><p>{error}</p><button onClick={fetchMentors} className="btn-outline btn-sm" style={{ marginTop: '1rem' }}>Try Again</button></div>}
      {!loading && !error && mentors.length === 0 && (
        <div className="card empty-state"><p>No mentors found. Try a different search.</p></div>
      )}
      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {mentors.map(mentor => (
            <MentorCard key={mentor._id} mentor={mentor} onRequest={handleRequest} requesting={requesting} />
          ))}
        </div>
      )}
    </AppLayout>
  );
}
