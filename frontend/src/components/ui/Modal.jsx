import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
export default function Modal({ isOpen, onClose, title, children, size='md' }) {
  useEffect(() => {
    if (!isOpen) return
    const h = e => { if(e.key==='Escape') onClose() }
    document.addEventListener('keydown',h); document.body.style.overflow='hidden'
    return () => { document.removeEventListener('keydown',h); document.body.style.overflow='' }
  }, [isOpen,onClose])
  if (!isOpen) return null
  const widths = { sm:'max-w-sm', md:'max-w-lg', lg:'max-w-2xl', xl:'max-w-4xl' }
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"/>
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${widths[size]} fade-up`} onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-display font-semibold text-slate-800 text-lg">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"><X size={18}/></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body
  )
}
