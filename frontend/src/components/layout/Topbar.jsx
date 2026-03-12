import { useState, useEffect, useRef } from 'react'
import { Search, ChevronDown, LogOut, User } from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import useProject from '../../hooks/useProject'
import Badge from '../ui/Badge'

export default function Topbar() {
  const { user, logout } = useAuth()
  const { projects, activeProject, setActiveProject } = useProject()
  const [showUser, setShowUser] = useState(false)
  const [showProject, setShowProject] = useState(false)
  const userRef = useRef(null)
  const projectRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setShowUser(false)
      if (projectRef.current && !projectRef.current.contains(e.target)) setShowProject(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="fixed top-0 left-16 right-0 h-14 bg-white border-b border-slate-100 z-10 flex items-center px-6 gap-4">
      {/* Project switcher */}
      <div ref={projectRef} className="relative">
        <button
          onClick={() => setShowProject(s => !s)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors text-sm"
        >
          <div className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">{(activeProject?.title || 'P')[0]}</span>
          </div>
          <span className="font-medium text-slate-700 max-w-40 truncate">{activeProject?.title || 'Select project'}</span>
          <Badge label={activeProject?.visibility || 'NONE'} color={activeProject?.visibility === 'PUBLIC' ? 'emerald' : 'slate'} />
          <ChevronDown size={14} className="text-slate-400" />
        </button>
        {showProject && (
          <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-slate-100 py-1 min-w-52 z-50">
            {projects.map(p => (
              <button
                key={p.id}
                onClick={() => { setActiveProject(p); setShowProject(false) }}
                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm flex items-center gap-2"
              >
                <div className="w-4 h-4 rounded bg-emerald-400 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{p.title[0]}</span>
                </div>
                <span className="truncate">{p.title}</span>
              </button>
            ))}
            {projects.length === 0 && <p className="px-4 py-2 text-xs text-slate-400">No projects yet</p>}
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* User menu */}
      <div ref={userRef} className="relative">
        <button onClick={() => setShowUser(s => !s)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
          <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">{(user?.username || 'U')[0].toUpperCase()}</span>
          </div>
          <span className="text-sm font-medium text-slate-700">{user?.username}</span>
          <ChevronDown size={13} className="text-slate-400" />
        </button>
        {showUser && (
          <div className="absolute top-full right-0 mt-1 bg-white rounded-xl shadow-lg border border-slate-100 py-1 min-w-44 z-50">
            <div className="px-4 py-2 border-b border-slate-100">
              <p className="text-xs font-semibold text-slate-500">{user?.email}</p>
              <Badge label={user?.role || 'USER'} color="indigo" className="mt-1" />
            </div>
            <button onClick={logout} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm flex items-center gap-2 text-rose-600">
              <LogOut size={14} /> Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
