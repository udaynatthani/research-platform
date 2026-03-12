import { useState } from 'react'
import { BarChart3 } from 'lucide-react'
import api from '../lib/api'
import useApi from '../hooks/useApi'
import useProject from '../hooks/useProject'
import ConceptGraph from '../components/concepts/ConceptGraph'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'

const tabs = ['Concept Graph', 'Workflow Timeline', 'Insight Network']

export default function VisualizationPage() {
  const { activeProject } = useProject()
  const pid = activeProject?.id
  const [tab, setTab] = useState(0)

  const { data: cgData, loading: cgLoading } = useApi(
    () => pid ? api.get(`/visualization/concept-graph/${pid}`).then(r => r.data) : Promise.resolve(null), [pid, tab === 0])
  const { data: wtData, loading: wtLoading } = useApi(
    () => pid && tab === 1 ? api.get(`/visualization/workflow-timeline/${pid}`).then(r => r.data) : Promise.resolve(null), [pid, tab])
  const { data: inData, loading: inLoading } = useApi(
    () => pid && tab === 2 ? api.get(`/visualization/insight-network/${pid}`).then(r => r.data) : Promise.resolve(null), [pid, tab])

  if (!pid) return <div className="text-slate-400 text-sm">Select a project to view visualizations.</div>

  return (
    <div className="space-y-5 max-w-6xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-slate-900">Visualizations</h1>
        <p className="text-slate-500 text-sm">Explore your research data visually</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`px-5 py-2.5 text-sm font-medium font-display transition-colors border-b-2 -mb-px ${tab === i ? 'border-cyan-500 text-cyan-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab 1 — Concept Graph */}
      {tab === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 h-[calc(100vh-300px)] relative overflow-hidden">
          {cgLoading ? <div className="flex items-center justify-center h-full"><Spinner size={32} className="text-cyan-500" /></div> :
          <ConceptGraph nodes={cgData?.nodes || []} links={cgData?.links || []} readOnly />}
        </div>
      )}

      {/* Tab 2 — Workflow Timeline */}
      {tab === 1 && (
        <div className="space-y-4">
          {wtLoading ? <Spinner /> :
          !wtData?.length ? <p className="text-slate-400 text-sm">No workflow stages</p> :
          <div className="flex gap-4 overflow-x-auto pb-4">
            {wtData.map((stage, i) => (
              <div key={stage.id} className="min-w-56 bg-white rounded-2xl border border-slate-100 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center text-xs font-bold font-display">{i+1}</div>
                  <p className="font-display font-semibold text-sm text-slate-800">{stage.name}</p>
                </div>
                <div className="space-y-2">
                  {(stage.items || []).map(item => (
                    <div key={item.id} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <p className="text-xs text-slate-700">{item.title || item.name}</p>
                      <Badge label={item.status} color={item.status === 'DONE' ? 'emerald' : item.status === 'IN_PROGRESS' ? 'orange' : 'slate'} className="mt-1" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>}
        </div>
      )}

      {/* Tab 3 — Insight Network */}
      {tab === 2 && (
        <div className="space-y-3">
          {inLoading ? <Spinner /> :
          !inData?.length ? <p className="text-slate-400 text-sm">No insights</p> :
          Object.entries(inData.reduce((acc, ins) => {
            const key = ins.paper?.title || 'No source'
            if (!acc[key]) acc[key] = []
            acc[key].push(ins)
            return acc
          }, {})).map(([paperTitle, paperInsights]) => (
            <div key={paperTitle} className="bg-white rounded-2xl border border-slate-100 p-4">
              <p className="font-display font-semibold text-sm text-blue-700 mb-3 flex items-center gap-2">
                <BarChart3 size={14}/>{paperTitle}
              </p>
              <div className="space-y-2 ml-4">
                {paperInsights.map(ins => (
                  <div key={ins.id} className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                    <p className="text-sm text-slate-700">{ins.content}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge label={ins.createdBy || 'USER'} color={ins.createdBy === 'AI' ? 'green' : 'violet'} />
                      <span className="text-xs text-slate-400">{((ins.confidenceScore||0)*100).toFixed(0)}% confidence</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
