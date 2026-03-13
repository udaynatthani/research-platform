import { useState, useEffect } from 'react'
import { Tag, StickyNote, Plus, FolderPlus, Calendar, Maximize2, ArrowLeft, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Drawer from '../ui/Drawer'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import Input from '../ui/Input'
import api from '../../lib/api'
import useToast from '../../hooks/useToast'
import { getErrorMessage } from '../../utils/errorHandler'

export default function PaperDetailPanel({ paper, onClose, onDelete }) {
  const { pushToast } = useToast()
  const navigate = useNavigate()
  const [notes, setNotes] = useState([])
  const [noteText, setNoteText] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [collections, setCollections] = useState([])
  const [selectedCollection, setSelectedCollection] = useState('')
  const [addingNote, setAddingNote] = useState(false)
  const [addingTag, setAddingTag] = useState(false)
  const [addingToCol, setAddingToCol] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  useEffect(() => {
    if (!paper) return
    api.get(`/notes/paper/${paper.id}`).then(r => setNotes(r.data || [])).catch(() => { })
    api.get('/collections').then(r => setCollections(r.data || [])).catch(() => { })
  }, [paper?.id])
  const submitNote = async () => {
    if (!noteText.trim()) return
    setAddingNote(true)
    try {
      const { data } = await api.post('/notes', { paperId: paper.id, content: noteText })
      setNotes(n => [data, ...n]); setNoteText('')
      pushToast({ message: 'Note saved', type: 'success' })
    } catch { pushToast({ message: 'Failed', type: 'error' }) }
    setAddingNote(false)
  }
  const addTag = async () => {
    if (!tagInput.trim()) return
    setAddingTag(true)
    try {
      await api.post('/tags', { paperId: paper.id, tagName: tagInput.trim() })
      setTagInput(''); pushToast({ message: 'Tag added', type: 'success' })
    } catch { pushToast({ message: 'Failed', type: 'error' }) }
    setAddingTag(false)
  }
  const addToCollection = async () => {
    if (!selectedCollection) return
    setAddingToCol(true)
    try {
      await api.post(`/collections/${selectedCollection}/papers`, { paperId: paper.id })
      pushToast({ message: 'Added to collection', type: 'success' })
    } catch (e) { pushToast({ message: e.response?.data?.error || 'Failed', type: 'error' }) }
    setAddingToCol(false)
  }
  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
      return
    }
    setDeleting(true)
    try {
      await api.delete(`/papers/${paper.id}`)
      pushToast({ message: 'Paper deleted successfully', type: 'success' })
      if (onDelete) onDelete()
      onClose()
    } catch (e) {
      pushToast({ message: getErrorMessage(e), type: 'error' })
    }
    setDeleting(false)
  }
  const noteColors = ['bg-amber-50 border-amber-100 text-amber-900', 'bg-blue-50 border-blue-100 text-blue-900', 'bg-emerald-50 border-emerald-100 text-emerald-900', 'bg-rose-50 border-rose-100 text-rose-900', 'bg-purple-50 border-purple-100 text-purple-900'];
  return (
    <Drawer isOpen={!!paper} onClose={onClose} title={paper?.title || 'Paper Details'} width="w-[480px]">
      {paper && (
        <div className="space-y-5">
          {/* Open Full Page */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center justify-between group cursor-pointer hover:bg-blue-100 transition-all" onClick={() => navigate(`/papers/${paper.id}`)}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                <Maximize2 size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-blue-900">Open Full Page</p>
                <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-widest">Detail View</p>
              </div>
            </div>
            <ArrowLeft className="rotate-180 text-blue-400 group-hover:translate-x-1 transition-transform" size={18} />
          </div>

          {/* Metadata */}
          <div className="space-y-1.5">
            {paper.authors?.length > 0 && <p className="text-sm text-slate-600"><span className="font-semibold">Authors:</span> {paper.authors.map(a => a.author?.name || a.name).join(', ')}</p>}
            {paper.publicationYear && <p className="text-sm text-slate-600"><span className="font-semibold">Year:</span> {paper.publicationYear}</p>}
            {paper.doi && <p className="text-sm text-slate-600"><span className="font-semibold">DOI:</span> {paper.doi}</p>}
          </div>

          {/* Abstract */}
          {paper.abstract && (
            <div>
              <h4 className="font-display font-semibold text-sm text-slate-700 mb-2">Abstract</h4>
              <p className="text-sm text-slate-600 leading-relaxed">{paper.abstract}</p>
            </div>
          )}

          {/* Add to Collection */}
          <div>
            <h4 className="font-display font-semibold text-sm text-slate-700 mb-2 flex items-center gap-2"><FolderPlus size={14} />Add to Collection</h4>
            <div className="flex gap-2">
              <select
                value={selectedCollection}
                onChange={e => setSelectedCollection(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select a collection...</option>
                {collections.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <Button size="sm" variant="blue" loading={addingToCol} onClick={addToCollection} disabled={!selectedCollection}>
                Add
              </Button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <h4 className="font-display font-semibold text-sm text-slate-700 mb-2 flex items-center gap-2"><Tag size={14} />Tags</h4>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {paper.tags?.map(t => <Badge key={t.tag?.id || t.tagId || t} label={t.tag?.name || t} color="pink" />)}
              {(!paper.tags || paper.tags.length === 0) && <p className="text-xs text-slate-300 italic">No tags</p>}
            </div>
            <div className="flex gap-2">
              <Input placeholder="Add tag..." value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()} className="flex-1" />
              <Button size="sm" variant="secondary" loading={addingTag} onClick={addTag}><Plus size={12} /></Button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <h4 className="font-display font-semibold text-sm text-slate-700 mb-2 flex items-center gap-2"><StickyNote size={14} />Notes</h4>
            <Input as="textarea" rows={3} placeholder="Write a note..." value={noteText} onChange={e => setNoteText(e.target.value)} />
            <Button size="sm" variant="secondary" loading={addingNote} onClick={submitNote} className="mt-2">Save note</Button>
            <div className="mt-3 space-y-2">
              {notes.map((n, i) => (
                <div key={n.id} className={`p-3 rounded-xl border shadow-sm ${noteColors[i % noteColors.length]}`}>
                  <p className="text-sm font-medium leading-relaxed">{n.content}</p>
                  <div className="flex items-center gap-2 mt-2 opacity-60 text-[10px] font-bold uppercase tracking-wider">
                    <Calendar size={10} />
                    {new Date(n.updatedAt || n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delete Paper */}
          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className={`w-full py-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 text-xs font-bold ${confirmDelete ? 'bg-rose-500 border-rose-600 text-white animate-pulse' : 'border-rose-200 text-rose-500 hover:bg-rose-50'}`}
            >
              <Trash2 size={16} />
              {confirmDelete ? 'CLICK AGAIN TO CONFIRM' : 'DELETE PAPER'}
            </button>
          </div>
        </div>
      )}
    </Drawer>
  )
}

