import { useState, useEffect } from 'react'
import { Tag, StickyNote, Plus } from 'lucide-react'
import Drawer from '../ui/Drawer'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import Input from '../ui/Input'
import api from '../../lib/api'
import useToast from '../../hooks/useToast'

export default function PaperDetailPanel({ paper, onClose }) {
  const { pushToast } = useToast()
  const [notes, setNotes] = useState([])
  const [noteText, setNoteText] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [addingNote, setAddingNote] = useState(false)
  const [addingTag, setAddingTag] = useState(false)
  useEffect(() => {
    if (!paper) return
    api.get(`/notes/paper/${paper.id}`).then(r=>setNotes(r.data||[])).catch(()=>{})
  }, [paper?.id])
  const submitNote = async () => {
    if (!noteText.trim()) return
    setAddingNote(true)
    try {
      const { data } = await api.post('/notes', { paperId: paper.id, content: noteText })
      setNotes(n=>[data,...n]); setNoteText('')
      pushToast({ message:'Note saved', type:'success' })
    } catch { pushToast({ message:'Failed', type:'error' }) }
    setAddingNote(false)
  }
  const addTag = async () => {
    if (!tagInput.trim()) return
    setAddingTag(true)
    try {
      await api.post('/tags', { paperId: paper.id, tagName: tagInput.trim() })
      setTagInput(''); pushToast({ message:'Tag added', type:'success' })
    } catch { pushToast({ message:'Failed', type:'error' }) }
    setAddingTag(false)
  }
  return (
    <Drawer isOpen={!!paper} onClose={onClose} title={paper?.title||'Paper Details'} width="w-[480px]">
      {paper && (
        <div className="space-y-6">
          <div className="space-y-1.5">
            {paper.authors?.length>0 && <p className="text-sm text-slate-600"><span className="font-semibold">Authors:</span> {paper.authors.map(a=>a.author?.name||a.name).join(', ')}</p>}
            {paper.publicationYear && <p className="text-sm text-slate-600"><span className="font-semibold">Year:</span> {paper.publicationYear}</p>}
            {paper.doi && <p className="text-sm text-slate-600"><span className="font-semibold">DOI:</span> {paper.doi}</p>}
          </div>
          {paper.abstract && (
            <div>
              <h4 className="font-display font-semibold text-sm text-slate-700 mb-2">Abstract</h4>
              <p className="text-sm text-slate-600 leading-relaxed">{paper.abstract}</p>
            </div>
          )}
          <div>
            <h4 className="font-display font-semibold text-sm text-slate-700 mb-2 flex items-center gap-2"><Tag size={14}/>Tags</h4>
            <div className="flex flex-wrap gap-1 mb-2">
              {paper.tags?.map(t=><Badge key={t.tag?.id||t} label={t.tag?.name||t} color="pink"/>)}
            </div>
            <div className="flex gap-2">
              <Input placeholder="Add tag..." value={tagInput} onChange={e=>setTagInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addTag()} className="flex-1"/>
              <Button size="sm" variant="secondary" loading={addingTag} onClick={addTag}><Plus size={12}/></Button>
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold text-sm text-slate-700 mb-2 flex items-center gap-2"><StickyNote size={14}/>Notes</h4>
            <Input as="textarea" rows={3} placeholder="Write a note..." value={noteText} onChange={e=>setNoteText(e.target.value)}/>
            <Button size="sm" variant="secondary" loading={addingNote} onClick={submitNote} className="mt-2">Save note</Button>
            <div className="mt-3 space-y-2">
              {notes.map(n=>(
                <div key={n.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-sm text-slate-700">{n.content}</p>
                  <p className="text-xs text-slate-400 mt-1">{new Date(n.updatedAt||n.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Drawer>
  )
}
