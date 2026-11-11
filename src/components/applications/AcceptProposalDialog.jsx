import { useState } from 'react'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import { formatBudget } from '../../utils/format'

const shield = (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    <path d="m9 12 2 2 4-5" />
  </svg>
)

// El contenido va aparte para que la casilla vuelva a empezar sin marcar cada vez que se abre
function AcceptBody({ application, project, otherPending, busy, onConfirm, onClose }) {
  const [checked, setChecked] = useState(false)
  const price = formatBudget(application.proposedPrice)
  const rows = [
    ['Proyecto', project.title],
    ['Freelancer', application.freelancerName],
    ['Monto a retener', price],
  ]

  return (
    <>
      <p className="text-[13px] leading-relaxed text-muted">
        Para iniciar el contrato, <strong className="text-ink">{price}</strong> quedarán retenidos en garantía. El dinero solo se
        libera cuando apruebes la entrega.
        {otherPending > 0 &&
          ` ${otherPending === 1 ? 'La otra postulación pendiente se rechazará' : `Las otras ${otherPending} postulaciones pendientes se rechazarán`}.`}
      </p>
      <dl className="my-5 border-y border-line">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 py-[11px] text-xs">
            <dt className="text-muted">{label}</dt>
            <dd className="truncate text-right font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
      <label className="mb-4 flex cursor-pointer items-start gap-2.5 text-xs leading-normal text-muted">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => setChecked(event.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-escrow"
        />
        Confirmo que revisé la propuesta y el alcance del trabajo.
      </label>
      <div className="grid gap-2">
        <Button onClick={onConfirm} disabled={!checked} loading={busy} className="w-full">
          {busy ? 'Creando el contrato…' : `Retener ${price} y contratar`}
        </Button>
        <Button variant="ghost" onClick={onClose} disabled={busy} className="w-full">
          Seguir comparando
        </Button>
      </div>
    </>
  )
}

// Confirmación antes de aceptar una propuesta: aceptar crea el contrato y retiene el pago
export default function AcceptProposalDialog({ application, project, otherPending, busy, onConfirm, onClose }) {
  const open = Boolean(application && project)
  return (
    <Modal
      open={open}
      onClose={busy ? undefined : onClose}
      icon={shield}
      kicker="ACEPTAR PROPUESTA"
      title={open ? `Vas a contratar a ${application.freelancerName}` : ''}
    >
      {open && (
        <AcceptBody
          key={application.id}
          application={application}
          project={project}
          otherPending={otherPending}
          busy={busy}
          onConfirm={onConfirm}
          onClose={onClose}
        />
      )}
    </Modal>
  )
}
