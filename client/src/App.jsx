import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Public pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import FindMentors from './pages/student/FindMentors';
import MentorDetail from './pages/student/MentorDetail';
import StudentRequests from './pages/student/StudentRequests';
import StudentSessions from './pages/student/StudentSessions';
import StudentMessages from './pages/student/StudentMessages';

// Mentor pages
import MentorDashboard from './pages/mentor/MentorDashboard';
import MentorProfile from './pages/mentor/MentorProfile';
import MentorRequests from './pages/mentor/MentorRequests';
import MentorSessions from './pages/mentor/MentorSessions';
import MentorMessages from './pages/mentor/MentorMessages';

function ProtectedRoute({ children, role }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) {
    return <Navigate to={user?.role === 'student' ? '/student/dashboard' : '/mentor/dashboard'} replace />;
  }
  return children;
}

function AuthRedirect({ children }) {
  const { user, isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={user?.role === 'student' ? '/student/dashboard' : '/mentor/dashboard'} replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthRedirect><LoginPage /></AuthRedirect>} />
      <Route path="/register" element={<AuthRedirect><RegisterPage /></AuthRedirect>} />

      {/* Student */}
      <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/profile" element={<ProtectedRoute role="student"><StudentProfile /></ProtectedRoute>} />
      <Route path="/student/mentors" element={<ProtectedRoute role="student"><FindMentors /></ProtectedRoute>} />
      <Route path="/student/mentors/:id" element={<ProtectedRoute role="student"><MentorDetail /></ProtectedRoute>} />
      <Route path="/student/requests" element={<ProtectedRoute role="student"><StudentRequests /></ProtectedRoute>} />
      <Route path="/student/sessions" element={<ProtectedRoute role="student"><StudentSessions /></ProtectedRoute>} />
      <Route path="/student/messages" element={<ProtectedRoute role="student"><StudentMessages /></ProtectedRoute>} />

      {/* Mentor */}
      <Route path="/mentor/dashboard" element={<ProtectedRoute role="mentor"><MentorDashboard /></ProtectedRoute>} />
      <Route path="/mentor/profile" element={<ProtectedRoute role="mentor"><MentorProfile /></ProtectedRoute>} />
      <Route path="/mentor/requests" element={<ProtectedRoute role="mentor"><MentorRequests /></ProtectedRoute>} />
      <Route path="/mentor/sessions" element={<ProtectedRoute role="mentor"><MentorSessions /></ProtectedRoute>} />
      <Route path="/mentor/messages" element={<ProtectedRoute role="mentor"><MentorMessages /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
