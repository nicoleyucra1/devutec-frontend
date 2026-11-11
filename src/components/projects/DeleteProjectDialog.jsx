import Button from '../ui/Button'
import Modal from '../ui/Modal'
import ButtonLink from './ButtonLink'
import { CONTRACT_STATUS, contractCode, PAYMENT_STATUS } from '../../utils/contractStatus'
import { formatBudget } from '../../utils/format'

const briefcase = (
  <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" />
  </svg>
)

const lock = (
  <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="10" width="16" height="11" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
)

// Confirmación para eliminar un proyecto de Mis proyectos. Si no se puede eliminar, muestra el contrato que lo impide.
// conflict es el mensaje del 409 cuando el backend lo rechaza aunque la web creía que se podía.
export default function DeleteProjectDialog({ project, contract, busy, conflict, onConfirm, onClose }) {
  if (!project) return null

  // El backend solo deja eliminar un proyecto abierto y sin contratos (aunque el contrato esté cancelado)
  const blocked = Boolean(conflict) || project.status !== 'OPEN' || Boolean(contract)

  if (blocked) {
    const status = contract && CONTRACT_STATUS[contract.status]
    const payment = contract && PAYMENT_STATUS[contract.paymentStatus]
    return (
      <Modal
        open
        onClose={onClose}
        icon={lock}
        iconTone="red"
        kicker="NO SE PUEDE ELIMINAR"
        title={contract ? 'Este proyecto tiene un contrato asociado.' : 'Este proyecto ya no está abierto.'}
      >
        <p className="text-[13px] leading-relaxed text-muted">
          {conflict ??
            (contract
              ? 'No se puede eliminar un proyecto con contratos. El contrato y su historial de pago se tienen que conservar.'
              : 'Solo se pueden eliminar los proyectos abiertos que todavía no tienen un contrato.')}
        </p>
        {contract && (
          <div className="my-5 flex items-center gap-3 rounded-[10px] border border-line p-3.5">
            <span className="rounded-md bg-paper px-2 py-1.5 font-mono text-[10px]">{contractCode(contract.id)}</span>
            <div className="min-w-0">
              <strong className="block truncate text-[13px]">{contract.projectTitle}</strong>
              <small className="text-[11px] text-muted">
                Contrato {status?.label.toLowerCase() ?? contract.status} · {formatBudget(contract.amount)}{' '}
                {payment?.label.toLowerCase() ?? ''}
              </small>
            </div>
          </div>
        )}
        <div className="mt-6 grid gap-2">
          <Button onClick={onClose} className="w-full">
            Entendido
          </Button>
          {contract && (
            <ButtonLink to={`/contracts/${contract.id}`} variant="ghost" className="w-full">
              Ver contrato asociado
            </ButtonLink>
          )}
        </div>
      </Modal>
    )
  }

  const applications = project.applications?.length ?? 0
  return (
    <Modal
      open
      onClose={busy ? undefined : onClose}
      icon={briefcase}
      kicker="ELIMINAR PROYECTO"
      title={`¿Eliminar “${project.title}”?`}
    >
      <p className="text-[13px] leading-relaxed text-muted">
        {applications > 0
          ? `Se eliminarán la publicación y ${applications === 1 ? 'su postulación' : `sus ${applications} postulaciones`}. `
          : 'Se eliminará la publicación. '}
        Esta acción no se puede deshacer.
      </p>
      <div className="mt-6 grid gap-2">
        <Button variant="danger" onClick={onConfirm} loading={busy} className="w-full">
          {busy ? 'Eliminando…' : 'Sí, eliminar proyecto'}
        </Button>
        <Button variant="ghost" onClick={onClose} disabled={busy} className="w-full">
          Cancelar
        </Button>
      </div>
    </Modal>
  )
}
