/**
 * Primary gradient button with loading state and hover lift.
 *
 * Props:
 *   children, type, onClick, loading, disabled, fullWidth
 */
function Button({
  children,
  type = 'button',
  onClick,
  loading = false,
  disabled = false,
  fullWidth = true,
  variant = 'primary',
}) {
  const base =
    'relative inline-flex items-center justify-center gap-2 font-semibold text-sm rounded-xl px-5 py-3 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 select-none'

  const variants = {
    primary:
      'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-violet-500 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg',
    ghost:
      'border border-white/10 text-slate-300 hover:bg-white/5 hover:text-white focus-visible:ring-white/20',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={[base, variants[variant], fullWidth ? 'w-full' : ''].join(' ')}
    >
      {loading && (
        <svg
          className="w-4 h-4 animate-spin text-white/70"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {children}
    </button>
  )
}

export default Button
