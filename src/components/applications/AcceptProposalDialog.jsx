import PropTypes from 'prop-types'
import { useState } from 'react'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import { formatBudget } from '../../utils/format'
import { applicationShape, projectShape } from '../../utils/propShapes'

const shield = (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    <path d="m9 12 2 2 4-5" />
  </svg>
)

// El contenido va aparte para que la casilla vuelva a empezar sin marcar cada vez que se abre
function AcceptBody({ application, project, otherPending, busy, onConfirm, onClose }) {
  const [checked, setChecked] = useState(false)
  const total = Number(application.proposedPrice) || 0
  const price = formatBudget(total)
  const firstName = application.freelancerName?.split(' ')[0] ?? 'el freelancer'
  // Mismo cálculo que el backend: la comisión de DEVUTEC (10 %) ya está dentro del total y el estudiante recibe total ÷ 1,10.
  // El pago se hace en dos partes iguales (el backend no divide montos menores a S/ 20)
  const split = total >= 20
  const student = Math.round((total / 1.1) * 100) / 100
  const rows = [
    ['Proyecto', project.title],
    ['Freelancer', application.freelancerName],
    ['Total del contrato', price],
    [`Para ${firstName}`, formatBudget(student)],
    ['Tarifa de DEVUTEC', formatBudget(total - student)],
    ...(split ? [['Pago 1, al empezar', formatBudget(Math.round((total / 2) * 100) / 100)]] : []),
  ]

  return (
    <>
      <p className="text-[13px] leading-relaxed text-muted">
        {split ? (
          <>
            Al aceptar se crea el contrato. Pagas en dos partes: el <strong className="text-ink">pago 1</strong> para que {firstName}{' '}
            empiece y el <strong className="text-ink">pago 2</strong> cuando apruebes el Diseño. Cada pago queda en garantía y se libera
            a medida que apruebas las etapas.
          </>
        ) : (
          <>
            Para iniciar el contrato, <strong className="text-ink">{price}</strong> quedarán retenidos en garantía. El dinero solo se
            libera cuando apruebes la entrega.
          </>
        )}
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
          {busy ? 'Creando el contrato…' : split ? `Contratar a ${firstName}` : `Retener ${price} y contratar`}
        </Button>
        <Button variant="ghost" onClick={onClose} disabled={busy} className="w-full">
          Seguir comparando
        </Button>
      </div>
    </>
  )
}

AcceptBody.propTypes = {
  application: applicationShape.isRequired,
  project: projectShape.isRequired,
  otherPending: PropTypes.number.isRequired,
  busy: PropTypes.bool,
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
}

// Confirmación antes de aceptar una propuesta: aceptar crea el contrato; el cobro se hace después, en el contrato (pago 1 y pago 2)
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

AcceptProposalDialog.propTypes = {
  // null mientras no se eligió a quién aceptar (la ventana está cerrada)
  application: applicationShape,
  project: projectShape,
  otherPending: PropTypes.number.isRequired,
  busy: PropTypes.bool,
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
}
