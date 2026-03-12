import { createContext, useState, useCallback } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

export const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const pushToast = useCallback(({ message, type = 'info' }) => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts(p => [...p, { id, message, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4200)
  }, [])

  const remove = useCallback((id) => setToasts(p => p.filter(t => t.id !== id)), [])

  const icons = { success: CheckCircle, error: XCircle, info: Info }
  const colors = {
    success: 'bg-white border-l-4 border-emerald-500 text-emerald-700',
    error:   'bg-white border-l-4 border-rose-500 text-rose-700',
    info:    'bg-white border-l-4 border-blue-500 text-blue-700',
  }

  return (
    <ToastContext.Provider value={{ pushToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 min-w-72">
        {toasts.map(t => {
          const Icon = icons[t.type] || Info
          return (
            <div key={t.id} className={`toast-anim flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg text-sm ${colors[t.type] || colors.info}`}>
              <Icon size={16} className="mt-0.5 shrink-0" />
              <span className="flex-1 font-medium">{t.message}</span>
              <button onClick={() => remove(t.id)} className="opacity-50 hover:opacity-100 transition-opacity"><X size={14} /></button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
