import { useState, useCallback } from 'react'
import { Plus, Lightbulb, ArrowRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import api from '../lib/api'
import useApi from '../hooks/useApi'
import useProject from '../hooks/useProject'
import useToast from '../hooks/useToast'
import InsightCard from '../components/insights/InsightCard'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import EmptyState from '../components/ui/EmptyState'

export default function InsightsPage() {
  const { activeProject } = useProject()
  const { pushToast } = useToast()
  const pid = activeProject?.id

  const { data: insights = [], loading, refetch } = useApi(
    () => pid ? api.get(`/insights/project/${pid}`).then(r => r.data) : Promise.resolve([]),
    [pid]
  )
  const { data: papers = [] } = useApi(() => api.get('/papers').then(r => r.data))

  const [selected, setSelected] = useState(null)
  const [modal, setModal] = useState(false)
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({ defaultValues: { confidenceScore: 0.8 } })

  const onSelect = useCallback((ins) => setSelected(ins), [])

  const onCreate = async (d) => {
    try {
      await api.post('/insights', { ...d, projectId: pid, confidenceScore: parseFloat(d.confidenceScore) })
      pushToast({ message: 'Insight recorded!', type: 'success' })
      reset(); setModal(false); refetch()
    } catch { pushToast({ message: 'Failed', type: 'error' }) }
  }

  if (!pid) return <div className="text-slate-400 text-sm">Select a project to view insights.</div>

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900">Insights</h1>
          <p className="text-slate-500 text-sm">Record and trace research conclusions</p>
        </div>
        <Button className="!bg-purple-600 !text-white hover:!bg-purple-700" onClick={() => setModal(true)}><Plus size={16}/> New Insight</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left — insights list */}
        <div className="space-y-3">
          <h2 className="font-display font-semibold text-slate-700 text-sm uppercase tracking-wide">All Insights ({insights.length})</h2>
          {loading ? [...Array(3)].map((_, i) => <div key={i} className="h-28 skeleton rounded-xl" />) :
          insights.length === 0 ? <EmptyState icon={Lightbulb} title="No insights" description="Record research conclusions here." action={() => setModal(true)} actionLabel="Create insight" /> :
          insights.map(ins => <InsightCard key={ins.id} insight={ins} onSelect={onSelect} isSelected={selected?.id === ins.id} />)
          }
        </div>

        {/* Right — lineage view */}
        <div>
          {selected ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
              <h2 className="font-display font-semibold text-slate-700">Insight Lineage</h2>
              <div className="flex items-center gap-3 flex-wrap">
                {selected.paper && (
                  <div className="flex-1 min-w-0 p-3 rounded-xl bg-blue-50 border border-blue-100">
                    <p className="text-xs font-semibold text-blue-600 mb-1">SOURCE PAPER</p>
                    <p className="text-sm text-slate-800 line-clamp-2">{selected.paper.title}</p>
                  </div>
                )}
                {selected.experiment && (
                  <div className="flex-1 min-w-0 p-3 rounded-xl bg-rose-50 border border-rose-100">
                    <p className="text-xs font-semibold text-rose-600 mb-1">SOURCE EXPERIMENT</p>
                    <p className="text-sm text-slate-800">{selected.experiment.title}</p>
                  </div>
                )}
                {(selected.paper || selected.experiment) && <ArrowRight size={20} className="text-slate-300 shrink-0" />}
                <div className="flex-1 min-w-0 p-3 rounded-xl bg-purple-50 border border-purple-100">
                  <p className="text-xs font-semibold text-purple-600 mb-1">INSIGHT</p>
                  <p className="text-sm text-slate-800">{selected.content}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Badge label={selected.createdBy || 'USER'} color={selected.createdBy === 'AI' ? 'green' : 'violet'} />
                <span className="text-xs text-slate-500">Confidence: {((selected.confidenceScore || 0) * 100).toFixed(0)}%</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-300 border-2 border-dashed border-slate-200 rounded-2xl">
              <p className="text-sm">Select an insight to trace its lineage</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={modal} onClose={() => { setModal(false); reset() }} title="New Insight">
        <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
          <Input label="Content *" as="textarea" rows={3} {...register('content', { required: true })} />
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 font-display">Confidence Score</label>
            <input type="range" min="0" max="1" step="0.01" className="w-full accent-purple-600" {...register('confidenceScore')} />
          </div>
          <Input label="Source Paper" as="select" {...register('paperId')}>
            <option value="">None</option>
            {papers.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </Input>
          <Input label="Created By" as="select" {...register('createdBy')}>
            <option value="USER">USER</option>
            <option value="AI">AI</option>
          </Input>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => { setModal(false); reset() }}>Cancel</Button>
            <Button type="submit" className="!bg-purple-600 !text-white hover:!bg-purple-700" loading={isSubmitting}>Record insight</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
