import { useState, useCallback, memo } from 'react'
import { Plus, ChevronDown, ChevronRight, Trash2, FlaskConical } from 'lucide-react'
import { useForm } from 'react-hook-form'
import api from '../lib/api'
import useApi from '../hooks/useApi'
import useProject from '../hooks/useProject'
import useToast from '../hooks/useToast'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'

const statusColors = { TODO: 'slate', IN_PROGRESS: 'orange', DONE: 'emerald' }

const IterationRow = memo(function IterationRow({ iter }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="ml-4 border-l-2 border-slate-100 pl-4">
      <button onClick={() => setOpen(s=>!s)} className="flex items-center gap-2 py-2 text-sm text-slate-700 w-full text-left hover:text-slate-900">
        {open ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
        <span className="font-medium">Iteration #{iter.iterationNumber}</span>
        <span className="text-slate-500 text-xs">{iter.description}</span>
      </button>
      {open && iter.results?.map(r => (
        <div key={r.id} className="ml-4 pb-3">
          <p className="text-xs text-slate-600 mb-1.5">{r.resultSummary}</p>
          {r.metrics && (
            <table className="text-xs w-full border border-slate-100 rounded-lg overflow-hidden">
              <tbody>
                {Object.entries(r.metrics).map(([k, v]) => (
                  <tr key={k} className="border-b border-slate-50 last:border-0">
                    <td className="px-3 py-1.5 font-semibold text-slate-500 bg-slate-50 w-1/3">{k}</td>
                    <td className="px-3 py-1.5 text-slate-800 font-mono">{String(v)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  )
})

export default function ExperimentsPage() {
  const { activeProject } = useProject()
  const { pushToast } = useToast()
  const pid = activeProject?.id
  const { data: experiments = [], loading, refetch } = useApi(
    () => pid ? api.get(`/experiments/${pid}`).then(r => r.data) : Promise.resolve([]),
    [pid]
  )
  const [openExps, setOpenExps] = useState({})
  const [modal, setModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [iterModal, setIterModal] = useState(null)
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()
  const { register: ri, handleSubmit: hi, reset: resetIter } = useForm()

  const toggleExp = useCallback((id) => setOpenExps(s => ({ ...s, [id]: !s[id] })), [])

  const onCreate = async (d) => {
    try {
      await api.post('/experiments', { ...d, projectId: pid })
      pushToast({ message: 'Experiment created!', type: 'success' })
      reset(); setModal(false); refetch()
    } catch { pushToast({ message: 'Failed', type: 'error' }) }
  }

  const doDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/experiments/${deleteTarget}`)
      setDeleteTarget(null); refetch()
    } catch { pushToast({ message: 'Failed to delete', type: 'error' }) }
    setDeleting(false)
  }

  const addIteration = async (d) => {
    try {
      await api.post('/experiments/iteration', { ...d, experimentId: iterModal, iterationNumber: 1 })
      pushToast({ message: 'Iteration logged!', type: 'success' })
      resetIter(); setIterModal(null); refetch()
    } catch { pushToast({ message: 'Failed', type: 'error' }) }
  }

  if (!pid) return <div className="text-slate-400 text-sm">Select a project to view experiments.</div>

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900">Experiments</h1>
          <p className="text-slate-500 text-sm">Track your experimental runs and results</p>
        </div>
        <Button variant="danger" className="!bg-rose-600" onClick={() => setModal(true)}><Plus size={16}/> New Experiment</Button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 skeleton rounded-2xl" />)}</div>
      ) : !experiments.length ? (
        <EmptyState icon={FlaskConical} title="No experiments" description="Document your research experiments here." action={() => setModal(true)} actionLabel="Create experiment" />
      ) : (
        <div className="space-y-3">
          {experiments.map(exp => (
            <Card key={exp.id} accentColor="rose" className="overflow-hidden">
              <button onClick={() => toggleExp(exp.id)} className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 transition-colors">
                {openExps[exp.id] ? <ChevronDown size={16} className="text-slate-400 shrink-0"/> : <ChevronRight size={16} className="text-slate-400 shrink-0"/>}
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-slate-800">{exp.title}</p>
                  {exp.objective && <p className="text-xs text-slate-500 truncate mt-0.5">{exp.objective}</p>}
                </div>
                <Badge label={exp.status || 'TODO'} color={statusColors[exp.status] || 'slate'} />
                <div className="flex gap-2 ml-2" onClick={e => e.stopPropagation()}>
                  <Button size="sm" variant="ghost" onClick={() => setIterModal(exp.id)}><Plus size={12}/> Iter</Button>
                  <Button size="sm" variant="ghost" className="!text-rose-500 hover:!bg-rose-50" onClick={() => setDeleteTarget(exp.id)}><Trash2 size={12}/></Button>
                </div>
              </button>
              {openExps[exp.id] && (
                <div className="px-4 pb-4 border-t border-slate-50">
                  {exp.methodology && <p className="text-xs text-slate-600 mt-3 mb-2"><span className="font-semibold">Methodology:</span> {exp.methodology}</p>}
                  {exp.iterations?.length === 0 && <p className="text-xs text-slate-400 py-2">No iterations yet</p>}
                  {(exp.iterations || []).map(iter => <IterationRow key={iter.id} iter={iter} />)}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={modal} onClose={() => { setModal(false); reset() }} title="New Experiment">
        <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
          <Input label="Title *" {...register('title', { required: true })} />
          <Input label="Objective" as="textarea" rows={2} {...register('objective')} />
          <Input label="Methodology" as="textarea" rows={2} {...register('methodology')} />
          <Input label="Status" as="select" {...register('status')}>
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="DONE">DONE</option>
          </Input>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => { setModal(false); reset() }}>Cancel</Button>
            <Button type="submit" variant="danger" loading={isSubmitting}>Create</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!iterModal} onClose={() => { setIterModal(null); resetIter() }} title="Log Iteration">
        <form onSubmit={hi(addIteration)} className="space-y-4">
          <Input label="Iteration #" type="number" {...ri('iterationNumber', { required: true, valueAsNumber: true })} />
          <Input label="Description" as="textarea" rows={2} {...ri('description')} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => { setIterModal(null); resetIter() }}>Cancel</Button>
            <Button type="submit" variant="danger">Add iteration</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={doDelete} loading={deleting} message="Delete this experiment and all its iterations?" />
    </div>
  )
}
