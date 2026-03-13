import { useState, useCallback } from 'react'
import { Plus, Network } from 'lucide-react'
import { useForm } from 'react-hook-form'
import api from '../lib/api'
import useApi from '../hooks/useApi'
import useProject from '../hooks/useProject'
import useToast from '../hooks/useToast'
import ConceptGraph from '../components/concepts/ConceptGraph'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import EmptyState from '../components/ui/EmptyState'

const typeColors = { HYPOTHESIS: 'purple', FINDING: 'blue', TOPIC: 'green', OBSERVATION: 'orange' }

export default function ConceptMapPage() {
  const { activeProject } = useProject()
  const { pushToast } = useToast()
  const pid = activeProject?.id

  const { data: concepts = [], loading, refetch } = useApi(
    () => pid ? api.get(`/concepts/${pid}`).then(r => r.data) : Promise.resolve([]),
    [pid]
  )
  
  const links = (concepts || []).flatMap(n => n.outgoing || [])

  const [modal, setModal] = useState(false)
  const [linkModal, setLinkModal] = useState(false)
  const [selectedNode, setSelectedNode] = useState(null)

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()
  const { register: rl, handleSubmit: hl, reset: resetLink } = useForm()

  const onCreateNode = async (d) => {
    try {
      await api.post('/concepts', { ...d, projectId: pid })
      pushToast({ message: 'Concept node created!', type: 'success' })
      reset(); setModal(false); refetch()
    } catch { pushToast({ message: 'Failed', type: 'error' }) }
  }

  const onCreateLink = async (d) => {
    try {
      await api.post('/concepts/link', { sourceNodeId: selectedNode.id, ...d })
      pushToast({ message: 'Link created!', type: 'success' })
      resetLink(); setLinkModal(false); refetch()
    } catch { pushToast({ message: 'Failed', type: 'error' }) }
  }

  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node)
  }, [])

  if (!pid) return <div className="text-slate-400 text-sm">Select a project to view the concept map.</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900">Concept Map</h1>
          <p className="text-slate-500 text-sm">Build your knowledge graph</p>
        </div>
        <Button className="!bg-purple-600 !text-white hover:!bg-purple-700" onClick={() => setModal(true)}><Plus size={16}/> New Node</Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[calc(100vh-220px)]">
        {/* Left panel — node list */}
        <div className="w-full lg:w-64 shrink-0 flex flex-row lg:flex-col overflow-x-auto lg:overflow-y-auto gap-2 pb-2 lg:pb-0">
          {loading ? [...Array(4)].map((_, i) => <div key={i} className="h-14 lg:h-14 w-32 lg:w-full shrink-0 skeleton rounded-xl" />) :
          concepts.length === 0 ? <EmptyState icon={Network} title="No concepts" description="Create concept nodes" action={() => setModal(true)} actionLabel="Create" /> :
          concepts.map(n => (
            <div key={n.id} onClick={() => setSelectedNode(n)}
              className={`p-3 rounded-xl border cursor-pointer transition-colors shrink-0 w-48 lg:w-full ${selectedNode?.id === n.id ? 'border-purple-300 bg-purple-50' : 'bg-white border-slate-100 hover:border-purple-200'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Badge label={n.type} color={typeColors[n.type] || 'slate'} />
              </div>
              <p className="text-sm font-medium text-slate-800 leading-tight truncate lg:whitespace-normal">{n.title}</p>
            </div>
          ))}
        </div>

        {/* Graph canvas */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden min-h-[400px] lg:min-h-0">
          <ConceptGraph nodes={concepts} links={links} onNodeClick={handleNodeClick} />
          {selectedNode && (
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-100 p-4 w-60 sm:w-64 z-10 transition-all">
              <p className="font-display font-semibold text-sm text-slate-800 mb-1 truncate">{selectedNode.title}</p>
              <Badge label={selectedNode.type} color={typeColors[selectedNode.type] || 'slate'} />
              {selectedNode.description && <p className="text-xs text-slate-500 mt-2 line-clamp-3">{selectedNode.description}</p>}
              <Button size="sm" variant="secondary" className="mt-3 w-full !justify-center" onClick={() => setLinkModal(true)}>
                <Plus size={12}/> Add Link
              </Button>
            </div>
          )}
        </div>
      </div>


      <Modal isOpen={modal} onClose={() => { setModal(false); reset() }} title="New Concept Node">
        <form onSubmit={handleSubmit(onCreateNode)} className="space-y-4">
          <Input label="Title *" {...register('title', { required: true })} />
          <Input label="Type" as="select" {...register('type')}>
            <option>HYPOTHESIS</option><option>FINDING</option><option>TOPIC</option><option>OBSERVATION</option>
          </Input>
          <Input label="Description" as="textarea" {...register('description')} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => { setModal(false); reset() }}>Cancel</Button>
            <Button type="submit" className="!bg-purple-600 !text-white hover:!bg-purple-700" loading={isSubmitting}>Create node</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={linkModal} onClose={() => { setLinkModal(false); resetLink() }} title={`Add link from "${selectedNode?.title}"`}>
        <form onSubmit={hl(onCreateLink)} className="space-y-4">
          <Input label="Target node" as="select" {...rl('targetNodeId', { required: true })}>
            <option value="">Select target...</option>
            {(concepts || []).filter(n => n.id !== selectedNode?.id).map(n => <option key={n.id} value={n.id}>{n.title}</option>)}
          </Input>
          <Input label="Relationship type" placeholder="SUPPORTS, CONTRADICTS, LEADS_TO..." {...rl('relationshipType', { required: true })} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => { setLinkModal(false); resetLink() }}>Cancel</Button>
            <Button type="submit" className="!bg-purple-600 !text-white hover:!bg-purple-700">Create link</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
