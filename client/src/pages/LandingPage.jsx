import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

function StarRating({ rating }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= rating ? 'star' : 'star-empty'}>★</span>
      ))}
    </span>
  );
}

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2a5298 60%, #1e3a5f 100%)', color: 'white', padding: '5rem 1.5rem 4rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <img src="/logo.png" alt="MentorLink" style={{ width: 100, height: 100, borderRadius: '1.5rem', objectFit: 'cover', marginBottom: '2rem', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }} />
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem' }}>
            Bridging Knowledge<br />
            <span style={{ color: '#2ec4a1' }}>and Opportunities</span>
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.8)', maxWidth: 600, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            Connect with the right mentor, learn from real experience, and move closer to your career goals.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {user ? (
              <Link to={user.role === 'student' ? '/student/mentors' : '/mentor/dashboard'} className="btn-accent" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
                {user.role === 'student' ? 'Find a Mentor' : 'Go to Dashboard'}
              </Link>
            ) : (
              <>
                <Link to="/register?role=student" className="btn-accent" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>Find a Mentor</Link>
                <Link to="/register?role=mentor" className="btn-outline" style={{ padding: '0.875rem 2rem', fontSize: '1rem', borderColor: 'rgba(255,255,255,0.5)', color: 'white' }}>Become a Mentor</Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: 'white', padding: '2rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '2rem', textAlign: 'center' }}>
          {[{ n: '500+', l: 'Expert Mentors' }, { n: '2,000+', l: 'Students Helped' }, { n: '10,000+', l: 'Sessions Completed' }, { n: '4.8★', l: 'Average Rating' }].map(s => (
            <div key={s.l}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e3a5f' }}>{s.n}</div>
              <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#1e3a5f', textAlign: 'center', marginBottom: '0.5rem' }}>How MentorLink Works</h2>
          <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '3rem' }}>Simple steps to connect and grow</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            {[
              { step: '01', title: 'Create Your Profile', desc: 'Sign up and tell us about your skills, goals, and what you want to achieve.', icon: '👤' },
              { step: '02', title: 'Find the Right Match', desc: 'Our algorithm connects you with mentors who match your goals and skills perfectly.', icon: '🎯' },
              { step: '03', title: 'Connect & Learn', desc: 'Book sessions, chat in real-time, and grow under the guidance of an expert mentor.', icon: '🚀' },
            ].map(s => (
              <div key={s.step} className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{s.icon}</div>
                <div style={{ color: '#2ec4a1', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>STEP {s.step}</div>
                <h3 style={{ fontWeight: 700, color: '#1e3a5f', marginBottom: '0.75rem' }}>{s.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ background: '#1e3a5f', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'white', textAlign: 'center', marginBottom: '3rem' }}>Everything You Need to Succeed</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {[
              { icon: '🎯', title: 'Goal-Based Matching', desc: 'Matched by your skills, career goal, and mentor expertise.' },
              { icon: '👨‍💼', title: 'Expert Mentors', desc: 'Real professionals from top companies in every field.' },
              { icon: '📅', title: 'Session Booking', desc: 'Book 1-on-1 sessions at times that work for you.' },
              { icon: '💬', title: 'Real-Time Messaging', desc: 'Chat directly with your mentor anytime.' },
              { icon: '⭐', title: 'Ratings & Reviews', desc: 'Find the best mentors through community ratings.' },
              { icon: '🔒', title: 'Safe & Secure', desc: 'JWT-protected accounts and private conversations.' },
            ].map(f => (
              <div key={f.title} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{f.icon}</div>
                <h3 style={{ color: 'white', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.95rem' }}>{f.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#1e3a5f', marginBottom: '1rem' }}>Ready to take the next step?</h2>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Join thousands of students already growing with MentorLink.</p>
        {!user && (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn-primary" style={{ padding: '0.875rem 2rem' }}>Get Started Free</Link>
            <Link to="/login" className="btn-outline" style={{ padding: '0.875rem 2rem' }}>Sign In</Link>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer style={{ background: '#0f2340', padding: '2rem 1.5rem', textAlign: 'center' }}>
        <img src="/logo.png" alt="MentorLink" style={{ width: 36, height: 36, borderRadius: '0.375rem', objectFit: 'cover', marginBottom: '0.75rem' }} />
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>© 2026 MentorLink — Bridging Knowledge and Opportunities</p>
      </footer>
    </div>
  );
}
