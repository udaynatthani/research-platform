import clsx from 'clsx'
const accentMap = { indigo:'border-l-indigo-500', emerald:'border-l-emerald-500', blue:'border-l-blue-500', violet:'border-l-violet-500', pink:'border-l-pink-500', orange:'border-l-orange-500', rose:'border-l-rose-500', purple:'border-l-purple-500', cyan:'border-l-cyan-500', green:'border-l-green-500', slate:'border-l-slate-400' }
export default function Card({ children, accentColor, className, onClick }) {
  return (
    <div onClick={onClick} className={clsx('bg-white rounded-2xl shadow-sm border border-gray-100',accentColor?`border-l-4 ${accentMap[accentColor]||''}`:'',onClick&&'cursor-pointer hover:shadow-md transition-shadow',className)}>
      {children}
    </div>
  )
}
