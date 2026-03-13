import { useState } from 'react'
import { Download, Trash2, Eye, FileText, Image, Table, ExternalLink, Calendar, HardDrive } from 'lucide-react'
import api from '../../lib/api'
import useApi from '../../hooks/useApi'
import useToast from '../../hooks/useToast'
import Spinner from '../ui/Spinner'
import { getErrorMessage } from '../../utils/errorHandler'

const FILE_ICONS = {
  'application/pdf': { icon: FileText, color: 'text-rose-500', bg: 'bg-rose-50', label: 'PDF' },
  'image/jpeg': { icon: Image, color: 'text-blue-500', bg: 'bg-blue-50', label: 'JPG' },
  'image/png': { icon: Image, color: 'text-blue-500', bg: 'bg-blue-50', label: 'PNG' },
  'image/webp': { icon: Image, color: 'text-blue-500', bg: 'bg-blue-50', label: 'WebP' },
  'text/csv': { icon: Table, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'CSV' },
  'application/json': { icon: FileText, color: 'text-amber-500', bg: 'bg-amber-50', label: 'JSON' },
  'application/vnd.ms-excel': { icon: Table, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'XLS' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: Table, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'XLSX' },
}
const DEFAULT_ICON = { icon: FileText, color: 'text-slate-500', bg: 'bg-slate-50', label: 'File' }

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function FileList({ entityType, entityId, refreshKey = 0 }) {
  const { pushToast } = useToast()
  const [deletingId, setDeletingId] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  const { data: files = [], loading, refetch } = useApi(
    () => entityId ? api.get(`/files/entity/${entityType}/${entityId}`).then(r => r.data) : Promise.resolve([]),
    [entityType, entityId, refreshKey]
  )

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await api.delete(`/files/${id}`)
      pushToast({ message: 'File deleted', type: 'success' })
      refetch()
    } catch (e) {
      pushToast({ message: getErrorMessage(e), type: 'error' })
    }
    setDeletingId(null)
  }

  const handleDownload = async (file) => {
    try {
      const response = await api.get(`/files/${file.id}/download`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = file.originalName
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      pushToast({ message: 'Download failed', type: 'error' })
    }
  }

  const handlePreview = (file) => {
    if (file.mimeType.startsWith('image/')) {
      setPreviewUrl(`http://localhost:5000/${file.storagePath.replace(/\\/g, '/')}`)
    } else if (file.mimeType === 'application/pdf') {
      setPreviewUrl(`http://localhost:5000/${file.storagePath.replace(/\\/g, '/')}`)
    }
  }

  if (loading) return <div className="flex justify-center py-4"><Spinner /></div>
  if (!files.length) return <p className="text-xs text-slate-300 italic text-center py-4">No files attached yet</p>

  return (
    <>
      <div className="space-y-2">
        {files.map(file => {
          const typeInfo = FILE_ICONS[file.mimeType] || DEFAULT_ICON
          const Icon = typeInfo.icon
          const isImage = file.mimeType?.startsWith('image/')
          return (
            <div key={file.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-white hover:border-blue-100 hover:shadow-sm transition-all group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${typeInfo.bg}`}>
                <Icon size={18} className={typeInfo.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-700 truncate">{file.originalName}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <HardDrive size={9} /> {formatSize(file.fileSize)}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Calendar size={9} /> {new Date(file.createdAt).toLocaleDateString()}
                  </span>
                  <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${typeInfo.bg} ${typeInfo.color}`}>
                    {typeInfo.label}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {(isImage || file.mimeType === 'application/pdf') && (
                  <button onClick={() => handlePreview(file)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors" title="Preview">
                    <Eye size={14} />
                  </button>
                )}
                <button onClick={() => handleDownload(file)} className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-500 transition-colors" title="Download">
                  <Download size={14} />
                </button>
                <button 
                  onClick={() => handleDelete(file.id)} 
                  disabled={deletingId === file.id}
                  className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 transition-colors" 
                  title="Delete"
                >
                  {deletingId === file.id ? <Spinner size={12} /> : <Trash2 size={14} />}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-8" onClick={() => setPreviewUrl(null)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl max-h-[90vh] w-full overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <p className="text-sm font-bold text-slate-700">File Preview</p>
              <div className="flex items-center gap-2">
                <a href={previewUrl} target="_blank" rel="noreferrer" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                  <ExternalLink size={14} />
                </a>
                <button onClick={() => setPreviewUrl(null)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors text-xs font-bold">✕</button>
              </div>
            </div>
            <div className="p-4 overflow-auto max-h-[80vh]">
              {previewUrl.match(/\.(jpg|jpeg|png|webp|gif)$/i) || previewUrl.includes('image') ? (
                <img src={previewUrl} alt="Preview" className="max-w-full mx-auto rounded-xl" />
              ) : (
                <iframe src={previewUrl} className="w-full h-[70vh] rounded-xl" title="PDF Preview" />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
