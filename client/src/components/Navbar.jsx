import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  return (
    <nav style={{ background: '#1e3a5f', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <img src="/logo.png" alt="MentorLink" style={{ width: 40, height: 40, borderRadius: '0.5rem', objectFit: 'cover' }} />
          <span style={{ color: 'white', fontWeight: 700, fontSize: '1.25rem' }}>MentorLink</span>
        </Link>

        {/* Desktop */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {!user ? (
            <>
              <Link to="/login" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Login</Link>
              <Link to="/register" className="btn-accent btn-sm">Get Started</Link>
            </>
          ) : (
            <>
              <Link
                to={user.role === 'student' ? '/student/dashboard' : '/mentor/dashboard'}
                style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}
              >
                Dashboard
              </Link>
              <button onClick={handleLogout} className="btn-outline btn-sm" style={{ color: 'rgba(255,255,255,0.85)', borderColor: 'rgba(255,255,255,0.4)' }}>Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
