import { useState, useCallback, memo } from 'react';
import { Plus, Bookmark, Trash2, ArrowLeft } from 'lucide-react';
import useToast from '../hooks/useToast';
import useApi from '../hooks/useApi';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import EmptyState from '../components/ui/EmptyState';
import api from '../lib/api';

export default function CollectionsPage() {
  const { pushToast } = useToast();
  const [createModal, setCreateModal] = useState(false);
  const [activeCollection, setActiveCollection] = useState(null);
  const [colName, setColName] = useState('');
  const [colDetail, setColDetail] = useState(null);

  const { data: collections, loading, refetch } = useApi(() => api.get('/collections').then((r) => r.data));

  const handleCreate = useCallback(async () => {
    try {
      await api.post('/collections', { name: colName });
      pushToast({ message: 'Collection created', type: 'success' });
      setCreateModal(false);
      setColName('');
      refetch();
    } catch (err) {
      pushToast({ message: 'Failed', type: 'error' });
    }
  }, [colName, pushToast, refetch]);

  const handleOpen = useCallback(async (col) => {
    setActiveCollection(col);
    try {
      const { data } = await api.get(`/collections/${col.id}`);
      setColDetail(data);
    } catch (_) {}
  }, []);

  const handleRemovePaper = useCallback(async (paperId) => {
    try {
      await api.delete(`/collections/${activeCollection.id}/papers/${paperId}`);
      setColDetail((c) => ({ ...c, papers: c.papers.filter((p) => p.paperId !== paperId) }));
      pushToast({ message: 'Removed', type: 'success' });
    } catch (_) {}
  }, [activeCollection?.id, pushToast]);

  const handleDeleteCollection = useCallback(async (id) => {
    try {
      await api.delete(`/collections/${id}`);
      pushToast({ message: 'Deleted', type: 'success' });
      refetch();
    } catch (_) {}
  }, [pushToast, refetch]);

  if (activeCollection) {
    return (
      <div className="p-6 max-w-4xl">
        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6" onClick={() => setActiveCollection(null)}>
          <ArrowLeft size={14} /> Back to Collections
        </button>
        <h1 className="text-xl font-bold text-gray-900 mb-6">{activeCollection.name}</h1>
        {!colDetail?.papers?.length ? (
          <EmptyState title="No papers in this collection" description="Add papers from the Papers page" />
        ) : (
          <div className="space-y-3">
            {colDetail.papers.map((cp) => (
              <Card key={cp.paperId} accentColor="violet" className="p-4 flex items-center gap-3">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">{cp.paper?.title}</h3>
                  <p className="text-xs text-gray-400">{cp.paper?.publicationYear}</p>
                </div>
                <button onClick={() => handleRemovePaper(cp.paperId)} className="text-gray-300 hover:text-rose-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Collections</h1>
          <p className="text-sm text-gray-500">Organize papers into curated lists</p>
        </div>
        <Button color="violet" onClick={() => setCreateModal(true)}><Plus size={15} /> New Collection</Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-28 skeleton rounded-2xl" />)}</div>
      ) : !collections?.length ? (
        <EmptyState icon={Bookmark} title="No collections" description="Create collections to organize your papers" action="New Collection" onAction={() => setCreateModal(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((c) => (
            <Card key={c.id} accentColor="violet" className="p-5 cursor-pointer hover:shadow-md" onClick={() => handleOpen(c)}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center">
                  <Bookmark size={16} className="text-violet-600" />
                </div>
                <div className="flex items-center gap-2">
                  <Badge label={`${c._count?.papers || 0} papers`} color="violet" />
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteCollection(c.id); }} className="text-gray-300 hover:text-rose-500">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-gray-900">{c.name}</h3>
              {c.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{c.description}</p>}
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="New Collection">
        <div className="space-y-4">
          <Input label="Name" value={colName} onChange={(e) => setColName(e.target.value)} placeholder="e.g. Core References" />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setCreateModal(false)}>Cancel</Button>
            <Button color="violet" onClick={handleCreate}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
