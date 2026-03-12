import { createContext, useState, useCallback } from 'react'
import api from '../lib/api'

export const ProjectContext = createContext(null)

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([])
  const [activeProject, setActiveProjectState] = useState(null)

  const loadProjects = useCallback(async () => {
    try {
      const { data } = await api.get('/projects')
      setProjects(data)
      if (data.length > 0 && !activeProject) setActiveProjectState(data[0])
      return data
    } catch { return [] }
  }, [activeProject])

  const setActiveProject = useCallback((p) => setActiveProjectState(p), [])

  return (
    <ProjectContext.Provider value={{ projects, activeProject, setActiveProject, loadProjects, setProjects }}>
      {children}
    </ProjectContext.Provider>
  )
}
