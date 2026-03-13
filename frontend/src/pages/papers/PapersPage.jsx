import { useState, useMemo, useCallback } from 'react'
import { Search, Plus, BookOpen } from 'lucide-react'
import { useForm } from 'react-hook-form'
import api from '../../lib/api'
import useApi from '../../hooks/useApi'
import useToast from '../../hooks/useToast'
import PaperCard from '../../components/papers/PaperCard'
import PaperDetailPanel from '../../components/papers/PaperDetailPanel'
import ExternalResultCard from '../../components/papers/ExternalResultCard'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'

export default function PapersPage() {
  const { pushToast } = useToast()
  const [tab, setTab] = useState('local')
  const [query, setQuery] = useState('')
  const [selectedPaper, setSelectedPaper] = useState(null)
  const [addModal, setAddModal] = useState(false)
  const [extResults, setExtResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const { data: localPapers = [], loading, refetch } = useApi(() => api.get('/papers').then(r => r.data))
  const filtered = useMemo(() => {
    if (!query) return localPapers
    const q = query.toLowerCase()
    return localPapers.filter(p => p.title?.toLowerCase().includes(q) || p.abstract?.toLowerCase().includes(q))
  }, [localPapers, query])
  const searchExternal = useCallback(async () => {
    if (!query.trim()) return
    setSearching(true)
    try {
      const { data } = await api.get(`/papers/search-external?q=${encodeURIComponent(query)}`)
      setExtResults(data || [])
    } catch (e) {
      pushToast({ message: e.response?.data?.error || 'External search failed', type: 'error' })
    }
    setSearching(false)
  }, [query])
  const { register, handleSubmit, reset } = useForm()
  const onAddSubmit = async (d) => {
    setAddLoading(true)
    try {
      await api.post('/papers', d)
      pushToast({ message: 'Paper added!', type: 'success' })
      refetch(); reset(); setAddModal(false)
    } catch (e) { pushToast({ message: e.response?.data?.error || 'Failed', type: 'error' }) }
    setAddLoading(false)
  }
  const handleSelect = useCallback((p) => setSelectedPaper(p), [])
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900">Papers</h1>
          <p className="text-slate-500 text-sm">Search and manage your literature library</p>
        </div>
        <Button variant="blue" onClick={() => setAddModal(true)}><Plus size={16}/> Add Paper</Button>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-[380px] xl:w-[420px] lg:shrink-0 space-y-3">
          <div className="bg-white rounded-xl border border-slate-100 p-1 flex gap-1">
            {['local','external'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium font-display capitalize transition-colors ${tab===t?'bg-blue-600 text-white':'text-slate-500 hover:text-slate-700'}`}>{t}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input value={query} onChange={e=>setQuery(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&tab==='external'&&searchExternal()}
                placeholder={tab==='local'?'Filter papers...':'Search Semantic Scholar...'}
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"/>
            </div>
            {tab==='external' && <Button size="sm" variant="blue" loading={searching} onClick={searchExternal}>Search</Button>}
          </div>
          <div className="space-y-2 lg:max-h-[calc(100vh-260px)] overflow-y-auto pr-1">
            {tab==='local' ? (
              loading ? [...Array(4)].map((_,i)=><div key={i} className="h-20 skeleton rounded-xl"/>) :
              filtered.length===0 ? <EmptyState icon={BookOpen} title="No papers" description="Add papers or search Semantic Scholar"/> :
              filtered.map(p=><PaperCard key={p.id} paper={p} onSelect={handleSelect} isSelected={selectedPaper?.id===p.id}/>)
            ) : (
              extResults.length===0 ? <p className="text-sm text-slate-400 text-center py-8">Search Semantic Scholar to find papers</p> :
              extResults.map((p,i)=><ExternalResultCard key={i} paper={p} onSaved={refetch}/>)
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          {selectedPaper ? (
            <PaperDetailPanel paper={selectedPaper} onClose={() => setSelectedPaper(null)} onDelete={refetch}/>
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-300 border-2 border-dashed border-slate-200 rounded-2xl">
              <div className="text-center"><BookOpen size={40} className="mx-auto mb-2"/><p className="text-sm font-medium">Select a paper to view details</p></div>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={addModal} onClose={() => { setAddModal(false); reset() }} title="Add Paper Manually" size="lg">
        <form onSubmit={handleSubmit(onAddSubmit)} className="space-y-4">
          <Input label="Title *" {...register('title',{required:true})}/>
          <Input label="Abstract" as="textarea" rows={3} {...register('abstract')}/>
          <div className="grid grid-cols-2 gap-4">
            <Input label="DOI" {...register('doi')}/>
            <Input label="URL" {...register('url')}/>
            <Input label="Publication Year" type="number" {...register('publicationYear',{valueAsNumber:true})}/>
            <Input label="Citation Count" type="number" {...register('citationCount',{valueAsNumber:true})}/>
          </div>
          <Input label="Source" placeholder="Semantic Scholar, arXiv..." {...register('source')}/>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => { setAddModal(false); reset() }}>Cancel</Button>
            <Button type="submit" variant="blue" loading={addLoading}>Add paper</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
