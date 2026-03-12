import Modal from './Modal'
import Button from './Button'
export default function ConfirmDialog({ isOpen, onClose, onConfirm, title='Are you sure?', message='This action cannot be undone.', loading=false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-slate-600 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>Delete</Button>
      </div>
    </Modal>
  )
}
