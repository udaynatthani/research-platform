import { useState, useCallback } from 'react'
import { Trash2, Activity, Clock } from 'lucide-react'
import api from '../lib/api'
import useApi from '../hooks/useApi'
import useToast from '../hooks/useToast'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'

const methodColors = { POST: 'emerald', PUT: 'blue', PATCH: 'orange', DELETE: 'rose' }

function Timeline({ items, showUser = false }) {
  if (!items?.length) return <p className="text-slate-400 text-sm py-8 text-center">No activity yet</p>
  return (
    <div className="space-y-1">
      {items.map((a, i) => (
        <div key={i} className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
          <div className="w-2 h-2 rounded-full bg-slate-300 mt-2 shrink-0"/>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge label={a.action?.split(' ')[0] || 'ACTION'} color={methodColors[a.action?.split(' ')[0]] || 'slate'} />
              {a.entityType && <Badge label={a.entityType} color="blue" />}
              {showUser && a.user?.username && <span className="text-xs text-slate-500 font-medium">@{a.user.username}</span>}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">{a.action} — {a.entityId?.slice(0, 12)}...</p>
          </div>
          <span className="text-xs text-slate-400 shrink-0 whitespace-nowrap">{new Date(a.createdAt).toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

export default function ActivityPage() {
  const { pushToast } = useToast()
  const [tab, setTab] = useState(0)
  const [clearing, setClearing] = useState(false)

  const { data: myFeed, loading: myLoading } = useApi(() => api.get('/activity/feed?limit=30').then(r => r.data))
  const { data: globalFeed, loading: globalLoading } = useApi(() => api.get('/activity/global?limit=30').then(r => r.data).catch(() => []))
  const { data: history = [], refetch: refetchHistory } = useApi(() => api.get('/search/history?limit=20').then(r => r.data))

  const clearHistory = useCallback(async () => {
    setClearing(true)
    try {
      await api.delete('/search/history')
      pushToast({ message: 'Search history cleared', type: 'success' })
      refetchHistory()
    } catch { pushToast({ message: 'Failed', type: 'error' }) }
    setClearing(false)
  }, [])

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-slate-900">Activity</h1>
        <p className="text-slate-500 text-sm">Full audit trail of your research platform activity</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {['My Feed', 'Global Feed'].map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`px-5 py-2.5 text-sm font-medium font-display transition-colors border-b-2 -mb-px ${tab === i ? 'border-slate-500 text-slate-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        {tab === 0 ? (
          myLoading ? <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-12 skeleton rounded-lg"/>)}</div> :
          <Timeline items={myFeed} />
        ) : (
          globalLoading ? <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-12 skeleton rounded-lg"/>)}</div> :
          <Timeline items={globalFeed} showUser />
        )}
      </div>

      {/* Search history */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-slate-700 flex items-center gap-2"><Clock size={16} className="text-slate-400"/> Search History</h2>
          {history.length > 0 && (
            <Button size="sm" variant="ghost" loading={clearing} onClick={clearHistory} className="!text-rose-500 hover:!bg-rose-50">
              <Trash2 size={12}/> Clear
            </Button>
          )}
        </div>
        {history.length === 0 ? <p className="text-slate-400 text-sm">No search history</p> : (
          <div className="flex flex-wrap gap-2">
            {history.map((s, i) => (
              <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                <Activity size={10}/> {s.query}
                {s.resultCount != null && <span className="text-slate-400">({s.resultCount})</span>}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
