import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: searchParams.get('role') || 'student' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const onChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setErrors(p => ({ ...p, [e.target.name]: '' }));
    setApiError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required.';
    if (!form.email) errs.email = 'Email is required.';
    if (!form.password || form.password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (!form.role) errs.role = 'Please select a role.';
    if (Object.keys(errs).length) return setErrors(errs);

    setLoading(true);
    try {
      const { user } = await register(form);
      navigate(user.role === 'student' ? '/student/profile' : '/mentor/profile', { replace: true });
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setErrors(data.errors);
      else setApiError(data?.message || 'Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a5f 0%, #2a5298 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: 'white', borderRadius: '1rem', padding: '2.5rem', width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/">
            <img src="/logo.png" alt="MentorLink" style={{ width: 64, height: 64, borderRadius: '0.75rem', objectFit: 'cover', marginBottom: '1rem' }} />
          </Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e3a5f' }}>Join MentorLink</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>Bridging Knowledge and Opportunities</p>
        </div>

        {apiError && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem', color: '#991b1b', fontSize: '0.875rem' }}>
            {apiError}
          </div>
        )}

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Role selector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {['student', 'mentor'].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setForm(p => ({ ...p, role: r }))}
                style={{
                  padding: '0.875rem',
                  border: `2px solid ${form.role === r ? '#1e3a5f' : '#e2e8f0'}`,
                  borderRadius: '0.5rem',
                  background: form.role === r ? '#eff6ff' : 'white',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{r === 'student' ? '🎓' : '👨‍💼'}</div>
                <div style={{ fontWeight: 600, color: '#1e3a5f', textTransform: 'capitalize', fontSize: '0.9rem' }}>{r}</div>
              </button>
            ))}
          </div>
          {errors.role && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.role}</span>}

          <div className="form-group">
            <label>Full Name</label>
            <input id="reg-name" name="name" type="text" className="form-input" placeholder="John Doe" value={form.name} onChange={onChange} style={errors.name ? { borderColor: '#ef4444' } : {}} />
            {errors.name && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>Email address</label>
            <input id="reg-email" name="email" type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={onChange} style={errors.email ? { borderColor: '#ef4444' } : {}} />
            {errors.email && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input id="reg-password" name="password" type="password" className="form-input" placeholder="Minimum 8 characters" value={form.password} onChange={onChange} style={errors.password ? { borderColor: '#ef4444' } : {}} />
            {errors.password && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.password}</span>}
          </div>

          <button id="reg-submit" type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginTop: '0.5rem' }}>
            {loading ? 'Creating account...' : `Create ${form.role} account`}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#1e3a5f', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
