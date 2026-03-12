import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import useProject from '../../hooks/useProject'

export default function AppShell() {
  const { loadProjects } = useProject()
  useEffect(() => { loadProjects() }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <Topbar />
      <main className="ml-16 pt-14 min-h-screen">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
