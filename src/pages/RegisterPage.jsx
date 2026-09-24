import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import InputField from '../components/InputField'
import Button from '../components/Button'

/* ─── SVG icon helpers ─────────────────────────────────────────────── */
const UserIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const MailIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
)

const LockIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const EyeIcon = ({ open }) =>
  open ? (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )

const ROLES = [
  {
    id: 'student',
    label: 'Student',
    description: 'I want to learn and grow',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
  {
    id: 'mentor',
    label: 'Mentor',
    description: 'I want to teach and guide',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
]

/* ─── Password strength helper ──────────────────────────────────────── */
function getPasswordStrength(pwd) {
  if (!pwd) return { score: 0, label: '', color: '' }
  let score = 0
  if (pwd.length >= 8) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  const map = [
    { label: '', color: '' },
    { label: 'Weak', color: 'bg-red-500' },
    { label: 'Fair', color: 'bg-amber-500' },
    { label: 'Good', color: 'bg-yellow-400' },
    { label: 'Strong', color: 'bg-emerald-500' },
  ]
  return { score, ...map[score] }
}

/* ─── Component ─────────────────────────────────────────────────────── */
function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const strength = getPasswordStrength(form.password)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const selectRole = (roleId) => {
    setForm((prev) => ({ ...prev, role: roleId }))
    if (errors.role) setErrors((prev) => ({ ...prev, role: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Full name is required.'
    if (!form.email.trim()) errs.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address.'
    if (!form.password) errs.password = 'Password is required.'
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.'
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password.'
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.'
    if (!form.role) errs.role = 'Please select a role to continue.'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) return setErrors(errs)

    setLoading(true)
    // Simulated async — replace with real API call
    setTimeout(() => setLoading(false), 1500)
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join thousands of students and mentors on Skillora"
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

        {/* Full Name */}
        <InputField
          id="name"
          label="Full name"
          type="text"
          value={form.name}
          onChange={handleChange}
          placeholder="Jane Doe"
          icon={<UserIcon />}
          error={errors.name}
          required
          autoComplete="name"
        />

        {/* Email */}
        <InputField
          id="email"
          label="Email address"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          icon={<MailIcon />}
          error={errors.email}
          required
          autoComplete="email"
        />

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <InputField
            id="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={handleChange}
            placeholder="Min. 8 characters"
            icon={<LockIcon />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-slate-500 hover:text-slate-300 transition-colors duration-150"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon open={showPassword} />
              </button>
            }
            error={errors.password}
            required
            autoComplete="new-password"
          />

          {/* Password strength bar */}
          {form.password && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={[
                      'h-1 flex-1 rounded-full transition-all duration-300',
                      i <= strength.score ? strength.color : 'bg-white/10',
                    ].join(' ')}
                  />
                ))}
              </div>
              <span
                className={[
                  'text-xs font-medium transition-colors duration-200',
                  strength.score <= 1 ? 'text-red-400' :
                  strength.score === 2 ? 'text-amber-400' :
                  strength.score === 3 ? 'text-yellow-400' :
                  'text-emerald-400',
                ].join(' ')}
              >
                {strength.label}
              </span>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <InputField
          id="confirmPassword"
          label="Confirm password"
          type={showConfirm ? 'text' : 'password'}
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="Re-enter your password"
          icon={<LockIcon />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="text-slate-500 hover:text-slate-300 transition-colors duration-150"
              aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
            >
              <EyeIcon open={showConfirm} />
            </button>
          }
          error={errors.confirmPassword}
          required
          autoComplete="new-password"
        />

        {/* Role selector */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-300">
            I am a<span className="text-violet-400 ml-0.5">*</span>
          </span>
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map((r) => {
              const selected = form.role === r.id
              return (
                <button
                  key={r.id}
                  type="button"
                  id={`role-${r.id}`}
                  onClick={() => selectRole(r.id)}
                  className={[
                    'flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all duration-200 cursor-pointer',
                    selected
                      ? 'border-violet-500 bg-violet-500/10 text-violet-300 shadow-lg shadow-violet-500/10'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:bg-white/8 hover:text-slate-300',
                  ].join(' ')}
                  aria-pressed={selected}
                >
                  <div
                    className={[
                      'w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-200',
                      selected ? 'bg-violet-500/20 text-violet-400' : 'bg-white/5 text-slate-500',
                    ].join(' ')}
                  >
                    {r.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-none mb-0.5">{r.label}</p>
                    <p className="text-xs opacity-70 leading-tight">{r.description}</p>
                  </div>
                  {selected && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
          {errors.role && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M12 2a10 10 0 100 20A10 10 0 0012 2zm-1 5a1 1 0 112 0v5a1 1 0 11-2 0V7zm1 9a1.25 1.25 0 110-2.5A1.25 1.25 0 0112 16z" clipRule="evenodd" />
              </svg>
              {errors.role}
            </p>
          )}
        </div>

        {/* Submit */}
        <Button type="submit" loading={loading} fullWidth>
          {loading ? 'Creating account…' : 'Create Account'}
        </Button>

        {/* Terms notice */}
        <p className="text-center text-xs text-slate-500 leading-relaxed">
          By creating an account, you agree to our{' '}
          <button type="button" className="text-violet-400 hover:text-violet-300 transition-colors">Terms of Service</button>
          {' '}and{' '}
          <button type="button" className="text-violet-400 hover:text-violet-300 transition-colors">Privacy Policy</button>.
        </p>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-slate-500 uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Login link */}
        <p className="text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-violet-400 font-semibold hover:text-violet-300 transition-colors duration-150"
          >
            Sign in →
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}

export default RegisterPage
