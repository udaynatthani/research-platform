import { useState, useRef } from 'react'
import { Upload, FileText, Image, Table, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import api from '../../lib/api'
import useToast from '../../hooks/useToast'
import { getErrorMessage } from '../../utils/errorHandler'

const FILE_ICONS = {
  'application/pdf': { icon: FileText, color: 'text-rose-500', bg: 'bg-rose-50' },
  'image/jpeg': { icon: Image, color: 'text-blue-500', bg: 'bg-blue-50' },
  'image/png': { icon: Image, color: 'text-blue-500', bg: 'bg-blue-50' },
  'image/webp': { icon: Image, color: 'text-blue-500', bg: 'bg-blue-50' },
  'text/csv': { icon: Table, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  'application/json': { icon: FileText, color: 'text-amber-500', bg: 'bg-amber-50' },
  'application/vnd.ms-excel': { icon: Table, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: Table, color: 'text-emerald-500', bg: 'bg-emerald-50' },
}

const DEFAULT_ICON = { icon: FileText, color: 'text-slate-500', bg: 'bg-slate-50' }

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function FileUploader({ entityType, entityId, projectId, onUploadComplete, accept, compact = false }) {
  const { pushToast } = useToast()
  const fileInputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadQueue, setUploadQueue] = useState([]) // { file, status: 'pending'|'uploading'|'done'|'error', progress }

  const handleFiles = (fileList) => {
    const files = Array.from(fileList)
    const queue = files.map(f => ({ file: f, status: 'pending', progress: 0 }))
    setUploadQueue(queue)
    uploadSequentially(queue)
  }

  const uploadSequentially = async (queue) => {
    setUploading(true)
    const results = [...queue]
    for (let i = 0; i < results.length; i++) {
      results[i].status = 'uploading'
      setUploadQueue([...results])

      const formData = new FormData()
      formData.append('file', results[i].file)
      if (entityType) formData.append('entityType', entityType)
      if (entityId) formData.append('entityId', entityId)
      if (projectId) formData.append('projectId', projectId)

      try {
        await api.post('/files/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            results[i].progress = Math.round((e.loaded * 100) / e.total)
            setUploadQueue([...results])
          }
        })
        results[i].status = 'done'
        results[i].progress = 100
      } catch (e) {
        results[i].status = 'error'
        results[i].errorMsg = getErrorMessage(e)
      }
      setUploadQueue([...results])
    }
    setUploading(false)
    const successCount = results.filter(r => r.status === 'done').length
    if (successCount > 0) {
      pushToast({ message: `${successCount} file(s) uploaded`, type: 'success' })
      onUploadComplete?.()
    }
    // Clear queue after delay
    setTimeout(() => setUploadQueue([]), 2500)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const onDragOver = (e) => { e.preventDefault(); setDragOver(true) }
  const onDragLeave = () => setDragOver(false)

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2">
        <input ref={fileInputRef} type="file" className="hidden" accept={accept} multiple onChange={e => handleFiles(e.target.files)} />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-dashed border-blue-200 text-blue-600 text-xs font-bold hover:bg-blue-50 transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <input ref={fileInputRef} type="file" className="hidden" accept={accept} multiple onChange={e => handleFiles(e.target.files)} />
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer group
          ${dragOver
            ? 'border-blue-400 bg-blue-50 scale-[1.01]'
            : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50/50'
          }
        `}
      >
        <div className="flex flex-col items-center gap-3">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${dragOver ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-500'}`}>
            <Upload size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700">
              {dragOver ? 'Drop files here' : 'Click or drag files to upload'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              PDF up to 25MB · Images up to 5MB · Datasets up to 50MB
            </p>
          </div>
        </div>
      </div>

      {uploadQueue.length > 0 && (
        <div className="space-y-2">
          {uploadQueue.map((item, i) => {
            const { icon: Icon, color, bg } = FILE_ICONS[item.file.type] || DEFAULT_ICON
            return (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${item.status === 'error' ? 'border-rose-200 bg-rose-50/50' : 'border-slate-100 bg-white'}`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${bg}`}>
                  <Icon size={16} className={color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-700 truncate">{item.file.name}</p>
                  <p className="text-[10px] text-slate-400">{formatSize(item.file.size)}</p>
                </div>
                <div className="shrink-0">
                  {item.status === 'uploading' && (
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${item.progress}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-blue-600">{item.progress}%</span>
                    </div>
                  )}
                  {item.status === 'done' && <CheckCircle size={16} className="text-emerald-500" />}
                  {item.status === 'error' && (
                    <div className="flex items-center gap-1">
                      <AlertCircle size={14} className="text-rose-500" />
                      <span className="text-[10px] text-rose-500 font-semibold">{item.errorMsg}</span>
                    </div>
                  )}
                  {item.status === 'pending' && <Loader2 size={14} className="text-slate-300 animate-spin" />}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export { FILE_ICONS, DEFAULT_ICON, formatSize }
