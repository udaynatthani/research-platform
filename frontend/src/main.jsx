import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import { ProjectProvider } from './contexts/ProjectContext'
import { ToastProvider } from './contexts/ToastContext'
import Router from './router'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ProjectProvider>
        <ToastProvider>
          <Router />
        </ToastProvider>
      </ProjectProvider>
    </AuthProvider>
  </StrictMode>
)
