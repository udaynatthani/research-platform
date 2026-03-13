import { useEffect } from 'react'
import { X } from 'lucide-react'
export default function Drawer({ isOpen, onClose, title, children, width='w-full sm:w-96 lg:w-[480px]' }) {
  useEffect(() => {
    if (!isOpen) return
    const h = e => { if(e.key==='Escape') onClose() }
    document.addEventListener('keydown',h)
    return () => document.removeEventListener('keydown',h)
  }, [isOpen,onClose])
  return (
    <>
      {isOpen && <div className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm" onClick={onClose}/>}
      <div className={`fixed right-0 top-0 h-full ${width} max-w-full bg-white shadow-2xl z-40 flex flex-col transition-transform duration-300 ${isOpen?'translate-x-0':'translate-x-full'}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <h3 className="font-display font-semibold text-slate-800 truncate pr-4">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 shrink-0"><X size={18}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </>
  )
}

