import { useState, useCallback, memo } from 'react'
import { Plus, ChevronDown, ChevronRight, Trash2, FlaskConical, BarChart2, Activity, Target } from 'lucide-react'
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
import FileUploader from '../components/files/FileUploader'
import FileList from '../components/files/FileList'

const statusColors = { TODO: 'slate', IN_PROGRESS: 'orange', DONE: 'emerald' }

const IterationRow = memo(function IterationRow({ iter, onLogResult }) {
  const [open, setOpen] = useState(false)
  
  const getMetricIcon = (key) => {
    const k = key.toLowerCase();
    if (k.includes('acc')) return <Target size={12} className="text-emerald-500" />;
    if (k.includes('loss') || k.includes('error')) return <Activity size={12} className="text-rose-500" />;
    return <BarChart2 size={12} className="text-blue-500" />;
  }

  return (
    <div className="ml-4 border-l-2 border-slate-100 pl-4 py-1">
      <div className="flex items-center justify-between group">
        <button onClick={() => setOpen(s=>!s)} className="flex items-center gap-2 py-2 text-sm text-slate-700 hover:text-slate-900 transition-colors">
          {open ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
          <span className="font-bold text-slate-900">Iteration #{iter.iterationNumber}</span>
          <span className="text-slate-500 text-xs font-normal border-l border-slate-200 pl-2">{iter.description}</span>
        </button>
        <Button size="xs" variant="ghost" onClick={() => onLogResult(iter.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
          <Plus size={10}/> Log Result
        </Button>
      </div>
      
      {open && (
        <div className="space-y-3 mt-1 ml-4 mb-4">
          {iter.results?.length === 0 && <p className="text-[11px] text-slate-400 italic">No results recorded for this iteration.</p>}
          {iter.results?.map(r => (
            <div key={r.id} className="bg-white rounded-xl border border-slate-100 p-3 shadow-sm hover:border-blue-200 transition-all">
              <p className="text-xs font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Outcome Summary
              </p>
              <p className="text-xs text-slate-600 mb-3 ml-3 leading-relaxed">{r.resultSummary}</p>
              
              {r.metrics && Object.keys(r.metrics).length > 0 && (
                <div className="flex flex-wrap gap-2 ml-3">
                  {Object.entries(r.metrics).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 shadow-inner">
                      {getMetricIcon(k)}
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 leading-none mb-0.5">{k}</span>
                        <span className="text-xs font-mono font-bold text-slate-700 leading-none">{String(v)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
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
  const [resultModal, setResultModal] = useState(null)
  const [fileRefreshKeys, setFileRefreshKeys] = useState({})
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()
  const { register: ri, handleSubmit: hi, reset: resetIter, setValue: setIterValue } = useForm()
  const { register: rr, handleSubmit: hr, reset: resetResult } = useForm()

  const toggleExp = useCallback((id) => setOpenExps(s => ({ ...s, [id]: !s[id] })), [])

  const openAddIteration = (exp) => {
    const nextNum = (exp.iterations?.length || 0) + 1
    setIterValue('iterationNumber', nextNum)
    setIterModal(exp.id)
  }

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
      await api.post('/experiments/iteration', { ...d, experimentId: iterModal })
      pushToast({ message: 'Iteration logged!', type: 'success' })
      resetIter(); setIterModal(null); refetch()
    } catch { pushToast({ message: 'Failed', type: 'error' }) }
  }

  const addResult = async (d) => {
    try {
      // Parse metrics from dynamic inputs or a single JSON field
      // For simplicity here, we'll parse the 'metricsRaw' textarea as JSON
      let metrics = {}
      try {
        if (d.metricsRaw) metrics = JSON.parse(d.metricsRaw)
        if (d.accuracy) metrics.Accuracy = d.accuracy
        if (d.loss) metrics.Loss = d.loss
      } catch (err) {
        return pushToast({ message: 'Invalid JSON in metrics field', type: 'error' })
      }

      await api.post('/experiments/result', { 
        experimentIterationId: resultModal, 
        resultSummary: d.resultSummary,
        metrics 
      })
      pushToast({ message: 'Result recorded!', type: 'success' })
      resetResult(); setResultModal(null); refetch()
    } catch { pushToast({ message: 'Failed', type: 'error' }) }
  }

  if (!pid) return <div className="text-slate-400 text-sm">Select a project to view experiments.</div>

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
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
                  <Button size="sm" variant="ghost" onClick={() => openAddIteration(exp)}><Plus size={12}/> Iter</Button>
                  <Button size="sm" variant="ghost" className="!text-rose-500 hover:!bg-rose-50" onClick={() => setDeleteTarget(exp.id)}><Trash2 size={12}/></Button>
                </div>
              </button>
              {openExps[exp.id] && (
                <div className="px-4 pb-4 border-t border-slate-50">
                  {exp.methodology && <p className="text-xs text-slate-600 mt-3 mb-2"><span className="font-semibold">Methodology:</span> {exp.methodology}</p>}
                  {exp.iterations?.length === 0 && <p className="text-xs text-slate-400 py-4 text-center">No iterations logged yet</p>}
                  {(exp.iterations || []).map(iter => <IterationRow key={iter.id} iter={iter} onLogResult={setResultModal} />)}
                  
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Attached Files</h4>
                    <FileUploader entityType="EXPERIMENT" entityId={exp.id} projectId={pid} compact onUploadComplete={() => setFileRefreshKeys(k => ({ ...k, [exp.id]: (k[exp.id] || 0) + 1 }))} />
                    <div className="mt-2">
                      <FileList entityType="EXPERIMENT" entityId={exp.id} refreshKey={fileRefreshKeys[exp.id] || 0} />
                    </div>
                  </div>
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
          <Input label="Iteration Number" type="number" {...ri('iterationNumber', { required: true, valueAsNumber: true })} />
          <Input label="Description / Focus" as="textarea" rows={2} {...ri('description')} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => { setIterModal(null); resetIter() }}>Cancel</Button>
            <Button type="submit" variant="danger">Log Iteration</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!resultModal} onClose={() => { setResultModal(null); resetResult() }} title="Log Outcome & Metrics">
        <form onSubmit={hr(addResult)} className="space-y-4">
          <Input label="Outcome Summary *" as="textarea" rows={2} {...rr('resultSummary', { required: true })} placeholder="Describe the main takeaway from this run..." />
          <div className="grid grid-cols-2 gap-4">
             <Input label="Accuracy (%)" type="text" {...rr('accuracy')} placeholder="e.g. 94.2" />
             <Input label="Loss" type="text" {...rr('loss')} placeholder="e.g. 0.024" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Custom Metrics (JSON)</label>
            <Input as="textarea" rows={3} {...rr('metricsRaw')} placeholder='{"F1": 0.92, "Runtime": "45ms"}' />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => { setResultModal(null); resetResult() }}>Cancel</Button>
            <Button type="submit" variant="danger">Log Result</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={doDelete} loading={deleting} message="Delete this experiment and all its iterations?" />
    </div>
  )
}
