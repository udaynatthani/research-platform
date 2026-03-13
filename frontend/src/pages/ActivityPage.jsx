import { useState, useCallback } from 'react'
import { Trash2, Activity, Clock, Search, BookOpen, FlaskConical, Sparkles, Shield, Star, RefreshCw, User, Zap } from 'lucide-react'
import api from '../lib/api'
import useApi from '../hooks/useApi'
import useToast from '../hooks/useToast'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'

const activityConfig = {
  PAPERS: { icon: BookOpen, color: 'blue' },
  EXPERIMENTS: { icon: FlaskConical, color: 'rose' },
  AI: { icon: Sparkles, color: 'emerald' },
  AUTH: { icon: Shield, color: 'indigo' },
  SEARCH: { icon: Search, color: 'amber' },
  DEFAULT: { icon: Activity, color: 'slate' }
}

const getActionDetails = (action = '') => {
  const method = action.split(' ')[0]
  const colors = { POST: 'emerald', PUT: 'blue', PATCH: 'orange', DELETE: 'rose', GET: 'slate' }
  return { method, color: colors[method] || 'slate' }
}

function TimelineItem({ item, showUser = false }) {
  const type = item.entityType?.toUpperCase() || 'DEFAULT'
  const config = activityConfig[type] || activityConfig.DEFAULT
  const Icon = config.icon
  const { method, color } = getActionDetails(item.action)
  
  return (
    <div className="relative pl-8 pb-8 last:pb-0 group">
      {/* Timeline line */}
      <div className="absolute left-[15px] top-6 bottom-0 w-px bg-slate-100 group-last:hidden" />
      
      {/* Icon dot */}
      <div className={`absolute left-0 top-1 w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center bg-${config.color}-50 text-${config.color}-600 z-10 transition-transform group-hover:scale-110`}>
        <Icon size={14} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge label={method} color={color} className="text-[9px] px-1.5 py-0.5" />
            <span className="text-sm font-bold text-slate-900">{item.entityType || 'Action'}</span>
            {showUser && item.user?.username && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full uppercase tracking-widest">
                <User size={10} /> @{item.user.username}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest whitespace-nowrap">
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-all group-hover:border-slate-200">
          <p className="text-sm text-slate-600 leading-relaxed italic">
             {item.action || 'Performed an operation'}
          </p>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-50">
            <span className="text-[10px] font-mono text-slate-400">ID: {item.entityId?.slice(0, 12)}...</span>
            <div className={`ml-auto px-2 py-0.5 rounded-md bg-${config.color}-50 text-${config.color}-600 text-[10px] font-black uppercase tracking-widest`}>
               {type}
            </div>
          </div>
        </div>
      </div>
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
  }, [pushToast, refetchHistory])

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display font-black text-3xl text-slate-900 tracking-tight">Activity Archive</h1>
          <p className="text-slate-500 text-sm mt-1">Audit logs and research milestones across your platform.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {['Personal', 'Global'].map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${tab === i ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        <div className="lg:col-span-2">
          {tab === 0 ? (
            myLoading ? <div className="space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-24 skeleton rounded-2xl"/>)}</div> :
            <div className="relative">
              {!myFeed?.length ? (
                <div className="text-center py-20 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                  <Activity size={40} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-400 font-medium">No activity recorded yet.</p>
                </div>
              ) : myFeed.map((item, i) => <TimelineItem key={i} item={item} />)}
            </div>
          ) : (
            globalLoading ? <div className="space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-24 skeleton rounded-2xl"/>)}</div> :
            <div className="relative">
               {!globalFeed?.length ? (
                <div className="text-center py-20 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                   <Activity size={40} className="mx-auto text-slate-200 mb-4" />
                   <p className="text-slate-400 font-medium">No global activity found.</p>
                </div>
              ) : globalFeed.map((item, i) => <TimelineItem key={i} item={item} showUser />)}
            </div>
          )}
        </div>

        <div className="space-y-8 sticky top-24">
          <Card className="p-6 border-slate-100 shadow-xl shadow-slate-200/50 !rounded-[2rem]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-slate-800 flex items-center gap-2">
                <Clock size={16} className="text-amber-500"/> Search Log
              </h2>
              {history.length > 0 && (
                <button onClick={clearHistory} disabled={clearing} className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline disabled:opacity-50">
                  {clearing ? '...' : 'Clear All'}
                </button>
              )}
            </div>
            {history.length === 0 ? (
              <p className="text-slate-400 text-xs py-4 text-center italic">No recent searches</p>
            ) : (
              <div className="space-y-2">
                {history.map((s, i) => (
                  <div key={i} className="group flex items-center gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 transition-all cursor-default">
                    <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-slate-400 group-hover:text-amber-500 transition-colors shadow-sm">
                      <Search size={12}/>
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="text-xs font-bold text-slate-700 truncate">{s.query}</p>
                       <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{s.resultCount || 0} results</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6 bg-slate-900 text-white !rounded-[2rem]">
             <Zap size={24} className="text-blue-400 mb-4" />
             <h3 className="font-display font-bold text-lg mb-2">Platform Status</h3>
             <p className="text-slate-400 text-xs leading-relaxed mb-4">
                The audit engine is recording all research transactions across 4 specific domains in real-time.
             </p>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">System Live</span>
             </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
