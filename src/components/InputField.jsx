/**
 * Reusable form input with floating label and icon support.
 *
 * Props:
 *   id, label, type, value, onChange, placeholder,
 *   icon (ReactNode), error (string), required, autoComplete
 */
function InputField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  icon,
  rightElement,
  error,
  required = false,
  autoComplete,
  disabled = false,
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-sm font-medium text-slate-300"
      >
        {label}
        {required && <span className="text-violet-400 ml-0.5">*</span>}
      </label>

      <div className="relative group">
        {/* Left icon */}
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center text-slate-500 group-focus-within:text-violet-400 transition-colors duration-200">
            {icon}
          </span>
        )}

        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          disabled={disabled}
          style={{ paddingLeft: icon ? '2.75rem' : '1rem', paddingRight: rightElement ? '3rem' : '1rem' }}
          className={[
            'w-full rounded-xl border bg-white/5 text-white placeholder-slate-500',
            'py-3 text-sm outline-none transition-all duration-200',
            error
              ? 'border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
              : 'border-white/10 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20',
            disabled ? 'opacity-50 cursor-not-allowed' : '',
          ].join(' ')}
        />

        {/* Right element (e.g. show/hide password toggle) */}
        {rightElement && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
            {rightElement}
          </span>
        )}
      </div>

      {/* Inline error */}
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1 mt-0.5">
          <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" d="M12 2a10 10 0 100 20A10 10 0 0012 2zm-1 5a1 1 0 112 0v5a1 1 0 11-2 0V7zm1 9a1.25 1.25 0 110-2.5A1.25 1.25 0 0112 16z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

export default InputField
