import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const roleEmoji = { student: '🎓', mentor: '🏆' }
const roleColor = {
  student: 'from-violet-500 to-indigo-600',
  mentor: 'from-amber-500 to-orange-600',
}

function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) {
    navigate('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
      {/* Blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-violet-600/20 blur-[120px] animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-indigo-500/15 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 w-full max-w-lg mx-4">
        {/* Welcome card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl shadow-black/40 p-8 text-center">
          {/* Avatar */}
          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${roleColor[user.role]} flex items-center justify-center mx-auto mb-5 shadow-lg text-3xl`}>
            {roleEmoji[user.role]}
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">Authenticated via MongoDB Atlas</span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome, {user.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-400 text-sm mb-1">
            Signed in as <span className="text-violet-400 font-medium">{user.email}</span>
          </p>
          <p className="text-slate-500 text-xs mb-8 capitalize">
            Role: <span className={`font-semibold ${user.role === 'mentor' ? 'text-amber-400' : 'text-violet-400'}`}>{user.role}</span>
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: 'Role', value: user.role.charAt(0).toUpperCase() + user.role.slice(1) },
              { label: 'Member since', value: new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) },
              { label: 'Status', value: 'Active' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-white/8 bg-white/4 p-3">
                <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                <p className="text-sm font-semibold text-white">{s.value}</p>
              </div>
            ))}
          </div>

          <p className="text-slate-500 text-xs mb-6">
            🚀 Backend connected · MongoDB Atlas · JWT authenticated
          </p>

          <button
            onClick={handleLogout}
            className="w-full py-3 rounded-xl bg-white/8 border border-white/10 text-slate-300 font-medium text-sm hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all duration-200"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
