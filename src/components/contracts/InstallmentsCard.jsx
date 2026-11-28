import PropTypes from 'prop-types'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { formatBudget, formatDate } from '../../utils/format'
import { beforeDue, closedForNonPayment, emergencyFundForStudent, secondPaymentDue } from '../../utils/installments'

// Estado de cada pago, con el lenguaje de color de la app
const STATUS = {
  PENDING: { label: 'Pendiente', color: 'yellow' },
  HELD: { label: 'En garantía', color: 'blue' },
  RELEASED: { label: 'Liberado', color: 'green' },
  REFUNDED: { label: 'Devuelto', color: 'gray' },
}

// Pago en dos partes: cada pago con su desglose (lo del estudiante + la comisión de DEVUTEC),
// su estado y, para el cliente, el botón de pagar el que toca. El estudiante ve cuándo puede seguir trabajando.
export default function InstallmentsCard({ contract, isClient, onPay, paying }) {
  const installments = contract.installments ?? []
  if (installments.length === 0) return null

  const freelancer = contract.freelancerName?.split(' ')[0] ?? 'el estudiante'
  const open = contract.status === 'IN_PROGRESS' || contract.status === 'DELIVERED'
  const next = installments.find((installment) => installment.status === 'PENDING')
  // Pago 2 con plazo: si no se paga a tiempo, el contrato se cierra solo
  const due = secondPaymentDue(contract)
  const client = contract.clientName?.split(' ')[0] ?? 'el cliente'
  const closedUnpaid = closedForNonPayment(contract)

  return (
    <article className="rounded-2xl border border-line bg-surface p-6 sm:p-[30px]">
      <p className="text-[10px] font-semibold tracking-[0.13em] text-muted">PAGO EN DOS PARTES</p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight">
        {formatBudget(contract.amount)} en {installments.length === 1 ? 'un pago' : `${installments.length} pagos`}
      </h2>
      {contract.studentAmount != null && (
        <p className="mt-2 text-sm text-muted">
          {formatBudget(contract.studentAmount)} son para {freelancer} y {formatBudget(contract.commissionAmount)} son la
          tarifa de DEVUTEC. {freelancer} no paga comisión.
        </p>
      )}

      <ol className="mt-5 grid gap-3">
        {installments.map((installment) => {
          const status =
            closedUnpaid && installment.status === 'PENDING'
              ? { label: 'No se pagó', color: 'gray' }
              : (STATUS[installment.status] ?? STATUS.PENDING)
          const isNext = open && next?.number === installment.number
          return (
            <li key={installment.number} className="rounded-xl border border-line bg-paper p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{installment.label}</p>
                  <p className="mt-1 text-xs text-muted">
                    {formatBudget(installment.studentAmount)} para {freelancer} + {formatBudget(installment.commissionAmount)} de
                    comisión
                    {Number(installment.reserveAmount) > 0 &&
                      ` · Incluye ${formatBudget(installment.reserveAmount)} de bolsa de emergencia, que se libera al final`}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-lg font-semibold tabular-nums">{formatBudget(installment.clientAmount)}</span>
                  <Badge color={status.color}>{status.label}</Badge>
                </div>
              </div>

              {Number(installment.releasedAmount) > 0 && installment.status === 'HELD' && (
                <p className="mt-2 text-xs text-escrow">
                  Ya se liberaron {formatBudget(installment.releasedAmount)} a {freelancer} por las etapas aprobadas.
                </p>
              )}
              {installment.paidAt && (
                <p className="mt-2 text-[11px] text-muted">Pagado el {formatDate(installment.paidAt)}</p>
              )}

              {isNext && isClient && installment.payableNow && (
                <div className="mt-4 grid gap-1">
                  <Button onClick={() => onPay(installment.number)} loading={paying} variant="lime" className="w-full">
                    {paying ? 'Abriendo Stripe...' : `Pagar ${formatBudget(installment.clientAmount)}`}
                  </Button>
                  <p className="text-center text-[11px] text-muted">
                    Tu dinero queda en garantía y se libera solo cuando apruebas cada etapa.
                  </p>
                </div>
              )}
              {isNext && isClient && installment.payableNow && installment.number === 2 && due && (
                <p className="mt-3 rounded-lg bg-pending-light px-3 py-2 text-xs leading-relaxed text-pending">
                  <strong className="font-semibold">Paga {beforeDue(due)}</strong> para que {freelancer} siga con el
                  Desarrollo. Si no pagas, el contrato se cierra: {freelancer} se queda con lo aprobado y la bolsa de emergencia,
                  y se te devuelve lo que no se usó.
                </p>
              )}
              {isNext && !installment.payableNow && (
                <p className="mt-3 text-xs text-pending">
                  {isClient
                    ? 'Se habilita cuando apruebes el Diseño.'
                    : `${contract.clientName ?? 'El cliente'} hará este pago cuando apruebe el Diseño. No empieces el Desarrollo hasta entonces.`}
                </p>
              )}
              {isNext && installment.payableNow && !isClient && (
                <p className="mt-3 text-xs leading-relaxed text-pending">
                  Esperando este pago de {contract.clientName ?? 'el cliente'}. Podrás entregar cuando lo haga.
                  {installment.number === 2 && due && (
                    <>
                      {' '}
                      <strong className="font-semibold">Si {client} no paga {beforeDue(due)}</strong>, el contrato se
                      cierra y recibes la bolsa de emergencia ({formatBudget(emergencyFundForStudent(contract))}) además de lo
                      aprobado.
                    </>
                  )}
                </p>
              )}
            </li>
          )
        })}
      </ol>
    </article>
  )
}

InstallmentsCard.propTypes = {
  contract: PropTypes.shape({
    amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    status: PropTypes.string,
    freelancerName: PropTypes.string,
    clientName: PropTypes.string,
    studentAmount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    commissionAmount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    secondPaymentDueAt: PropTypes.string,
    closedReason: PropTypes.string,
    installments: PropTypes.arrayOf(
      PropTypes.shape({
        number: PropTypes.number,
        label: PropTypes.string,
        clientAmount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        studentAmount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        commissionAmount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        reserveAmount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        releasedAmount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        status: PropTypes.string,
        payableNow: PropTypes.bool,
        paidAt: PropTypes.string,
        dueAt: PropTypes.string,
      }),
    ),
  }).isRequired,
  isClient: PropTypes.bool,
  onPay: PropTypes.func.isRequired,
  paying: PropTypes.bool,
}
