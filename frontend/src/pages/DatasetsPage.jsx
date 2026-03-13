import { useState } from 'react'
import { FolderOpen, Upload, Paperclip } from 'lucide-react'
import useProject from '../hooks/useProject'
import FileUploader from '../components/files/FileUploader'
import FileList from '../components/files/FileList'

export default function DatasetsPage() {
  const { activeProject } = useProject()
  const pid = activeProject?.id
  const [refreshKey, setRefreshKey] = useState(0)

  if (!pid) return <div className="text-slate-400 text-sm">Select a project to manage datasets and files.</div>

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-display font-bold text-2xl text-slate-900">Datasets & Files</h1>
        <p className="text-slate-500 text-sm">Upload and manage datasets, PDFs, images, and other research materials</p>
      </div>

      {/* Upload Zone */}
      <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/30">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Upload size={20} />
          </div>
          <div>
            <h2 className="font-display font-bold text-slate-800">Upload Files</h2>
            <p className="text-xs text-slate-400">Drag and drop or click to upload research materials</p>
          </div>
        </div>
        <FileUploader 
          entityType="PROJECT" 
          entityId={pid} 
          projectId={pid} 
          onUploadComplete={() => setRefreshKey(k => k + 1)} 
          accept=".pdf,.jpg,.jpeg,.png,.webp,.csv,.json,.xlsx,.xls"
        />
      </div>

      {/* Files List */}
      <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/30">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
            <Paperclip size={20} />
          </div>
          <div>
            <h2 className="font-display font-bold text-slate-800">Project Files</h2>
            <p className="text-xs text-slate-400">All files attached to this project</p>
          </div>
        </div>
        <FileList entityType="PROJECT" entityId={pid} refreshKey={refreshKey} />
      </div>

      {/* Dataset files */}
      <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/30">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
            <FolderOpen size={20} />
          </div>
          <div>
            <h2 className="font-display font-bold text-slate-800">Datasets</h2>
            <p className="text-xs text-slate-400">Upload CSV, JSON, or Excel files for data analysis</p>
          </div>
        </div>
        <FileUploader 
          entityType="DATASET" 
          entityId={pid} 
          projectId={pid} 
          onUploadComplete={() => setRefreshKey(k => k + 1)} 
          accept=".csv,.json,.xlsx,.xls"
          compact
        />
        <div className="mt-3">
          <FileList entityType="DATASET" entityId={pid} refreshKey={refreshKey} />
        </div>
      </div>
    </div>
  )
}
