import clsx from 'clsx'
import Spinner from './Spinner'
const variants = {
  primary:   'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800',
  secondary: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
  ghost:     'bg-transparent text-slate-700 hover:bg-slate-100',
  danger:    'bg-rose-600 text-white hover:bg-rose-700',
  emerald:   'bg-emerald-600 text-white hover:bg-emerald-700',
  blue:      'bg-blue-600 text-white hover:bg-blue-700',
  outline:   'border border-slate-200 text-slate-700 hover:bg-slate-50 bg-white',
}
const sizes = { sm:'px-3 py-1.5 text-xs gap-1.5', md:'px-4 py-2 text-sm gap-2', lg:'px-5 py-2.5 text-base gap-2' }
export default function Button({ children, variant='primary', size='md', loading=false, disabled, className, ...props }) {
  return (
    <button disabled={disabled||loading}
      className={clsx('inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-display',variants[variant],sizes[size],className)}
      {...props}>
      {loading && <Spinner size={14}/>}
      {children}
    </button>
  )
}
