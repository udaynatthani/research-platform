import { memo, useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import KanbanCard from './KanbanCard'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
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
    <div 
      onDragOver={e => { e.preventDefault(); setDragOver(true) }} 
      onDragLeave={() => setDragOver(false)} 
      onDrop={handleDrop}
      className={`w-72 sm:w-80 shrink-0 bg-slate-50/50 backdrop-blur-sm rounded-2xl p-4 flex flex-col gap-3 border-2 transition-all duration-200 ${dragOver ? 'border-orange-400 bg-orange-50/50 ring-4 ring-orange-400/10' : 'border-transparent'}`}
    >
      <div className="flex items-center justify-between px-1">
        <span className="font-display font-bold text-sm text-slate-800 tracking-tight truncate">{stage.name}</span>
        <div className="flex items-center gap-2">
          <Badge label={stage.items?.length || 0} color="orange" size="sm" />
          <button 
            onClick={() => setShowForm(s => !s)} 
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-100/50 flex items-center justify-center transition-colors"
          >
            <Plus size={16}/>
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm animate-in zoom-in-95 duration-200">
          <input 
            autoFocus 
            value={newItemName} 
            onChange={e => setNewItemName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') createItem(); if (e.key === 'Escape') setShowForm(false) }}
            placeholder="What needs to be done?" 
            className="w-full text-sm p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-slate-50/30"
          />
          <div className="flex gap-2 mt-2">
            <Button size="sm" variant="orange" className="flex-1" onClick={createItem} loading={creating}>Add</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>✕</Button>
          </div>
        </div>
      )}

      <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-320px)] pr-1 scrollbar-thin scrollbar-thumb-slate-200">
        {(stage.items || []).map(item => (
          <KanbanCard key={item.id} item={item} onStatusChange={onStatusChange} />
        ))}
      </div>
    </div>
  )
})

export default KanbanColumn
