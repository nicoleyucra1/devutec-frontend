import { formatDate } from '../../utils/format'

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 12 4 4L19 6" />
    </svg>
  )
}

// Los 4 pasos del pago en garantía según el estado del contrato. Cada paso queda hecho, actual o pendiente.
function stepsFor(contract) {
  const started = formatDate(contract.startedAt)
  const delivered = contract.deliveredAt ? formatDate(contract.deliveredAt) : null

  if (contract.status === 'CANCELLED') {
    return [
      { title: 'Pago retenido', detail: started, state: 'done' },
      { title: 'Trabajo en curso', detail: delivered ? `Entregado el ${delivered}` : 'Sin entrega', state: 'done' },
      { title: 'Contrato cancelado', detail: 'Por el cliente', state: 'cancelled' },
      { title: 'Pago reembolsado', detail: 'Vuelve al cliente', state: 'done' },
    ]
  }

  const reached = { IN_PROGRESS: 1, DELIVERED: 2, CONFIRMED: 4 }[contract.status] ?? 1
  const stateOf = (index) => (index < reached ? 'done' : index === reached ? 'current' : 'todo')
  return [
    { title: 'Pago retenido', detail: started, state: 'done' },
    {
      title: 'Trabajo entregado',
      detail: delivered ?? (contract.deadline ? `Vence el ${formatDate(contract.deadline)}` : 'Pendiente'),
      state: stateOf(1),
    },
    { title: 'Entrega confirmada', detail: contract.status === 'CONFIRMED' ? 'Aprobada por el cliente' : 'Cuando el cliente revise', state: stateOf(2) },
    { title: 'Pago liberado', detail: contract.status === 'CONFIRMED' ? 'Enviado al freelancer' : 'Al confirmar', state: stateOf(3) },
  ]
}

const CIRCLE = {
  done: 'border-escrow bg-escrow text-white',
  cancelled: 'border-error bg-error text-white',
  current: 'border-ink bg-surface text-ink ring-4 ring-ink/10',
  todo: 'border-line bg-surface text-muted',
}

// Línea de tiempo del contrato: en pantallas chicas va de arriba hacia abajo y en grandes de izquierda a derecha
export default function ContractTimeline({ contract }) {
  const steps = stepsFor(contract)
  return (
    <ol className="grid gap-5 md:grid-cols-4 md:gap-3">
      {steps.map((step, index) => (
        <li
          key={step.title}
          aria-current={step.state === 'current' ? 'step' : undefined}
          className="relative flex gap-3 md:flex-col md:gap-3"
        >
          {index < steps.length - 1 && (
            <span
              aria-hidden="true"
              className={`absolute left-[15px] top-8 h-[calc(100%_-_12px)] w-px md:left-8 md:top-[15px] md:h-px md:w-[calc(100%_-_20px)] ${
                step.state === 'done' || step.state === 'cancelled' ? 'bg-escrow' : 'bg-line'
              }`}
            />
          )}
          <i
            className={`relative z-[1] grid h-[31px] w-[31px] shrink-0 place-items-center rounded-full border text-[11px] font-semibold not-italic transition-colors duration-300 ${CIRCLE[step.state]}`}
          >
            {step.state === 'done' || step.state === 'cancelled' ? <CheckIcon /> : index + 1}
          </i>
          <span className="flex flex-col gap-1">
            <strong className="text-[13px] font-semibold">{step.title}</strong>
            <small className="text-[11px] text-muted">{step.detail}</small>
          </span>
        </li>
      ))}
    </ol>
  )
}
