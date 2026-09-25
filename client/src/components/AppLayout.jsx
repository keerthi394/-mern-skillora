import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../services/api';

const StudentLinks = [
  { to: '/student/dashboard', label: 'Dashboard', icon: '⊞' },
  { to: '/student/mentors', label: 'Find Mentors', icon: '🔍' },
  { to: '/student/requests', label: 'My Requests', icon: '📨' },
  { to: '/student/sessions', label: 'Sessions', icon: '📅' },
  { to: '/student/messages', label: 'Messages', icon: '💬' },
  { to: '/student/profile', label: 'Profile', icon: '👤' },
];

const MentorLinks = [
  { to: '/mentor/dashboard', label: 'Dashboard', icon: '⊞' },
  { to: '/mentor/requests', label: 'Requests', icon: '📨' },
  { to: '/mentor/sessions', label: 'Sessions', icon: '📅' },
  { to: '/mentor/messages', label: 'Messages', icon: '💬' },
  { to: '/mentor/profile', label: 'Profile', icon: '👤' },
];

function NotificationDropdown({ onClose }) {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationAPI.getAll().then(r => {
      setNotifs(r.data.notifications);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    await notificationAPI.markRead(id);
    setNotifs(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
  };

  const markAll = async () => {
    await notificationAPI.markAllRead();
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div style={{ position: 'absolute', right: 0, top: '110%', width: 320, background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.75rem', boxShadow: '0 10px 40px rgba(0,0,0,0.12)', zIndex: 1000, overflow: 'hidden' }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 600, color: '#1e3a5f' }}>Notifications</span>
        <button onClick={markAll} style={{ fontSize: '0.75rem', color: '#2ec4a1', background: 'none', border: 'none', cursor: 'pointer' }}>Mark all read</button>
      </div>
      <div style={{ maxHeight: 320, overflowY: 'auto' }}>
        {loading && <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>Loading...</div>}
        {!loading && notifs.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No notifications</div>}
        {notifs.map(n => (
          <div
            key={n._id}
            onClick={() => markRead(n._id)}
            style={{
              padding: '0.875rem 1rem',
              borderBottom: '1px solid #f1f5f9',
              background: n.read ? 'white' : '#f0f9ff',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            <p style={{ fontSize: '0.85rem', color: '#1a202c' }}>{n.message}</p>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>{new Date(n.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  const links = user?.role === 'student' ? StudentLinks : MentorLinks;

  useEffect(() => {
    notificationAPI.getAll().then(r => setUnreadCount(r.data.unreadCount || 0)).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="main-layout">
      {/* Sidebar */}
      <aside className="sidebar" style={{ display: mobileOpen ? 'flex' : undefined }}>
        <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/logo.png" alt="MentorLink" style={{ width: 40, height: 40, borderRadius: '0.5rem', objectFit: 'cover' }} />
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>MentorLink</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '0.75rem 0' }}>
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            {user?.profilePhoto ? (
              <img src={user.profilePhoto} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
            )}
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: 'white', fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-outline" style={{ width: '100%', justifyContent: 'center', color: 'rgba(255,255,255,0.8)', borderColor: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <header style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '0 1.5rem', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ display: 'none', background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#1e3a5f' }}
            className="mobile-menu-btn"
          >☰</button>
          <span style={{ fontWeight: 600, color: '#1e3a5f', fontSize: '0.9rem' }}>
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: '0.25rem' }}
              >
                <span style={{ fontSize: '1.25rem' }}>🔔</span>
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: 0, right: 0,
                    background: '#ef4444', color: 'white',
                    borderRadius: '50%', width: 16, height: 16,
                    fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700,
                  }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>
              {showNotifs && <NotificationDropdown onClose={() => setShowNotifs(false)} />}
            </div>
          </div>
        </header>

        <main className="main-content">
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sidebar { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
