import { useEffect, useState } from 'react'
import { BookOpen, FlaskConical, Lightbulb, GitBranch, Clock, Search } from 'lucide-react'
import api from '../lib/api'
import useProject from '../hooks/useProject'
import useToast from '../hooks/useToast'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'

const statCards = [
  { label: 'Papers', icon: BookOpen, color: 'blue',   endpoint: '/papers' },
  { label: 'Experiments', icon: FlaskConical, color: 'rose', endpoint: null },
  { label: 'Insights', icon: Lightbulb, color: 'purple', endpoint: null },
  { label: 'Workflow Items', icon: GitBranch, color: 'orange', endpoint: null },
]

const actionColors = { POST: 'emerald', PUT: 'blue', PATCH: 'orange', DELETE: 'rose' }

export default function DashboardPage() {
  const { activeProject } = useProject()
  const { pushToast } = useToast()
  const [stats, setStats] = useState({ papers: 0, experiments: 0, insights: 0, items: 0 })
  const [activity, setActivity] = useState([])
  const [searches, setSearches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const pid = activeProject?.id
    async function load() {
      setLoading(true)
      try {
        const [papersRes, activityRes, searchRes] = await Promise.allSettled([
          api.get('/papers'),
          api.get('/activity/feed?limit=10'),
          api.get('/search/history?limit=5'),
        ])
        if (papersRes.status === 'fulfilled') setStats(s => ({ ...s, papers: papersRes.value.data?.length || 0 }))
        if (pid) {
          const [expRes, insRes] = await Promise.allSettled([
            api.get(`/experiments/${pid}`),
            api.get(`/insights/project/${pid}`),
          ])
          if (expRes.status === 'fulfilled') setStats(s => ({ ...s, experiments: expRes.value.data?.length || 0 }))
          if (insRes.status === 'fulfilled') setStats(s => ({ ...s, insights: insRes.value.data?.length || 0 }))
        }
        if (activityRes.status === 'fulfilled') setActivity(activityRes.value.data || [])
        if (searchRes.status === 'fulfilled') setSearches(searchRes.value.data || [])
      } catch {}
      setLoading(false)
    }
    load()
  }, [activeProject?.id])

  const statValues = [stats.papers, stats.experiments, stats.insights, stats.items]

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Welcome back — here's what's happening in your research workspace.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, icon: Icon, color }, i) => (
          <Card key={label} accentColor={color} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 font-display uppercase tracking-wide">{label}</p>
                {loading ? <div className="h-8 w-12 skeleton rounded mt-2" /> : (
                  <p className="text-3xl font-display font-bold text-slate-800 mt-1">{statValues[i]}</p>
                )}
              </div>
              <div className={`w-11 h-11 rounded-xl bg-${color}-100 flex items-center justify-center text-${color}-500`}>
                <Icon size={22} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity feed */}
        <div className="lg:col-span-2">
          <Card className="p-5">
            <h2 className="font-display font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Clock size={16} className="text-slate-400" /> Recent Activity
            </h2>
            {loading ? (
              <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-10 skeleton rounded-lg" />)}</div>
            ) : activity.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No activity yet</p>
            ) : (
              <div className="space-y-2">
                {activity.map((a, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
                    <Badge label={a.action?.split(' ')[0] || 'ACT'} color={actionColors[a.action?.split(' ')[0]] || 'slate'} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 truncate">{a.entityType} — <span className="text-slate-400 font-mono text-xs">{a.entityId?.slice(0,8)}</span></p>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">{new Date(a.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Search history */}
        <div>
          <Card className="p-5">
            <h2 className="font-display font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Search size={16} className="text-slate-400" /> Recent Searches
            </h2>
            {searches.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No searches yet</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {searches.map((s, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">{s.query}</span>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
