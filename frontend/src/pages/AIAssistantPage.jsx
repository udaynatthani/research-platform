import { useState, useRef, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Send, RefreshCw, Bot, User, Sparkles, BookOpen, Shield, Star } from 'lucide-react'
import api from '../lib/api'
import useApi from '../hooks/useApi'
import useProject from '../hooks/useProject'
import useToast from '../hooks/useToast'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Spinner from '../components/ui/Spinner'
import Badge from '../components/ui/Badge'
import AIResultDisplay from '../components/ai/AIResultDisplay'

const actions = [
  { key: 'summarize',    label: 'Summarize',         icon: BookOpen,  color: 'green',  endpoint: (id) => ({ method: 'post', url: `/ai/summarize/${id}`, body: {} }) },
  { key: 'insights',     label: 'Extract Insights',  icon: Sparkles,  color: 'purple', endpoint: (id, pid) => ({ method: 'post', url: `/ai/insights/${id}`, body: { projectId: pid } }) },
  { key: 'recommend',    label: 'Recommendations',   icon: Star,      color: 'blue',   endpoint: (id) => ({ method: 'get',  url: `/ai/recommendations/${id}` }) },
  { key: 'plagiarism',   label: 'Plagiarism Check',  icon: Shield,    color: 'orange', endpoint: (id) => ({ method: 'post', url: `/ai/plagiarism-check`, body: { paperId: id } }) },
  { key: 'index',        label: 'Index Paper',       icon: RefreshCw, color: 'indigo', endpoint: (id) => ({ method: 'post', url: `/ai/index`, body: { paperId: id } }) },
]

