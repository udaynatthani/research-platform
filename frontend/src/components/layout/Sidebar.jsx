import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, FolderOpen, BookOpen, Library, GitBranch,
  FlaskConical, Network, Lightbulb, BarChart3, Bot, Activity
} from 'lucide-react'
import clsx from 'clsx'

const nav = [
  { to: '/dashboard',   label: 'Dashboard',    Icon: LayoutDashboard, color: 'text-indigo-500',  bg: 'bg-indigo-50' },
  { to: '/projects',    label: 'Projects',     Icon: FolderOpen,      color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { to: '/papers',      label: 'Papers',       Icon: BookOpen,        color: 'text-blue-500',    bg: 'bg-blue-50' },
  { to: '/collections', label: 'Collections',  Icon: Library,         color: 'text-violet-500',  bg: 'bg-violet-50' },
  { to: '/workflow',    label: 'Workflow',      Icon: GitBranch,       color: 'text-orange-500',  bg: 'bg-orange-50' },
  { to: '/experiments', label: 'Experiments',  Icon: FlaskConical,    color: 'text-rose-500',    bg: 'bg-rose-50' },
  { to: '/concept-map', label: 'Concept Map',  Icon: Network,         color: 'text-purple-500',  bg: 'bg-purple-50' },
  { to: '/insights',    label: 'Insights',     Icon: Lightbulb,       color: 'text-purple-500',  bg: 'bg-purple-50' },
  { to: '/visualization', label: 'Visualize',  Icon: BarChart3,       color: 'text-cyan-500',    bg: 'bg-cyan-50' },
  { to: '/ai',          label: 'AI Assistant', Icon: Bot,             color: 'text-green-500',   bg: 'bg-green-50' },
  { to: '/activity',    label: 'Activity',     Icon: Activity,        color: 'text-slate-500',   bg: 'bg-slate-50' },
]

export default function Sidebar() {
  return (
    <aside className="group fixed left-0 top-0 h-full w-16 hover:w-56 bg-white border-r border-slate-100 z-20 flex flex-col overflow-hidden transition-all duration-200 ease-in-out shadow-sm">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-100 shrink-0 overflow-hidden">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
          <span className="text-white font-display font-bold text-sm">R</span>
        </div>
        <span className="font-display font-bold text-slate-800 text-base whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150">ResearchOS</span>
      </div>
      <nav className="flex-1 overflow-y-auto py-3 flex flex-col gap-0.5 px-2">
        {nav.map(({ to, label, Icon, color, bg }) => (
          <NavLink key={to} to={to} className={({ isActive }) => clsx(
            'flex items-center gap-3 rounded-xl px-2 py-2.5 transition-all duration-150 overflow-hidden group/item',
            isActive ? `${bg} ${color}` : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
          )}>
            {({ isActive }) => (
              <>
                <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors', isActive ? bg : 'group-hover/item:bg-slate-100')}>
                  <Icon size={17} />
                </div>
                <span className="text-sm font-medium font-display whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
