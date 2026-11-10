import Button from '../ui/Button'
import Modal from '../ui/Modal'
import { formatBudget, formatDate } from '../../utils/format'

const shield = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    <path d="m9 12 2 2 4-5" />
  </svg>
)

// Términos del pago en garantía. Son las reglas que aplica el backend en cada contrato.
export default function TermsDialog({ open, contract, onClose }) {
  const terms = [
    `Al aceptar la postulación, el cliente pagó ${formatBudget(contract.amount)} y DevUTEC los retiene en garantía.`,
    'Nadie puede mover ese dinero mientras el trabajo está en curso.',
    'El freelancer marca el trabajo como entregado cuando lo termina.',
    'Al confirmar la entrega, el pago se libera al freelancer y el contrato queda finalizado.',
    'El cliente puede cancelar mientras no haya una entrega. El monto se le reembolsa completo y el proyecto vuelve a recibir postulaciones.',
    'Cuando el contrato se confirma, cada parte puede dejar una reseña pública de la otra.',
  ]

  return (
    <Modal open={open} title="Términos del contrato" kicker="PAGO EN GARANTÍA" icon={shield} onClose={onClose}>
      <p className="text-sm text-muted">
        {contract.projectTitle}
        {contract.deadline && ` · Fecha límite ${formatDate(contract.deadline)}`}
      </p>
      <ol className="mt-5 grid gap-3">
        {terms.map((term, index) => (
          <li key={term} className="flex gap-3 text-[13px] leading-relaxed">
            <span className="font-serif text-lg italic leading-none text-escrow">{String(index + 1).padStart(2, '0')}</span>
            {term}
          </li>
        ))}
      </ol>
      <div className="mt-7 flex justify-end">
        <Button variant="secondary" onClick={onClose}>
          Entendido
        </Button>
      </div>
    </Modal>
  )
}
