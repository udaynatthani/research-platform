import { memo, useCallback } from 'react'
import Badge from '../ui/Badge'
const statusColors = { TODO:'slate', IN_PROGRESS:'orange', DONE:'emerald' }
const nextStatus = { TODO:'IN_PROGRESS', IN_PROGRESS:'DONE', DONE:'TODO' }
const KanbanCard = memo(function KanbanCard({ item, onDragStart, onStatusChange }) {
  const handleDragStart = useCallback((e) => { e.dataTransfer.setData('itemId', item.id); onDragStart?.(item) }, [item, onDragStart])
  const handleStatusClick = useCallback((e) => { e.stopPropagation(); onStatusChange(item.id, nextStatus[item.status]) }, [item.id, item.status, onStatusChange])
  return (
    <div 
      draggable 
      onDragStart={handleDragStart}
      className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-200 cursor-grab active:cursor-grabbing group"
    >
      <p className="text-sm font-semibold text-slate-800 mb-3 leading-snug group-hover:text-orange-700 transition-colors">
        {item.title || item.name}
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={handleStatusClick} className="transition-transform active:scale-95">
          <Badge label={item.status} color={statusColors[item.status] || 'slate'} size="sm" />
        </button>
        {item.entityType && (
          <Badge label={item.entityType} color="blue" variant="outline" size="sm" />
        )}
      </div>
    </div>

  )
}, (p,n) => p.item.id===n.item.id && p.item.status===n.item.status && p.item.updatedAt===n.item.updatedAt)
export default KanbanCard
