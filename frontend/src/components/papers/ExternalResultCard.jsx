import { memo, useCallback, useState } from 'react'
import { ExternalLink, Save } from 'lucide-react'
import Button from '../ui/Button'
import api from '../../lib/api'
import useToast from '../../hooks/useToast'

const ExternalResultCard = memo(function ExternalResultCard({ paper, onSaved }) {
  const { pushToast } = useToast()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const save = useCallback(async () => {
    setSaving(true)
    try {
      await api.post('/papers/save-external', paper)
      setSaved(true); pushToast({ message: 'Paper saved!', type: 'success' }); onSaved?.()
    } catch (e) { pushToast({ message: e.response?.data?.error || 'Failed', type: 'error' }) }
    setSaving(false)
  }, [paper])
  return (
    <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50">
      <h4 className="font-display font-semibold text-slate-800 text-sm leading-tight">{paper.title}</h4>
      <p className="text-xs text-slate-500 mt-1">{paper.authors?.map(a=>a.name).join(', ')}</p>
      {paper.year && <p className="text-xs text-slate-400 mt-0.5">{paper.year}</p>}
      {paper.abstract && <p className="text-xs text-slate-600 mt-2 line-clamp-3">{paper.abstract}</p>}
      <div className="flex items-center gap-2 mt-3">
        {paper.url && <a href={paper.url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1"><ExternalLink size={11}/>Open</a>}
        <Button size="sm" variant="blue" loading={saving} disabled={saved} onClick={save}>
          <Save size={12}/>{saved ? 'Saved' : 'Save'}
        </Button>
      </div>
    </div>
  )
})
export default ExternalResultCard
