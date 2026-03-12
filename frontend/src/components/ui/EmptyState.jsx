import Button from './Button'
export default function EmptyState({ icon:Icon, title, description, action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      {Icon && <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-2"><Icon size={32}/></div>}
      <h3 className="font-display font-semibold text-slate-700 text-lg">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-xs">{description}</p>}
      {action && <Button onClick={action} variant="secondary" size="md" className="mt-2">{actionLabel}</Button>}
    </div>
  )
}
