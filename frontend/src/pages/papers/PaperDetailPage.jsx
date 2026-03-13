import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Tag, StickyNote, Plus, Calendar, Share2, ExternalLink, Bookmark, BookOpen, Edit3, Trash2, X, Check, Paperclip } from 'lucide-react'
import { useState, useEffect } from 'react'
import api from '../../lib/api'
import useApi from '../../hooks/useApi'
import useToast from '../../hooks/useToast'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Spinner from '../../components/ui/Spinner'
import FileUploader from '../../components/files/FileUploader'
import FileList from '../../components/files/FileList'

export default function PaperDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { pushToast } = useToast()
  
  const { data: paper, loading, error, refetch } = useApi(
    () => api.get(`/papers/${id}`).then(r => r.data),
    [id]
  )

  const [notes, setNotes] = useState([])
  const [noteText, setNoteText] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [addingNote, setAddingNote] = useState(false)
  const [addingTag, setAddingTag] = useState(false)
  
  const [editingNoteId, setEditingNoteId] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [paperDeleting, setPaperDeleting] = useState(false)
  const [fileRefreshKey, setFileRefreshKey] = useState(0)

  useEffect(() => {
    if (id) {
      api.get(`/notes/paper/${id}`).then(r => setNotes(r.data || [])).catch(() => {})
    }
  }, [id])

  const submitNote = async () => {
    if (!noteText.trim()) return
    setAddingNote(true)
    try {
      const { data } = await api.post('/notes', { paperId: id, content: noteText })
      setNotes(n => [data, ...n]); setNoteText('')
      pushToast({ message: 'Note saved', type: 'success' })
    } catch { pushToast({ message: 'Failed', type: 'error' }) }
    setAddingNote(false)
  }

  const deleteNote = async (noteId) => {
    setDeletingId(noteId)
    try {
      await api.delete(`/notes/${noteId}`)
      setNotes(n => n.filter(x => x.id !== noteId))
      pushToast({ message: 'Note deleted', type: 'success' })
    } catch { pushToast({ message: 'Failed to delete', type: 'error' }) }
    setDeletingId(null)
  }

  const startEdit = (note) => {
    setEditingNoteId(note.id)
    setEditContent(note.content)
  }

  const cancelEdit = () => {
    setEditingNoteId(null)
    setEditContent('')
  }

  const updateNote = async () => {
    if (!editContent.trim()) return
    const noteId = editingNoteId
    try {
      const { data } = await api.put(`/notes/${noteId}`, { content: editContent })
      setNotes(n => n.map(x => x.id === noteId ? data : x))
      pushToast({ message: 'Note updated', type: 'success' })
      cancelEdit()
    } catch { pushToast({ message: 'Failed to update', type: 'error' }) }
  }

  const addTag = async () => {
    if (!tagInput.trim()) return
    setAddingTag(true)
    try {
      await api.post('/tags', { paperId: id, tagName: tagInput.trim() })
      setTagInput(''); pushToast({ message: 'Tag added', type: 'success' }); refetch()
    } catch { pushToast({ message: 'Failed', type: 'error' }) }
    setAddingTag(false)
  }
  const deletePaper = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
      return
    }
    setPaperDeleting(true)
    try {
      await api.delete(`/papers/${id}`)
      pushToast({ message: 'Paper deleted successfully', type: 'success' })
      navigate('/papers')
    } catch (e) {
      pushToast({ message: e.response?.data?.error || 'Failed to delete', type: 'error' })
    }
    setPaperDeleting(false)
  }

  const noteColors = ['bg-amber-50 border-amber-100 text-amber-900', 'bg-blue-50 border-blue-100 text-blue-900', 'bg-emerald-50 border-emerald-100 text-emerald-900', 'bg-rose-50 border-rose-100 text-rose-900', 'bg-purple-50 border-purple-100 text-purple-900']

  if (loading) return <div className="flex items-center justify-center h-screen"><Spinner /></div>
  if (error || !paper) return <div className="p-8 text-center text-slate-500">Paper not found or error loading paper.</div>

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors group px-1">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
        </button>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-display font-black text-slate-900 tracking-tight leading-tight">
            {paper.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm">
             {paper.authors?.length > 0 && (
               <div className="flex items-center gap-2 text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full font-semibold">
                 {paper.authors.map(a => a.author?.name || a.name).join(', ')}
               </div>
             )}
             {paper.publicationYear && (
               <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                 <Calendar size={13} className="text-blue-500" /> {paper.publicationYear}
               </div>
             )}
             <div className="flex-1" />
             <div className="flex items-center gap-2">
               {paper.doi && <Button size="xs" variant="ghost" className="!text-blue-600" onClick={() => window.open(`https://doi.org/${paper.doi}`, '_blank')}><ExternalLink size={12}/> DOI</Button>}
               {paper.url && <Button size="xs" variant="ghost" className="!text-blue-600" onClick={() => window.open(paper.url, '_blank')}><Bookmark size={12}/> Source</Button>}
               <Button size="xs" variant="ghost" className="!text-slate-400 hover:!text-slate-600"><Share2 size={12}/></Button>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <section className="space-y-4">
            <h2 className="text-xs font-black text-blue-500 uppercase tracking-[0.2em] flex items-center gap-2">
               Abstract
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed font-medium">
              {paper.abstract || 'No abstract available.'}
            </p>
          </section>

          <section className="space-y-8 pt-8 border-t border-slate-100">
             <div className="flex items-center justify-between">
               <h2 className="text-xl font-display font-bold text-slate-800 flex items-center gap-2">
                 <StickyNote size={20} className="text-amber-500" /> Research Notes
               </h2>
               <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{notes.length} notes</span>
             </div>
             
             <div className="space-y-6">
               <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 focus-within:border-blue-200 focus-within:ring-4 focus-within:ring-blue-50 transition-all shadow-inner">
                 <Input as="textarea" rows={3} placeholder="Paste a snippet or record a finding..." value={noteText} onChange={e => setNoteText(e.target.value)} className="bg-transparent border-none shadow-none focus:ring-0 resize-none px-0 text-slate-700 font-medium placeholder:text-slate-300" />
                 <div className="flex justify-end mt-4">
                   <Button size="sm" variant="blue" loading={addingNote} onClick={submitNote} disabled={!noteText.trim()}>Save Note</Button>
                 </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {notes.map((n, i) => (
                    <div key={n.id} className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between group/note relative hover:scale-[1.02] transition-transform cursor-default ${noteColors[i % noteColors.length]}`}>
                      {/* Note Actions */}
                      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover/note:opacity-100 transition-opacity">
                         {editingNoteId !== n.id ? (
                           <>
                             <button onClick={() => startEdit(n)} className="p-1.5 rounded-lg hover:bg-black/5 transition-colors text-current">
                               <Edit3 size={14} />
                             </button>
                             <button onClick={() => deleteNote(n.id)} disabled={deletingId === n.id} className="p-1.5 rounded-lg hover:bg-rose-500 hover:text-white transition-all text-current">
                               {deletingId === n.id ? <Spinner size={12} /> : <Trash2 size={14} />}
                             </button>
                           </>
                         ) : null}
                      </div>

                      {editingNoteId === n.id ? (
                        <div className="space-y-4">
                          <textarea 
                            value={editContent} 
                            onChange={e => setEditContent(e.target.value)}
                            className="w-full bg-white/50 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-black/5 resize-none"
                            rows={4}
                          />
                          <div className="flex justify-end gap-2">
                            <button onClick={cancelEdit} className="p-2 rounded-xl bg-black/5 hover:bg-black/10 transition-colors">
                               <X size={14} />
                            </button>
                            <button onClick={updateNote} className="p-2 rounded-xl bg-black text-white hover:bg-black/80 transition-colors">
                               <Check size={14} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm font-bold leading-relaxed mb-6">{n.content}</p>
                      )}

                      <div className="flex items-center gap-2 opacity-40 text-[9px] font-black uppercase tracking-widest mt-auto pt-3 border-t border-current/10">
                        <Calendar size={10} />
                        {new Date(n.updatedAt || n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </section>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-2xl shadow-slate-200/50 space-y-8 sticky top-24">
            <section className="space-y-3">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Tag size={12} className="text-rose-500" /> Tags
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {paper.tags?.map(t => (
                  <Badge key={t.tag?.id || t.tagId || t} label={t.tag?.name || t} color="pink" />
                ))}
                {paper.tags?.length === 0 && <p className="text-xs text-slate-300 italic">N/A</p>}
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-50">
                <Input size="sm" placeholder="New tag..." value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()} className="flex-1 text-xs bg-slate-50/50" />
                <Button size="xs" variant="ghost" className="!bg-slate-100" loading={addingTag} onClick={addTag}><Plus size={14} /></Button>
              </div>
            </section>

            <section className="space-y-4 pt-6 border-t border-slate-50">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">Metadata</h3>
              <div className="space-y-3">
                {paper.doi && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">DOI Identifier</span>
                    <span className="text-[11px] text-slate-800 font-mono select-all break-all bg-slate-50 p-2 rounded-lg border border-slate-100">{paper.doi}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xs py-1">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Indexed</span> 
                  <span className="text-slate-800 font-semibold">{new Date(paper.createdAt).toLocaleDateString()}</span>
                </div>
                {paper.citationCount !== undefined && (
                  <div className="flex justify-between items-center text-xs py-1 border-t border-slate-50">
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Citations</span> 
                    <span className="text-blue-600 font-black">{paper.citationCount}</span>
                  </div>
                )}
                {paper.source && (
                  <div className="flex justify-between items-center text-xs py-1 border-t border-slate-50">
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Origin</span> 
                    <span className="text-slate-800 font-bold italic">{paper.source}</span>
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-4 pt-6 border-t border-slate-50">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Paperclip size={12} className="text-blue-500" /> Attachments
              </h3>
              <FileUploader entityType="PAPER" entityId={id} compact onUploadComplete={() => setFileRefreshKey(k => k + 1)} accept=".pdf,.jpg,.jpeg,.png,.webp,.csv,.json,.xlsx" />
              <FileList entityType="PAPER" entityId={id} refreshKey={fileRefreshKey} />
            </section>
            
            <Button 
              size="sm" 
              variant="blue" 
              className="w-full !rounded-2xl shadow-lg shadow-blue-500/20 py-4 font-bold tracking-tight"
              onClick={() => navigate('/ai', { state: { paperId: id, autoAction: 'summarize' } })}
            >
               Generate AI Summary
            </Button>

            <button 
              onClick={deletePaper}
              disabled={paperDeleting}
              className={`w-full py-3 rounded-2xl border transition-all flex items-center justify-center gap-2 font-bold text-xs ${confirmDelete ? 'bg-rose-500 border-rose-600 text-white animate-pulse' : 'bg-white border-rose-100 text-rose-500 hover:bg-rose-50'}`}
            >
              <Trash2 size={16} />
              {confirmDelete ? 'CONFIRM DELETE?' : 'DELETE PAPER'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
