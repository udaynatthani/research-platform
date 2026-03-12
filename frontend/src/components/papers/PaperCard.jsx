import { memo, useCallback } from 'react'
import { BookOpen, Calendar, Quote } from 'lucide-react'
import Badge from '../ui/Badge'

const PaperCard = memo(function PaperCard({ paper, onSelect, isSelected }) {
  const handleClick = useCallback(() => onSelect(paper), [paper, onSelect])
  return (
    <div onClick={handleClick}
      className={`p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-blue-300 bg-blue-50' : 'border-slate-100 bg-white hover:border-blue-200 hover:bg-slate-50'}`}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-500 shrink-0 mt-0.5"><BookOpen size={16}/></div>
        <div className="flex-1 min-w-0">
          <h4 className="font-display font-semibold text-slate-800 text-sm leading-tight line-clamp-2">{paper.title}</h4>
          {paper.authors?.length > 0 && (
            <p className="text-xs text-slate-500 mt-1 truncate">{paper.authors.map(a=>a.author?.name||a.name).filter(Boolean).join(', ')}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            {paper.publicationYear && <span className="flex items-center gap-1 text-xs text-slate-400"><Calendar size={11}/>{paper.publicationYear}</span>}
            {paper.citationCount > 0 && <span className="flex items-center gap-1 text-xs text-slate-400"><Quote size={11}/>{paper.citationCount}</span>}
          </div>
          {paper.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {paper.tags.slice(0,3).map(t=><Badge key={t.tag?.id||t} label={t.tag?.name||t} color="pink"/>)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}, (p,n) => p.paper.id===n.paper.id && p.isSelected===n.isSelected)

export default PaperCard
