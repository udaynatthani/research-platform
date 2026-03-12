import { memo, useCallback } from 'react'
import Badge from '../ui/Badge'
const statusColors = { TODO:'slate', IN_PROGRESS:'orange', DONE:'emerald' }
const nextStatus = { TODO:'IN_PROGRESS', IN_PROGRESS:'DONE', DONE:'TODO' }
const KanbanCard = memo(function KanbanCard({ item, onDragStart, onStatusChange }) {
  const handleDragStart = useCallback((e) => { e.dataTransfer.setData('itemId', item.id); onDragStart?.(item) }, [item, onDragStart])
  const handleStatusClick = useCallback((e) => { e.stopPropagation(); onStatusChange(item.id, nextStatus[item.status]) }, [item.id, item.status, onStatusChange])
  return (
    <div draggable onDragStart={handleDragStart}
      className="bg-white rounded-xl border border-slate-100 p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
      <p className="text-sm font-medium text-slate-800 mb-2 leading-tight">{item.title||item.name}</p>
      <div className="flex items-center gap-1.5 flex-wrap">
        <button onClick={handleStatusClick}><Badge label={item.status} color={statusColors[item.status]||'slate'}/></button>
        {item.entityType && <Badge label={item.entityType} color="blue"/>}
      </div>
    </div>
  )
}, (p,n) => p.item.id===n.item.id && p.item.status===n.item.status && p.item.updatedAt===n.item.updatedAt)
export default KanbanCard
