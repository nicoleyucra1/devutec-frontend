import PropTypes from 'prop-types'
import { formatBudget, formatDate } from '../../utils/format'
import { closedForNonPayment, emergencyFundForStudent, refundedToClient, studentReceived } from '../../utils/installments'

// Contrato cerrado porque el cliente no hizo el pago 2 a tiempo: qué recibió cada uno, en vez de un "Cancelado"
// genérico. Lo aprobado y la bolsa de emergencia son del estudiante; lo que no se usó volvió al cliente.
export default function ClosedForNonPaymentCard({ contract, isClient }) {
  if (!closedForNonPayment(contract)) return null

  const freelancer = contract.freelancerName?.split(' ')[0] ?? 'el estudiante'
  const client = contract.clientName?.split(' ')[0] ?? 'el cliente'
  const approved = (contract.stages ?? []).filter((stage) => stage.status === 'APPROVED').map((stage) => stage.name)
  const received = studentReceived(contract)
  const fund = emergencyFundForStudent(contract)
  const refunded = refundedToClient(contract)
  const rows = isClient
    ? [
        ['Etapas aprobadas', approved.join(', ') || 'Ninguna'],
        [`${freelancer} recibe`, `${formatBudget(received)} (incluye la bolsa de emergencia)`],
        ['Se te devolvió', formatBudget(refunded)],
      ]
    : [
        ['Etapas aprobadas', approved.join(', ') || 'Ninguna'],
        ['Recibes en total', formatBudget(received)],
        ['Incluye la bolsa de emergencia', formatBudget(fund)],
      ]

  return (
    <article role="status" className="rounded-2xl border border-pending/40 bg-pending-light p-6 text-pending sm:p-[30px]">
      <p className="text-[10px] font-semibold tracking-[0.13em]">CONTRATO CERRADO</p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">
        {isClient ? 'Se cerró porque no se hizo el pago 2.' : `${client} no hizo el pago 2: tu trabajo queda pagado.`}
      </h2>
      <p className="mt-2 text-sm leading-relaxed">
        {isClient
          ? `El plazo venció${contract.closedAt ? ` el ${formatDate(contract.closedAt)}` : ''}. ${freelancer} se queda con las etapas que aprobaste y con la bolsa de emergencia por el trabajo hecho. Lo que no se usó se te devolvió y las etapas que faltaban se cancelaron.`
          : `El plazo venció${contract.closedAt ? ` el ${formatDate(contract.closedAt)}` : ''}. Te quedas con lo que ya aprobó y, además, recibes la bolsa de emergencia. No tienes que hacer el Desarrollo.`}
      </p>
      <dl className="mt-5 grid gap-1 rounded-xl bg-surface p-4 text-sm text-ink">
        {rows.map(([label, value]) => (
          <div key={label} className="flex flex-wrap justify-between gap-2 border-b border-line py-2 last:border-0">
            <dt className="text-muted">{label}</dt>
            <dd className="font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </article>
  )
}

ClosedForNonPaymentCard.propTypes = {
  contract: PropTypes.shape({
    closedReason: PropTypes.string,
    closedAt: PropTypes.string,
    freelancerName: PropTypes.string,
    clientName: PropTypes.string,
    stages: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string, status: PropTypes.string })),
    installments: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
  isClient: PropTypes.bool,
}
