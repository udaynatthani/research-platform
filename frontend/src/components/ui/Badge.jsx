import clsx from 'clsx'
const colorMap = {
  indigo:'bg-indigo-100 text-indigo-700', emerald:'bg-emerald-100 text-emerald-700',
  blue:'bg-blue-100 text-blue-700',       violet:'bg-violet-100 text-violet-700',
  pink:'bg-pink-100 text-pink-700',       orange:'bg-orange-100 text-orange-700',
  rose:'bg-rose-100 text-rose-700',       purple:'bg-purple-100 text-purple-700',
  cyan:'bg-cyan-100 text-cyan-700',       green:'bg-green-100 text-green-700',
  slate:'bg-slate-100 text-slate-700',    yellow:'bg-yellow-100 text-yellow-700',
}
export default function Badge({ label, color='slate', className }) {
  return <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold font-display',colorMap[color]||colorMap.slate,className)}>{label}</span>
}
