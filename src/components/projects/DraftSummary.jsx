import PropTypes from 'prop-types'
import { useId, useState } from 'react'
import Button from '../ui/Button'
import { formatBudget, formatDate } from '../../utils/format'
import { formatRate, splitClientTotal, splitInstallments } from '../../utils/commission'

const SOURCE_LABELS = {
  SIMILAR_PROJECTS: 'Proyectos parecidos',
  CATEGORY: 'Proyectos terminados en DEVUTEC',
  HOURS: 'Estimación por horas',
}

// El total del rango sugerido se redondea a decenas para proponerlo como presupuesto inicial
const suggestedTotal = (estimate) => Math.round((Number(estimate.clientMin) + Number(estimate.clientMax)) / 20) * 10

// Tarjeta con el proyecto que armó el asistente: precio sugerido (con de dónde sale), presupuesto con la comisión
// adentro y plan de pagos por etapas. Las habilidades NO se muestran: son para los estudiantes.
export default function DraftSummary({ draft, onContinue, onKeepChatting }) {
  const id = useId()
  const { estimate } = draft
  const rate = Number(draft.commissionRate ?? 0.1)
  const [total, setTotal] = useState(() => String(draft.budget?.clientTotal ?? suggestedTotal(estimate)))
  const [showHow, setShowHow] = useState(false)
  const split = splitClientTotal(total, rate)
  const valid = split.clientTotal >= 50

  // Los textos (cuándo se paga y qué cubre) vienen del backend; los montos se recalculan con el presupuesto escrito
  const payments = splitInstallments(split, draft.payments?.length === 2 ? draft.payments : undefined)

  return (
    <section aria-labelledby={`${id}-title`} className="chat-msg-in rounded-[17px] border border-line bg-surface">
      <div className="border-b border-line p-[22px] md:p-7">
        <p className="text-[11px] font-semibold tracking-[0.13em] text-escrow">TU PROYECTO</p>
        <h2 id={`${id}-title`} className="mt-1.5 text-2xl font-semibold tracking-[-0.02em]">
          {draft.title}
        </h2>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted">{draft.description}</p>
        <p className="mt-3 text-xs text-muted">
          Entrega sugerida: <strong className="text-ink">{formatDate(draft.deadline)}</strong>
        </p>
      </div>

      <div className="grid gap-5 border-b border-line p-[22px] md:p-7">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.13em] text-muted">PRECIO SUGERIDO</p>
          <p className="mt-1 text-[28px] font-semibold tracking-[-0.02em] tabular-nums">
            {formatBudget(estimate.clientMin)} – {formatBudget(estimate.clientMax)}
          </p>
          <p className="text-xs text-muted">
            Total con la tarifa de DEVUTEC · {estimate.weeksMin === estimate.weeksMax ? estimate.weeksMin : `${estimate.weeksMin} a ${estimate.weeksMax}`}{' '}
            semanas
          </p>
          <p className="mt-2 text-sm leading-relaxed">{estimate.explanation}</p>
          <button
            type="button"
            onClick={() => setShowHow((value) => !value)}
            aria-expanded={showHow}
            aria-controls={`${id}-how`}
            className="mt-2 text-xs font-semibold text-escrow underline underline-offset-2"
          >
            ¿Cómo calculamos esto?
          </button>
          {showHow && (
            <div id={`${id}-how`} className="mt-3 rounded-xl bg-paper p-4 text-xs">
              <p className="mb-2 font-semibold">Fuente: {SOURCE_LABELS[estimate.source] ?? estimate.source}</p>
              <ul className="grid gap-1.5">
                {estimate.features.map((feature) => (
                  <li key={feature.code} className="flex justify-between gap-3">
                    <span>
                      {feature.quantity > 1 ? `${feature.quantity} × ` : ''}
                      {feature.name}
                    </span>
                    <span className="tabular-nums text-muted">
                      {feature.hoursMin}–{feature.hoursMax} h
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 border-t border-line pt-2">
                Total {estimate.hoursMin}–{estimate.hoursMax} h × {formatBudget(estimate.hourlyRate)} por hora (tarifa promedio de
                nuestros estudiantes) + {formatRate(rate)} de tarifa DEVUTEC.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor={`${id}-total`} className="text-xs font-medium">
            ¿Cuánto quieres invertir en total?
          </label>
          <div className="flex min-h-12 items-center overflow-hidden rounded-[10px] border border-gray-300 bg-surface focus-within:border-ink focus-within:ring-[3px] focus-within:ring-ink/5">
            <span className="flex h-12 items-center border-r border-line bg-paper px-3 text-sm text-muted">S/</span>
            <input
              id={`${id}-total`}
              type="number"
              inputMode="decimal"
              min={50}
              step="10"
              value={total}
              onChange={(event) => setTotal(event.target.value)}
              className="h-12 w-full min-w-0 bg-transparent px-3 text-sm tabular-nums outline-none"
            />
          </div>
          <div className="grid gap-1 rounded-xl bg-escrow-light p-3.5 text-sm">
            <p className="flex justify-between">
              <span>Para el estudiante</span>
              <strong className="tabular-nums">{formatBudget(split.freelancerAmount)}</strong>
            </p>
            <p className="flex justify-between text-muted">
              <span>Tarifa DEVUTEC ({formatRate(rate)})</span>
              <span className="tabular-nums">{formatBudget(split.commission)}</span>
            </p>
            <p className="mt-1 flex justify-between border-t border-escrow/20 pt-1.5 font-semibold text-escrow">
              <span>Pagas en total</span>
              <span className="tabular-nums">{formatBudget(split.clientTotal)}</span>
            </p>
            <p className="mt-1 text-xs text-muted">La tarifa cubre la garantía de tu pago, la verificación de los estudiantes y el soporte.</p>
          </div>
        </div>
      </div>

      <div className="border-b border-line p-[22px] md:p-7">
        <p className="text-[11px] font-semibold tracking-[0.13em] text-muted">PLAN DE PAGOS</p>
        <p className="mt-1 text-xs text-muted">
          Pagas en dos partes. El dinero queda en garantía y cada etapa se libera recién cuando la apruebas.
        </p>
        <ol className="mt-3 grid gap-2.5">
          {payments.map((payment) => (
            <li key={payment.number} className="rounded-xl border border-line p-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-semibold">
                  Pago {payment.number} <span className="ml-1 text-xs font-normal text-muted">{payment.percent} %</span>
                </p>
                <p className="text-lg font-semibold tabular-nums">{formatBudget(payment.clientAmount)}</p>
              </div>
              <p className="mt-0.5 text-xs text-muted">{payment.dueAt}</p>
              <ul className="mt-2.5 flex flex-wrap gap-1.5">
                {payment.covers.map((item) => (
                  <li
                    key={item}
                    className={`rounded-full px-2.5 py-1 text-[11px] ${item.startsWith('Bolsa') ? 'bg-pending-light text-pending' : 'bg-paper'}`}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
        <p className="mt-3 rounded-xl bg-pending-light p-3 text-xs leading-relaxed text-pending">
          <strong>Bolsa de emergencia:</strong> es parte de la Entrega final pagada por adelantado. Si el proyecto se detiene, con ella se
          le paga al estudiante lo que ya entregó; si todo va bien, se usa en la Entrega final.
        </p>
        <p className="mt-4 text-[11px] font-semibold tracking-[0.13em] text-muted">ETAPAS DEL TRABAJO</p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {draft.stages.map((stage) => (
            <li key={stage.name} className="rounded-full border border-line px-3 py-1 text-xs">
              {stage.name} <span className="text-muted">{stage.percent} %</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col-reverse gap-2 p-[22px] sm:flex-row sm:justify-end md:px-7">
        <Button variant="ghost" onClick={onKeepChatting} className="w-full sm:w-auto">
          Seguir conversando
        </Button>
        <Button disabled={!valid} onClick={() => onContinue({ ...draft, budgetTotal: split.clientTotal })} className="w-full sm:w-auto">
          Revisar y publicar
        </Button>
      </div>
    </section>
  )
}

const moneyType = PropTypes.oneOfType([PropTypes.number, PropTypes.string])

DraftSummary.propTypes = {
  draft: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    deadline: PropTypes.string,
    commissionRate: moneyType,
    budget: PropTypes.shape({ clientTotal: moneyType }),
    estimate: PropTypes.shape({
      source: PropTypes.string,
      explanation: PropTypes.string,
      hoursMin: PropTypes.number,
      hoursMax: PropTypes.number,
      hourlyRate: moneyType,
      clientMin: moneyType,
      clientMax: moneyType,
      weeksMin: PropTypes.number,
      weeksMax: PropTypes.number,
      features: PropTypes.arrayOf(
        PropTypes.shape({
          code: PropTypes.string.isRequired,
          name: PropTypes.string,
          quantity: PropTypes.number,
          hoursMin: PropTypes.number,
          hoursMax: PropTypes.number,
        }),
      ),
    }).isRequired,
    stages: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string.isRequired, percent: PropTypes.number.isRequired })).isRequired,
    // Pago en dos partes: textos de cuándo se paga y qué cubre (los montos se recalculan en pantalla)
    payments: PropTypes.arrayOf(
      PropTypes.shape({
        number: PropTypes.number.isRequired,
        percent: PropTypes.number.isRequired,
        dueAt: PropTypes.string,
        covers: PropTypes.arrayOf(PropTypes.string),
      }),
    ),
  }).isRequired,
  onContinue: PropTypes.func.isRequired,
  onKeepChatting: PropTypes.func.isRequired,
}
