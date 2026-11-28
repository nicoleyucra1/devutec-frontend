import PropTypes from 'prop-types'
import Badge from '../ui/Badge'
import { STAGE_STATUS } from '../../utils/contractStatus'
import { formatBudget, formatDate } from '../../utils/format'

// Etapas del contrato: el trabajo avanza Descubrimiento → Diseño → Desarrollo → Entrega final.
// Cada etapa se entrega y el cliente la aprueba (se libera su parte) o pide cambios (máximo 2 rondas).
// Arriba, cuánto suman las etapas aprobadas (montos del cliente, con la comisión; lo que recibe el estudiante
// está en la tarjeta del pago en dos partes), con la bolsa de emergencia aparte.
export default function StagesCard({ contract, isClient }) {
  const stages = contract.stages ?? []
  // Contratos de antes de las etapas: tienen una sola etapa del 100 %, no hace falta la lista
  if (stages.length <= 1) return null

  const released = Number(contract.releasedAmount ?? 0)
  const fund = Number(contract.emergencyFund ?? 0)
  const finished = contract.status === 'CONFIRMED'
  const freelancer = contract.freelancerName?.split(' ')[0] ?? 'el estudiante'

  return (
    <article className="min-w-0 rounded-2xl border border-line bg-surface p-6 sm:p-[30px]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.13em] text-muted">ETAPAS DEL TRABAJO</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            {finished ? 'Todas las etapas aprobadas' : 'Pagas por avance: cada etapa se aprueba por separado'}
          </h2>
        </div>
        <div className="text-right text-xs">
          <p className="text-muted">Etapas aprobadas</p>
          <p className="text-lg font-semibold tabular-nums">
            {formatBudget(finished ? Number(contract.amount) : released)}
            <span className="text-sm font-normal text-muted"> de {formatBudget(contract.amount)}</span>
          </p>
        </div>
      </div>

      <ol className="mt-5 grid gap-2.5">
        {stages.map((stage) => {
          const status = STAGE_STATUS[stage.status] ?? STAGE_STATUS.PENDING
          const current = stage.position === contract.currentStage
          const rounds = stage.changeRounds ?? 0
          const maxRounds = stage.maxChangeRounds ?? 2
          return (
            <li
              key={stage.id ?? stage.position}
              className={`min-w-0 rounded-xl border p-4 ${current ? 'border-ink bg-surface' : 'border-line bg-paper'}`}
              aria-current={current ? 'step' : undefined}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    {stage.position}. {stage.name} <span className="ml-1 text-xs font-normal text-muted">{stage.percentage} %</span>
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {stage.dueDate ? `Para el ${formatDate(stage.dueDate)}` : 'Sin fecha'}
                    {stage.approvedAt ? ` · Aprobada el ${formatDate(stage.approvedAt)}` : ''}
                    {rounds > 0 ? ` · ${rounds} de ${maxRounds} rondas de cambios` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold tabular-nums">{formatBudget(stage.amount)}</span>
                  <Badge color={status.color}>{status.label}</Badge>
                </div>
              </div>
              {stage.status === 'CHANGES_REQUESTED' && stage.changeRequestNote && (
                <p className="mt-3 whitespace-pre-line rounded-lg bg-pending-light px-3 py-2 text-xs leading-relaxed text-pending">
                  <strong className="font-semibold">Cambios pedidos:</strong> {stage.changeRequestNote}
                </p>
              )}
              {stage.deliveryUrl && stage.status !== 'PENDING' && (
                <a
                  href={stage.deliveryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex min-w-0 max-w-full items-center gap-2 text-xs font-semibold text-escrow underline underline-offset-2"
                >
                  <span className="min-w-0 truncate">{stage.status === 'APPROVED' ? 'Entrega aprobada' : 'Última entrega'}: {stage.deliveryUrl.replace(/^https?:\/\//, '')}</span>
                  ↗
                </a>
              )}
            </li>
          )
        })}
        {fund > 0 && (
          <li className="flex flex-wrap items-start justify-between gap-2 rounded-xl bg-pending-light p-4 text-pending">
            <div className="min-w-0">
              <p className="text-sm font-semibold">Bolsa de emergencia <span className="ml-1 text-xs font-normal">10 %</span></p>
              <p className="mt-1 text-xs leading-relaxed">
                Se paga al inicio y se libera a {freelancer} al terminar.{' '}
                {isClient ? 'Si el proyecto se detiene, con ella se le paga lo que ya entregó.' : 'Te protege si el proyecto se detiene.'}
              </p>
            </div>
            <span className="text-sm font-semibold tabular-nums">{formatBudget(fund)}</span>
          </li>
        )}
      </ol>
      <p className="mt-3 text-[11px] text-muted">Los montos son lo que paga el cliente e incluyen la tarifa de DEVUTEC.</p>
    </article>
  )
}

StagesCard.propTypes = {
  contract: PropTypes.shape({
    amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    status: PropTypes.string,
    currentStage: PropTypes.number,
    releasedAmount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    emergencyFund: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    freelancerName: PropTypes.string,
    stages: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        position: PropTypes.number,
        name: PropTypes.string,
        percentage: PropTypes.number,
        amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        status: PropTypes.string,
        dueDate: PropTypes.string,
        deliveryUrl: PropTypes.string,
        changeRounds: PropTypes.number,
        maxChangeRounds: PropTypes.number,
        changeRequestNote: PropTypes.string,
        approvedAt: PropTypes.string,
      }),
    ),
  }).isRequired,
  isClient: PropTypes.bool,
}
