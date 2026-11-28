import PropTypes from 'prop-types'
import Skeleton from '../ui/Skeleton'
import { formatBudget } from '../../utils/format'

// Copiloto "Antes de postular": horas que suele tomar el proyecto, cuánto cobrar y lo que se suele olvidar.
// Los números los calcula el backend con la tabla de horas y los proyectos terminados (no usa IA).
export default function CopilotCard({ estimate, loading, error }) {
  if (loading) {
    return (
      <div className="grid gap-2 rounded-[12px] border border-line bg-paper p-4" aria-busy="true">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-16 w-full" />
      </div>
    )
  }

  // Si el copiloto no carga, se puede postular igual: solo no se muestra la ayuda
  if (error || !estimate) return null

  const { estimate: info, myHourlyRate, myMin, myMax, commonlyForgotten } = estimate
  const weeks = info.weeksMin === info.weeksMax ? `${info.weeksMin}` : `${info.weeksMin} a ${info.weeksMax}`

  return (
    <details open className="group rounded-[12px] border border-line bg-paper p-4 text-xs">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2">
        <span className="text-[11px] font-semibold tracking-[0.13em]">ANTES DE POSTULAR · COPILOTO</span>
        <span className="text-muted transition-transform group-open:rotate-180" aria-hidden="true">
          ▾
        </span>
      </summary>

      <dl className="mt-4 grid gap-3">
        <div>
          <dt className="text-muted">Horas que suele tomar</dt>
          <dd className="mt-0.5 text-[15px] font-semibold tabular-nums">
            {info.hoursMin} a {info.hoursMax} horas · {weeks} {info.weeksMax === 1 ? 'semana' : 'semanas'}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Precio sugerido (lo que paga el cliente)</dt>
          <dd className="mt-0.5 text-[15px] font-semibold tabular-nums">
            {formatBudget(info.clientMin)} a {formatBudget(info.clientMax)}
          </dd>
          <dd className="mt-0.5 text-muted">
            Tú recibirías {formatBudget(info.freelancerMin)} a {formatBudget(info.freelancerMax)}.
          </dd>
        </div>
        <div>
          <dt className="text-muted">Con tu tarifa por hora</dt>
          <dd className="mt-0.5 font-medium tabular-nums">
            {myHourlyRate
              ? `S/ ${Number(myHourlyRate)} × ${info.hoursMin}–${info.hoursMax} h = ${formatBudget(myMin)} a ${formatBudget(myMax)} para ti`
              : 'Agrega tu tarifa por hora en tu perfil para calcular cuánto cobrarías tú.'}
          </dd>
        </div>
      </dl>

      <p className="mt-3 leading-relaxed text-muted">{info.explanation}</p>

      {info.stages?.length > 0 && (
        <>
          <p className="mt-4 font-medium">Horas por etapa</p>
          <ul className="mt-2 grid gap-1">
            {info.stages.map((stage) => (
              <li key={stage.name} className="flex justify-between gap-2 tabular-nums">
                <span>
                  {stage.name} <span className="text-muted">{stage.percent} %</span>
                </span>
                <span className="text-muted">
                  {stage.hoursMin}–{stage.hoursMax} h
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      {commonlyForgotten?.length > 0 && (
        <>
          <p className="mt-4 font-medium">Lo que se suele olvidar</p>
          <ul className="mt-2 grid list-disc gap-1.5 pl-4 leading-relaxed text-muted">
            {commonlyForgotten.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </>
      )}
    </details>
  )
}

const money = PropTypes.oneOfType([PropTypes.number, PropTypes.string])

CopilotCard.propTypes = {
  estimate: PropTypes.shape({
    estimate: PropTypes.shape({
      explanation: PropTypes.string,
      hoursMin: PropTypes.number,
      hoursMax: PropTypes.number,
      weeksMin: PropTypes.number,
      weeksMax: PropTypes.number,
      freelancerMin: money,
      freelancerMax: money,
      clientMin: money,
      clientMax: money,
      stages: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string,
          percent: PropTypes.number,
          hoursMin: PropTypes.number,
          hoursMax: PropTypes.number,
        }),
      ),
    }),
    myHourlyRate: money,
    myMin: money,
    myMax: money,
    underestimateBelow: money,
    commonlyForgotten: PropTypes.arrayOf(PropTypes.string),
  }),
  loading: PropTypes.bool,
  error: PropTypes.string,
}
