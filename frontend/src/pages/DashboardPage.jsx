import { useEffect, useState } from 'react'
import { BookOpen, FlaskConical, Lightbulb, GitBranch, Clock, Search, ArrowUpRight, Target, Activity, Zap, TrendingUp } from 'lucide-react'
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
  const [latestExp, setLatestExp] = useState(null)
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
          if (expRes.status === 'fulfilled') {
            const exps = expRes.value.data || []
            setStats(s => ({ ...s, experiments: exps.length }))
            if (exps.length > 0) {
              // Find latest iteration with a result
              const latest = exps[0] // Already sorted by desc createdAt in backend
              const iterationsWithResults = (latest.iterations || [])
                .filter(i => i.results?.length > 0)
                .sort((a, b) => b.iterationNumber - a.iterationNumber)
              
              if (iterationsWithResults.length > 0) {
                setLatestExp({
                  ...latest,
                  latestIter: iterationsWithResults[0],
                  latestResult: iterationsWithResults[0].results[0]
                })
              } else {
                setLatestExp(latest)
              }
            }
          }
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Welcome back — here's what's happening in your research workspace.</p>
        </div>
        <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-full px-4 py-1.5 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{activeProject?.title || 'No Project Selected'}</span>
        </div>
      </div>

      {/* Hero Section */}
      {latestExp && (
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-white shadow-2xl">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-3 py-1 text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                <Zap size={10} /> Latest Research Outcome
              </div>
              <h2 className="font-display font-bold text-3xl leading-tight">
                {latestExp.title}
              </h2>
              <p className="text-slate-400 text-sm max-w-md leading-relaxed">
                {latestExp.latestResult?.resultSummary || latestExp.objective || 'No outcome summary recorded for the latest iteration yet.'}
              </p>
              <div className="flex items-center gap-4 pt-2">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Iteration</span>
                  <span className="text-lg font-display font-bold text-white">#{latestExp.latestIter?.iterationNumber || '1'}</span>
                </div>
                <div className="h-8 w-px bg-white/10 mx-2" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Status</span>
                  <Badge label={latestExp.status} color="rose" className="mt-1" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Target size={18} />
                  </div>
                  <ArrowUpRight size={14} className="text-slate-500 group-hover:text-white transition-colors" />
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Accuracy</p>
                <p className="text-2xl font-display font-bold text-white mt-1">
                  {latestExp.latestResult?.metrics?.Accuracy ? `${latestExp.latestResult.metrics.Accuracy}%` : '—'}
                </p>
                <div className="mt-3 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: latestExp.latestResult?.metrics?.Accuracy ? `${latestExp.latestResult.metrics.Accuracy}%` : '0%' }} />
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400">
                    <Activity size={18} />
                  </div>
                  <TrendingUp size={14} className="text-slate-500 group-hover:text-white transition-colors" />
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Loss Value</p>
                <p className="text-2xl font-display font-bold text-white mt-1">
                  {latestExp.latestResult?.metrics?.Loss || '—'}
                </p>
                <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                  Converging... <span className="text-emerald-400 italic">Excellent</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
