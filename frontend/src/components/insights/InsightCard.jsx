import { memo, useCallback } from 'react'
import Badge from '../ui/Badge'

const InsightCard = memo(function InsightCard({ insight, onSelect, isSelected }) {
  const handleClick = useCallback(() => onSelect(insight), [insight, onSelect])
  const conf = insight.confidenceScore ?? 0
  const confColor = conf >= 0.7 ? 'bg-emerald-400' : conf >= 0.4 ? 'bg-yellow-400' : 'bg-rose-400'
  return (
    <div onClick={handleClick}
      className={`p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-purple-300 bg-purple-50' : 'bg-white border-slate-100 hover:border-purple-200'}`}>
      <p className="text-sm text-slate-800 line-clamp-3 leading-relaxed">{insight.content}</p>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${confColor}`} style={{ width: `${conf*100}%` }} />
        </div>
        <span className="text-xs text-slate-500 font-mono">{(conf*100).toFixed(0)}%</span>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <Badge label={insight.createdBy||'USER'} color={insight.createdBy==='AI'?'green':'violet'} />
        {insight.paper?.title && <span className="text-xs text-slate-400 truncate">{insight.paper.title}</span>}
      </div>
    </div>
  )
}, (p,n) => p.insight.id===n.insight.id && p.isSelected===n.isSelected)

export default InsightCard
