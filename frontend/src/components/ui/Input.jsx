import { forwardRef } from 'react'
import clsx from 'clsx'

const Input = forwardRef(function Input({ label, error, type='text', className, as='input', rows=3, children, ...props }, ref) {
  const base = clsx(
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow',
    error && 'border-rose-400',
    className
  )
  
  const elementProps = { ...props, ref, className: base }

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-semibold text-slate-600 font-display">{label}</label>}
      {as === 'textarea' ? (
        <textarea {...elementProps} className={clsx(base, 'resize-none')} rows={rows} />
      ) : as === 'select' ? (
        <select {...elementProps}>{children}</select>
      ) : (
        <input type={type} {...elementProps} />
      )}
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  )
})

export default Input
