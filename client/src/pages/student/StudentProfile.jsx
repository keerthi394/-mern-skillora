import { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';

function TagInput({ label, value, onChange, placeholder }) {
  const [input, setInput] = useState('');
  const add = () => {
    const v = input.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setInput('');
  };
  return (
    <div className="form-group">
      <label>{label}</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', border: '1.5px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.5rem', background: 'white', minHeight: 44 }}>
        {value.map(v => (
          <span key={v} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#eff6ff', color: '#1d4ed8', borderRadius: '0.375rem', padding: '0.2rem 0.6rem', fontSize: '0.8rem' }}>
            {v}
            <button type="button" onClick={() => onChange(value.filter(x => x !== v))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1d4ed8', lineHeight: 1 }}>×</button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } if (e.key === ',') { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          style={{ border: 'none', outline: 'none', fontSize: '0.875rem', minWidth: 100, flex: 1 }}
        />
      </div>
      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Press Enter or comma to add</span>
    </div>
  );
}

export default function StudentProfile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: '', bio: '', education: '', location: '',
    profilePhoto: '', skills: [], interests: [], careerGoal: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    userAPI.getProfile().then(r => {
      const u = r.data.user;
      setForm({
        name: u.name || '',
        bio: u.bio || '',
        education: u.education || '',
        location: u.location || '',
        profilePhoto: u.profilePhoto || '',
        skills: u.skills || [],
        interests: u.interests || [],
        careerGoal: u.careerGoal || '',
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await userAPI.updateProfile(form);
      updateUser(res.data.user);
      setToast('Profile updated successfully.');
      setTimeout(() => setToast(''), 3000);
    } catch {
      setToast('Failed to save profile.');
      setTimeout(() => setToast(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const set = (field) => (val) =>
    typeof val === 'string'
      ? setForm(p => ({ ...p, [field]: val }))
      : setForm(p => ({ ...p, [field]: val }));

  if (loading) return <AppLayout><div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div></AppLayout>;

  return (
    <AppLayout>
      {toast && <div style={{ position: 'fixed', top: 80, right: 20, background: toast.includes('success') ? '#10b981' : '#ef4444', color: 'white', padding: '0.875rem 1.25rem', borderRadius: '0.75rem', zIndex: 1000 }}>{toast}</div>}

      <div className="page-header">
        <h1>My Profile</h1>
        <p>Keep your profile up to date to get better mentor recommendations.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1.5rem' }}>
        {/* Photo */}
        <div className="card" style={{ textAlign: 'center', alignSelf: 'start' }}>
          {form.profilePhoto ? (
            <img src={form.profilePhoto} alt="" style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 1rem' }} />
          ) : (
            <div className="avatar" style={{ width: 96, height: 96, fontSize: '2.5rem', margin: '0 auto 1rem' }}>{user?.name?.[0]}</div>
          )}
          <div style={{ fontWeight: 700, color: '#1e3a5f' }}>{user?.name}</div>
          <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem' }}>Student</div>
          <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.25rem' }}>{user?.email}</div>
        </div>

        {/* Form */}
        <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card">
            <h2 style={{ fontWeight: 700, color: '#1e3a5f', marginBottom: '1.25rem' }}>Basic Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" className="form-input" value={form.name} onChange={e => set('name')(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input type="text" className="form-input" placeholder="City, Country" value={form.location} onChange={e => set('location')(e.target.value)} />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>Profile Photo URL</label>
              <input type="url" className="form-input" placeholder="https://..." value={form.profilePhoto} onChange={e => set('profilePhoto')(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>Bio</label>
              <textarea className="form-input" rows={3} placeholder="Tell mentors about yourself..." value={form.bio} onChange={e => set('bio')(e.target.value)} style={{ resize: 'vertical' }} />
            </div>
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>Education</label>
              <input type="text" className="form-input" placeholder="e.g. B.Tech Computer Science, IIT Delhi" value={form.education} onChange={e => set('education')(e.target.value)} />
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontWeight: 700, color: '#1e3a5f', marginBottom: '1.25rem' }}>Goals & Skills</h2>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Career Goal</label>
              <input type="text" className="form-input" placeholder="e.g. Become a full-stack developer at a startup" value={form.careerGoal} onChange={e => set('careerGoal')(e.target.value)} />
            </div>
            <TagInput label="Skills" value={form.skills} onChange={set('skills')} placeholder="Add skill..." />
            <div style={{ marginTop: '1rem' }}>
              <TagInput label="Interests" value={form.interests} onChange={set('interests')} placeholder="Add interest..." />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={saving} style={{ alignSelf: 'flex-start', padding: '0.75rem 2rem' }}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
