import { useState, useCallback } from 'react'
import { Plus, GitBranch } from 'lucide-react'
import api from '../lib/api'
import useApi from '../hooks/useApi'
import useProject from '../hooks/useProject'
import useToast from '../hooks/useToast'
import KanbanColumn from '../components/workflow/KanbanColumn'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'

export default function WorkflowPage() {
  const { activeProject } = useProject()
  const { pushToast } = useToast()
  const pid = activeProject?.id
  const { data: stages = [], loading, refetch } = useApi(
    () => pid ? api.get(`/workflow/stages/${pid}`).then(r => r.data) : Promise.resolve([]),
    [pid]
  )
  const [addingStageName, setAddingStageName] = useState('')
  const [showStageForm, setShowStageForm] = useState(false)
  const [creatingStage, setCreatingStage] = useState(false)

  const handleDrop = useCallback(async (itemId, stageId) => {
    try {
      await api.patch(`/workflow/items/${itemId}/move`, { stageId })
      refetch()
    } catch { pushToast({ message: 'Move failed', type: 'error' }) }
  }, [refetch])

  const handleStatusChange = useCallback(async (itemId, status) => {
    try {
      await api.patch(`/workflow/items/${itemId}/status`, { status })
      refetch()
    } catch { pushToast({ message: 'Status update failed', type: 'error' }) }
  }, [refetch])

  const handleItemCreated = useCallback((stageId, newItem) => {
    refetch()
  }, [refetch])

  const addStage = async () => {
    if (!addingStageName.trim() || !pid) return
    setCreatingStage(true)
    try {
      await api.post('/workflow/stages', { projectId: pid, name: addingStageName, position: stages.length })
      setAddingStageName(''); setShowStageForm(false); refetch()
    } catch { pushToast({ message: 'Failed to create stage', type: 'error' }) }
    setCreatingStage(false)
  }

  if (!pid) return <div className="text-slate-400 text-sm">Select a project from the top bar to view its workflow.</div>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900">Workflow</h1>
          <p className="text-slate-500 text-sm">Kanban board for {activeProject?.title}</p>
        </div>
        <Button variant="ghost" className="!border !border-orange-200 !text-orange-600 hover:!bg-orange-50" onClick={() => setShowStageForm(s=>!s)}>
          <Plus size={16}/> Add Stage
        </Button>
      </div>

      {loading ? (
        <div className="flex gap-4">{[...Array(3)].map((_, i) => <div key={i} className="w-64 h-80 skeleton rounded-2xl shrink-0" />)}</div>
      ) : stages.length === 0 && !showStageForm ? (
        <EmptyState icon={GitBranch} title="No workflow stages" description="Add stages to build your research pipeline." action={() => setShowStageForm(true)} actionLabel="Add first stage" />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 items-start">
          {stages.map(stage => (
            <KanbanColumn key={stage.id} stage={stage} projectId={pid} onDrop={handleDrop} onStatusChange={handleStatusChange} onItemCreated={handleItemCreated} />
          ))}
          {showStageForm && (
            <div className="w-64 shrink-0 bg-slate-50 rounded-2xl p-3 border-2 border-dashed border-orange-200">
              <p className="text-xs font-semibold text-slate-500 mb-2 font-display">NEW STAGE</p>
              <input autoFocus value={addingStageName} onChange={e => setAddingStageName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addStage(); if (e.key === 'Escape') setShowStageForm(false) }}
                placeholder="Stage name..." className="w-full text-sm p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-400" />
              <div className="flex gap-2 mt-2">
                <button onClick={addStage} disabled={creatingStage} className="flex-1 text-sm bg-orange-500 text-white rounded-lg py-1.5 font-medium hover:bg-orange-600 disabled:opacity-50">Create</button>
                <button onClick={() => setShowStageForm(false)} className="text-sm px-3 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">✕</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
