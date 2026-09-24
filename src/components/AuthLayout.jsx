import { Link } from 'react-router-dom'

/**
 * Shared auth layout — gradient background, glass card, Skillora branding.
 * @param {React.ReactNode} children - Form content
 * @param {string} title - Card heading
 * @param {string} subtitle - Card sub-heading
 */
function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex items-start justify-center relative overflow-y-auto bg-slate-950 py-8">

      {/* ── Decorative radial blobs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Top-left violet blob */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-violet-600/25 blur-[120px]" />
        {/* Bottom-right indigo blob */}
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-indigo-500/20 blur-[120px]" />
        {/* Center accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-purple-700/10 blur-[100px]" />
      </div>

      {/* ── Subtle grid overlay ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* ── Auth card ── */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link to="/login" className="inline-flex items-center gap-2 group">
            {/* Logo mark */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-shadow duration-300">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              Skill<span className="text-violet-400">ora</span>
            </span>
          </Link>
          <p className="mt-3 text-slate-400 text-sm">
            Student-Mentor Matching Platform
          </p>
        </div>

        {/* Glass card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl shadow-black/40 p-8">
          <h1 className="text-2xl font-bold text-white text-center mb-1">{title}</h1>
          {subtitle && (
            <p className="text-slate-400 text-sm text-center mb-8">{subtitle}</p>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
