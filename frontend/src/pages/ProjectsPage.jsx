import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, FolderOpen, Globe, Lock } from 'lucide-react'
import api from '../lib/api'
import useProject from '../hooks/useProject'
import useApi from '../hooks/useApi'
import useToast from '../hooks/useToast'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import EmptyState from '../components/ui/EmptyState'

const schema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  visibility: z.enum(['PRIVATE', 'PUBLIC']),
})

export default function ProjectsPage() {
  const { pushToast } = useToast()
  const { setActiveProject } = useProject()
  const { data: projects, loading, refetch } = useApi(() => api.get('/projects').then(r => r.data))
  const [modal, setModal] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { visibility: 'PRIVATE' }
  })

  const onSubmit = async (d) => {
    try {
      await api.post('/projects', d)
      pushToast({ message: 'Project created!', type: 'success' })
      reset(); setModal(false); refetch()
    } catch (e) {
      pushToast({ message: e.response?.data?.error || 'Failed to create project', type: 'error' })
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900">Projects</h1>
          <p className="text-slate-500 text-sm">Organize all your research in one place</p>
        </div>
        <Button variant="emerald" onClick={() => setModal(true)}><Plus size={16} /> New Project</Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-36 skeleton rounded-2xl" />)}
        </div>
      ) : !projects?.length ? (
        <EmptyState icon={FolderOpen} title="No projects yet" description="Create your first research project to get started." action={() => setModal(true)} actionLabel="Create project" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(p => (
            <Card key={p.id} accentColor="emerald" className="p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveProject(p)}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <FolderOpen size={20} />
                </div>
                <Badge label={p.visibility} color={p.visibility === 'PUBLIC' ? 'emerald' : 'slate'} />
              </div>
              <h3 className="font-display font-semibold text-slate-800 mb-1 leading-tight">{p.title}</h3>
              {p.description && <p className="text-xs text-slate-500 line-clamp-2">{p.description}</p>}
              <p className="text-xs text-slate-400 mt-3">by {p.owner?.username || 'you'}</p>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={modal} onClose={() => { setModal(false); reset() }} title="New Research Project">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Title" placeholder="AI in Clinical Diagnostics..." error={errors.title?.message} {...register('title')} />
          <Input label="Description" as="textarea" placeholder="What is this research about?" {...register('description')} />
          <Input label="Visibility" as="select" {...register('visibility')}>
            <option value="PRIVATE">Private</option>
            <option value="PUBLIC">Public</option>
          </Input>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => { setModal(false); reset() }}>Cancel</Button>
            <Button type="submit" variant="emerald" loading={isSubmitting}>Create project</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
