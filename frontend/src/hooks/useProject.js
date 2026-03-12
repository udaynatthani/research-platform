import { useContext } from 'react'
import { ProjectContext } from '../contexts/ProjectContext'
export default function useProject() { return useContext(ProjectContext) }