export default function AIAssistantPage() {
  const { activeProject } = useProject()
  const { pushToast } = useToast()
  const location = useLocation()
  const navigate = useNavigate()
  const { data: papers = [] } = useApi(() => api.get('/papers').then(r => r.data))
  const [selectedPaper, setSelectedPaper] = useState('')
  const [result, setResult] = useState(null)
  const [activeAction, setActiveAction] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Automation logic
  useEffect(() => {
    if (location.state?.paperId && location.state?.autoAction && papers.length > 0) {
      const { paperId, autoAction } = location.state
      setSelectedPaper(paperId)
      
      const action = actions.find(a => a.key === autoAction)
      if (action) {
        // We wait for the next tick to ensure selectedPaper state is updated for runAction
        // Or better, we pass the paperId directly if runAction supported it, 
        // but since runAction depends on selectedPaper, we'll execute it manually once.
        runAction(action, paperId)
      }
      
      // Clear state so it doesn't re-run
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, papers.length])

  // Chat state
  const [messages, setMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [sessionId, setSessionId] = useState(null)
  const [chatLoading, setChatLoading] = useState(false)
  const [tab, setTab] = useState('actions')
  const chatEndRef = useRef(null)

  // New: Effect to load chat history when paper selection changes
  useEffect(() => {
    if (selectedPaper) {
      setMessages([]);
      setSessionId(null);
      api.get(`/ai/history/${selectedPaper}`)
        .then(res => {
          if (res.data.sessionId) {
            setSessionId(res.data.sessionId);
            setMessages(res.data.messages || []);
          }
        })
        .catch(() => {});
    } else {
      setMessages([]);
      setSessionId(null);
    }
  }, [selectedPaper]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const runAction = useCallback(async (action, paperIdOverride) => {
    const id = paperIdOverride || selectedPaper
    if (!id) { pushToast({ message: 'Select a paper first', type: 'info' }); return }
    setTab('actions'); setActionLoading(true); setActiveAction(action.key); setResult(null)
    try {
      const { method, url, body } = action.endpoint(id, activeProject?.id)
      const res = method === 'get' ? await api.get(url) : await api.post(url, body)
      setResult(res.data)
      pushToast({ message: `${action.label} complete!`, type: 'success' })
    } catch (e) {
      const msg = e.code === 'ECONNABORTED' 
        ? 'AI task is taking longer than expected. Please try again or wait a moment.'
        : e.response?.data?.error || 'AI service unavailable. Please ensure the Python microservice is running.';
      pushToast({ message: typeof msg === 'string' ? msg : JSON.stringify(msg), type: 'error' })
    }

    setActionLoading(false)
  }, [selectedPaper, activeProject?.id, pushToast])

  const sendChat = useCallback(async () => {
    if (!chatInput.trim()) return
    const question = chatInput.trim()
    setChatInput('')
    setMessages(m => [...m, { role: 'user', content: question }])
    setChatLoading(true)
    try {
      const { data } = await api.post('/ai/chat', { paperId: selectedPaper || undefined, sessionId, question })
      setSessionId(data.sessionId)
      setMessages(m => [...m, { role: 'ai', content: data.answer || data.response || JSON.stringify(data) }])
    } catch (e) {
      setMessages(m => [...m, { role: 'ai', content: 'AI service unavailable. Please ensure the Python microservice is running.' }])
    }
    setChatLoading(false)
  }, [chatInput, selectedPaper, sessionId])

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div>
        <h1 className="font-display font-bold text-2xl text-slate-900">AI Assistant</h1>
        <p className="text-slate-500 text-sm">Intelligent research assistance powered by AI</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left panel */}
        <div className="w-full lg:w-72 shrink-0 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
            <h3 className="font-display font-semibold text-sm text-slate-700">Select Paper</h3>
            <select value={selectedPaper} onChange={e => setSelectedPaper(e.target.value)}
              className="w-full text-sm rounded-lg border border-slate-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white shadow-sm transition-all text-slate-700">
              <option value="">No paper selected</option>
              {papers.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-2">
            <h3 className="font-display font-semibold text-sm text-slate-700 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              {actions.map(action => (
                <button key={action.key} onClick={() => runAction(action)}
                  disabled={actionLoading}
                  className={`flex items-center gap-3 p-3 rounded-xl text-sm font-medium text-left transition-colors border ${activeAction === action.key ? `bg-${action.color}-50 border-${action.color}-200 text-${action.color}-700` : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-green-50 hover:border-green-200'} disabled:opacity-50`}>
                  <div className={`w-7 h-7 rounded-lg bg-${action.color}-100 flex items-center justify-center text-${action.color}-600 shrink-0`}>
                    {actionLoading && activeAction === action.key ? <Spinner size={14} /> : <action.icon size={14} />}
                  </div>
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>


        {/* Right panel */}
        <div className="flex-1 flex flex-col">
          <div className="flex border-b border-slate-200 mb-4">
            {['actions', 'chat'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-2.5 text-sm font-medium font-display capitalize transition-colors border-b-2 -mb-px ${tab === t ? 'border-green-500 text-green-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                {t === 'actions' ? 'Results' : 'Chat'}
              </button>
            ))}
            {tab === 'chat' && sessionId && (
              <button onClick={() => { setMessages([]); setSessionId(null) }}
                className="ml-auto px-3 py-2 text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1">
                <RefreshCw size={12}/> New Chat
              </button>
            )}
          </div>

          {tab === 'actions' ? (
            <div className="flex-1 bg-white rounded-2xl border border-slate-100 p-5">
              {!result ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-300">
                  <Bot size={40} className="mb-2"/>
                  <p className="text-sm font-medium">Select a paper and run an action</p>
                </div>
              ) : (
                <div className="max-w-none">
                  <AIResultDisplay action={activeAction} result={result} />
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden min-h-[500px] lg:h-[calc(100vh-330px)]">
              {!selectedPaper ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                   <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200">
                      <BookOpen size={30} />
                   </div>
                   <div>
                      <h3 className="text-slate-900 font-bold">Paper Context Required</h3>
                      <p className="text-slate-500 text-sm max-w-xs mx-auto mt-1">To ensure high-quality research assistance, please select a paper from the list to begin chatting.</p>
                   </div>
                   <button onClick={() => document.querySelector('select')?.focus()} className="text-xs font-black text-blue-500 uppercase tracking-widest hover:underline">
                      Focus Paper Selection
                   </button>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full text-slate-300">
                        <Bot size={36} className="mb-2"/>
                        <p className="text-sm font-medium">Ask anything about this paper...</p>
                      </div>
                    )}
                    {messages.map((m, i) => (
                      <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-indigo-600' : 'bg-green-100'}`}>
                          {m.role === 'user' ? <User size={14} className="text-white"/> : <Bot size={14} className="text-green-600"/>}
                        </div>
                        <div className={`max-w-lg rounded-2xl px-4 py-3 text-sm ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800 shadow-sm'}`}>
                          {m.content}
                        </div>
                      </div>
                    ))}
                    {chatLoading && <div className="flex gap-3"><div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center"><Bot size={14} className="text-green-600"/></div><div className="bg-slate-100 rounded-2xl px-4 py-3"><Spinner size={14} className="text-slate-400"/></div></div>}
                    <div ref={chatEndRef}/>
                  </div>
                  <div className="p-3 border-t border-slate-100 flex gap-2 bg-slate-50/50">
                    <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChat()}
                      placeholder="Ask about your research..." disabled={chatLoading}
                      className="flex-1 text-sm rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50 shadow-sm transition-all" />
                    <Button variant="emerald" size="md" loading={chatLoading} onClick={sendChat}><Send size={14}/></Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
