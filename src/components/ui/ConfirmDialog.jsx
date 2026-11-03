import Button from './Button'
import Modal from './Modal'

//Pide confirmación antes de una acción que no se puede deshacer, como cancelar un contrato
export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirmar', busy = false, onConfirm, onCancel }) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="text-sm text-gray-600">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={busy}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={busy}>
          {busy ? 'Procesando...' : confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}

