import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import Cuyi from '../brand/Cuyi'
import Button from '../ui/Button'
import { contractService } from '../../services/contractService'
import { errorMessage } from '../../utils/errorMessage'

// Los mensajes propios del backend (Cuyi no pudo responder, etapa cancelada...) se muestran tal cual
function guideError(err) {
  const apiMessage = err?.response?.data?.message
  if (apiMessage && [409, 502, 503].includes(err?.response?.status)) return apiMessage
  return errorMessage(err)
}

const SCHEDULE_STYLE = {
  ON_TIME: 'bg-escrow-light text-escrow',
  BEHIND: 'bg-pending-light text-pending',
  NO_DATE: 'bg-soft text-muted',
}

// Mini guía de la etapa en curso, para el estudiante: qué hacer (checklist con horas), qué preguntarle al
// cliente, riesgos, un consejo, el avance vs. las horas y si lo que cobra está bien para esas horas.
export default function StageGuideCard({ contractId, stage, clientName }) {
  const [state, setState] = useState({ loading: true, guide: null, error: null })
  const [attempt, setAttempt] = useState(0)
  const [saving, setSaving] = useState(null)
  const client = clientName?.split(' ')[0] ?? 'el cliente'

  useEffect(() => {
    let active = true
    contractService
      .getStageGuide(contractId, stage.id)
      .then((guide) => active && setState({ loading: false, guide, error: null }))
      .catch((err) => active && setState({ loading: false, guide: null, error: guideError(err) }))
    return () => {
      active = false
    }
  }, [contractId, stage.id, attempt])

  const retry = () => {
    setState({ loading: true, guide: null, error: null })
    setAttempt((n) => n + 1)
  }

  const toggleTask = async (task) => {
    setSaving(task.id)
    try {
      const guide = await contractService.updateGuideTask(contractId, stage.id, task.id, !task.done)
      setState((prev) => ({ ...prev, guide }))
    } catch (err) {
      setState((prev) => ({ ...prev, error: guideError(err) }))
    } finally {
      setSaving(null)
    }
  }

  const { guide } = state
  const progress = guide?.progress

  return (
    <article className="rounded-2xl border border-line bg-surface p-6 sm:p-[30px]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-lime">
            <Cuyi anim={state.loading ? 'escribe' : 'saluda'} px={2} />
          </span>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.13em] text-escrow">MINI GUÍA DE LA ETAPA</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">{stage.name}</h2>
          </div>
        </div>
        {progress && (
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${SCHEDULE_STYLE[progress.schedule] ?? SCHEDULE_STYLE.NO_DATE}`}>
            {progress.label}
          </span>
        )}
      </div>

      {state.loading && (
        <div className="mt-5 grid gap-2" aria-live="polite">
          <p className="text-sm text-muted">Cuyi está armando tu plan para esta etapa...</p>
          <span className="h-3 w-4/5 animate-pulse rounded bg-soft" />
          <span className="h-3 w-3/5 animate-pulse rounded bg-soft" />
        </div>
      )}

      {state.error && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-paper px-4 py-3 text-sm">
          <span className="text-muted">{state.error}</span>
          {!guide && (
            <Button variant="secondary" onClick={retry}>
              Intentar de nuevo
            </Button>
          )}
        </div>
      )}

      {guide && (
        <>
          <div className="mt-5" aria-hidden="true">
            <div className="h-2 overflow-hidden rounded-full bg-soft">
              <div className="h-full rounded-full bg-escrow transition-all" style={{ width: `${progress.percent}%` }} />
            </div>
            <p className="mt-2 text-xs text-muted">
              {progress.hoursDone} de {progress.hoursTotal} horas
              {progress.expectedPercent != null && ` · a hoy deberías llevar ${progress.expectedPercent} %`}
            </p>
          </div>

          <section className="mt-5">
            <h3 className="text-xs font-semibold">Qué hacer</h3>
            <ul className="mt-2 grid gap-1">
              {guide.tasks.map((task) => (
                <li key={task.id}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 text-sm transition hover:bg-paper">
                    <input
                      type="checkbox"
                      checked={task.done}
                      disabled={saving === task.id}
                      onChange={() => toggleTask(task)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-escrow"
                    />
                    <span className={`flex-1 ${task.done ? 'text-muted line-through' : ''}`}>{task.title}</span>
                    <span className="shrink-0 text-xs tabular-nums text-muted">{task.hours} h</span>
                  </label>
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {guide.clientQuestions.length > 0 && (
              <section className="rounded-xl bg-paper px-4 py-3">
                <h3 className="text-xs font-semibold">Pregúntale a {client}</h3>
                <ul className="mt-2 grid gap-1.5 text-[13px] leading-snug">
                  {guide.clientQuestions.map((question) => (
                    <li key={question}>«{question}»</li>
                  ))}
                </ul>
              </section>
            )}
            {guide.risks.length > 0 && (
              <section className="rounded-xl bg-paper px-4 py-3">
                <h3 className="text-xs font-semibold">Ojo con esto</h3>
                <ul className="mt-2 grid gap-1.5 text-[13px] leading-snug">
                  {guide.risks.map((risk) => (
                    <li key={risk}>{risk}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {guide.tip && (
            <p className="mt-4 rounded-xl bg-escrow-light px-4 py-3 text-[13px] leading-snug text-escrow">
              <strong>Consejo:</strong> {guide.tip}
            </p>
          )}

          {guide.priceCheck && (
            <p
              className={`mt-3 rounded-xl px-4 py-3 text-[13px] leading-snug ${
                guide.priceCheck.low ? 'bg-pending-light text-pending' : 'bg-paper text-muted'
              }`}
            >
              {guide.priceCheck.message}
            </p>
          )}
        </>
      )}
    </article>
  )
}

StageGuideCard.propTypes = {
  contractId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  stage: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  clientName: PropTypes.string,
}
