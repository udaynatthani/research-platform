import { memo, useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import KanbanCard from './KanbanCard'
import Badge from '../ui/Badge'
import api from '../../lib/api'
import useToast from '../../hooks/useToast'
const KanbanColumn = memo(function KanbanColumn({ stage, projectId, onDrop, onStatusChange, onItemCreated }) {
  const { pushToast } = useToast()
  const [dragOver, setDragOver] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false)
    const itemId = e.dataTransfer.getData('itemId')
    if (itemId) onDrop(itemId, stage.id)
  }, [stage.id, onDrop])
  const createItem = async () => {
    if (!newItemName.trim()) return
    setCreating(true)
    try {
      const { data } = await api.post('/workflow/items', { 
        stageId: stage.id, 
        projectId, 
        title: newItemName, 
        status: 'TODO',
        entityType: 'PROJECT'
      })
      onItemCreated(stage.id, data); setNewItemName(''); setShowForm(false)
    } catch (e) { 
      const msg = e.response?.data?.error || 'Failed to create item'
      pushToast({ message: msg, type:'error' }) 
    }
    setCreating(false)
  }
  return (
    <div onDragOver={e=>{e.preventDefault();setDragOver(true)}} onDragLeave={()=>setDragOver(false)} onDrop={handleDrop}
      className={`w-64 shrink-0 bg-slate-50 rounded-2xl p-3 flex flex-col gap-2 border-2 transition-colors ${dragOver?'drag-over-col':'border-transparent'}`}>
      <div className="flex items-center justify-between px-1 py-1">
        <span className="font-display font-semibold text-sm text-slate-700 truncate">{stage.name}</span>
        <div className="flex items-center gap-1.5">
          <Badge label={stage.items?.length||0} color="orange"/>
          <button onClick={()=>setShowForm(s=>!s)} className="w-6 h-6 rounded-md text-slate-400 hover:text-orange-500 hover:bg-orange-50 flex items-center justify-center"><Plus size={14}/></button>
        </div>
      </div>
      {showForm && (
        <div className="bg-white rounded-xl p-2 border border-slate-100">
          <input autoFocus value={newItemName} onChange={e=>setNewItemName(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter')createItem();if(e.key==='Escape')setShowForm(false)}}
            placeholder="Item name..." className="w-full text-sm p-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-400"/>
          <div className="flex gap-1.5 mt-1.5">
            <button onClick={createItem} disabled={creating} className="flex-1 text-xs bg-orange-500 text-white rounded-lg py-1.5 font-medium hover:bg-orange-600 disabled:opacity-50">Add</button>
            <button onClick={()=>setShowForm(false)} className="text-xs px-2 text-slate-400 hover:text-slate-600">✕</button>
          </div>
        </div>
      )}
      <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-300px)]">
        {(stage.items||[]).map(item=><KanbanCard key={item.id} item={item} onStatusChange={onStatusChange}/>)}
      </div>
    </div>
  )
})
export default KanbanColumn
