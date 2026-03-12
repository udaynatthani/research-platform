import { createContext, useState, useEffect, useCallback } from 'react'
import api from '../lib/api'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const handler = () => {
      localStorage.clear()
      setToken(null)
      setUser(null)
    }
    window.addEventListener('auth:logout', handler)
    return () => window.removeEventListener('auth:logout', handler)
  }, [])

  const login = useCallback(async (email, password) => {
    setIsLoading(true)
    try {
      const { data } = await api.post('/users/login', { email, password })
      localStorage.setItem('token', data.token)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('user', JSON.stringify(data.user))
      setToken(data.token)
      setUser(data.user)
      return data
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      const rt = localStorage.getItem('refreshToken')
      if (rt) await api.post('/users/logout', { refreshToken: rt })
    } catch {}
    localStorage.clear()
    setToken(null)
    setUser(null)
  }, [])

  const register = useCallback(async (email, username, password) => {
    const { data } = await api.post('/users/register', { email, username, password })
    return data
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token && !!user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}
