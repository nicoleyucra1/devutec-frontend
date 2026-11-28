import { useEffect, useId, useState } from 'react'
import PropTypes from 'prop-types'
import Cuyi from '../brand/Cuyi'
import Button from '../ui/Button'
import { contractService } from '../../services/contractService'
import { formatDate } from '../../utils/format'
import { translationError } from './translationError'

const STATUS = {
  PASSED: { label: 'Cumple el estándar', tone: 'bg-escrow-light text-escrow', anim: 'celebra' },
  FAILED: { label: 'Todavía no cumple', tone: 'bg-pending-light text-pending', anim: 'confundido' },
  UNAVAILABLE: { label: 'No se pudo medir', tone: 'bg-soft text-muted', anim: 'confundido' },
}

// Un puntaje de 0 a 100 con su mínimo, como los círculos de PageSpeed
function ScoreRing({ score }) {
  const value = score.value ?? 0
  const color = score.passed ? 'var(--color-escrow)' : 'var(--color-pending)'
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <span
        className="grid h-16 w-16 place-items-center rounded-full"
        style={{ background: `conic-gradient(${color} ${value * 3.6}deg, var(--color-soft) 0deg)` }}
        aria-hidden="true"
      >
        <span className="grid h-[52px] w-[52px] place-items-center rounded-full bg-surface text-lg font-semibold tabular-nums">
          {value}
        </span>
      </span>
      <span className="text-xs font-semibold">{score.label}</span>
      <span className="text-[11px] text-muted">mínimo {score.minimum}</span>
      <span className="sr-only">
        {score.label}: {value} de 100, mínimo {score.minimum}. {score.passed ? 'Cumple' : 'No cumple'}.
      </span>
    </div>
  )
}

ScoreRing.propTypes = {
  score: PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.number,
    minimum: PropTypes.number.isRequired,
    passed: PropTypes.bool,
  }).isRequired,
}

// Estándar de calidad de DEVUTEC en la entrega final de un proyecto web.
// El estudiante revisa su web publicada con PageSpeed de Google: si no llega a los mínimos, no puede entregar y
// Cuyi le da las tareas para arreglarla antes de la fecha de la etapa. El cliente ve el resultado en simple.
export default function QualityCard({ contractId, stage, isClient, freelancerName }) {
  const id = useId()
  const [overview, setOverview] = useState(null)
  const [url, setUrl] = useState('')
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState(null)
  const [showIssues, setShowIssues] = useState(false)
  const firstName = freelancerName?.split(' ')[0] ?? 'El estudiante'

  useEffect(() => {
    let active = true
    contractService
      .getQuality(contractId, stage.id)
      .then((data) => {
        if (!active) return
        setOverview(data)
        if (data.last?.url) setUrl(data.last.url)
      })
      .catch(() => active && setOverview(null))
    return () => {
      active = false
    }
  }, [contractId, stage.id])

  if (!overview?.required) return null
  const last = overview.last
  const canCheck = !isClient && stage.status !== 'APPROVED' && stage.status !== 'CANCELLED'
  // El cliente solo ve la tarjeta cuando ya hay una revisión
  if (isClient && !last) return null

  const check = async (event) => {
    event.preventDefault()
    if (!url.trim()) {
      setError('Pega el link de tu web publicada')
      return
    }
    setChecking(true)
    setError(null)
    try {
      const result = await contractService.checkQuality(contractId, stage.id, url.trim())
      setOverview((prev) => ({ ...prev, last: result }))
    } catch (err) {
      setError(translationError(err))
    } finally {
      setChecking(false)
    }
  }

  const status = last ? STATUS[last.status] : null

  return (
    <article className="rounded-2xl border border-line bg-surface p-6 sm:p-[30px]">
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-lime">
          <Cuyi anim={checking ? 'escribe' : (status?.anim ?? 'saluda')} px={2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold tracking-[0.13em] text-escrow">ESTÁNDAR DE CALIDAD DEVUTEC</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            {isClient ? 'Así está tu web antes de la entrega final' : 'Revisa tu web antes de la entrega final'}
          </h2>
          {!isClient && (
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              Para entregar, tu web publicada tiene que cumplir los mínimos de velocidad, accesibilidad, buenas prácticas y SEO
              en celular, y usar HTTPS.
              {stage.dueDate && ` Tienes hasta el ${formatDate(stage.dueDate)}.`}
            </p>
          )}
        </div>
        {status && (
          <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${status.tone}`}>{status.label}</span>
        )}
      </div>

      {canCheck && (
        <form onSubmit={check} noValidate className="mt-5 flex flex-col gap-2 sm:flex-row">
          <label htmlFor={`${id}-url`} className="sr-only">
            Link de tu web publicada
          </label>
          <input
            id={`${id}-url`}
            type="url"
            inputMode="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://mi-pizzeria.vercel.app"
            disabled={checking}
            aria-invalid={Boolean(error)}
            className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-surface px-3.5 py-2.5 text-sm"
          />
          <Button type="submit" loading={checking} variant="lime">
            {checking ? 'Midiendo…' : last ? 'Revisar de nuevo' : 'Revisar mi web'}
          </Button>
        </form>
      )}
      {checking && (
        <p className="mt-2 text-xs text-muted" aria-live="polite">
          Google está midiendo tu web en un celular. Puede tardar hasta 40 segundos.
        </p>
      )}
      {error && (
        <p role="alert" className="mt-2 text-xs text-error">
          {error}
        </p>
      )}

      {last && !checking && (
        <>
          {last.status === 'UNAVAILABLE' && (
            <p className="mt-5 rounded-xl bg-paper px-4 py-3 text-sm text-muted">
              {isClient
                ? 'Esta vez no se pudo medir la web por una falla de Google.'
                : 'Google no respondió esta vez. Puedes intentarlo de nuevo; si sigue fallando, igual puedes entregar.'}
            </p>
          )}

          {last.scores.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-4">
              {last.scores.map((score) => (
                <ScoreRing key={score.key} score={score} />
              ))}
            </div>
          )}
          {last.https !== null && (
            <p className="mt-4 text-center text-xs text-muted">
              {last.https ? '🔒 Usa HTTPS (conexión segura)' : '⚠️ No usa HTTPS (conexión segura)'} ·{' '}
              <a href={last.url} target="_blank" rel="noreferrer" className="underline">
                {last.url.replace(/^https?:\/\//, '')}
              </a>
            </p>
          )}

          {isClient ? (
            <p className="mt-5 text-[15px] leading-relaxed">
              {last.status === 'PASSED'
                ? `Tu web cumple el estándar de calidad de DEVUTEC: carga bien en celulares y es segura.`
                : (last.forClient ?? `${firstName} está haciendo ajustes para que tu web cumpla el estándar antes de entregarla.`)}
            </p>
          ) : (
            <>
              {last.failures.length > 0 && (
                <div className="mt-5 rounded-xl bg-pending-light p-4">
                  <p className="text-[10px] font-semibold tracking-[0.13em] text-pending">LO QUE NO CUMPLE</p>
                  <ul className="mt-2 grid gap-1.5 text-sm">
                    {last.failures.map((failure) => (
                      <li key={failure}>{failure}</li>
                    ))}
                  </ul>
                </div>
              )}
              {last.tasks.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] font-semibold tracking-[0.13em] text-muted">CUYI TE SUGIERE</p>
                  <ol className="mt-2 grid list-decimal gap-1.5 pl-5 text-sm leading-relaxed">
                    {last.tasks.map((task) => (
                      <li key={task}>{task}</li>
                    ))}
                  </ol>
                </div>
              )}
              {last.status === 'PASSED' && (
                <p className="mt-5 text-sm">✅ Tu web cumple el estándar. Ya puedes hacer la entrega final.</p>
              )}
              {last.issues.length > 0 && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setShowIssues((open) => !open)}
                    aria-expanded={showIssues}
                    className="text-xs font-semibold underline"
                  >
                    {showIssues ? 'Ocultar el detalle de Google' : `Ver el detalle de Google (${last.issues.length})`}
                  </button>
                  {showIssues && (
                    <ul className="mt-2 grid gap-1 text-xs text-muted">
                      {last.issues.map((issue) => (
                        <li key={`${issue.category}-${issue.title}`}>
                          <strong className="text-ink">{issue.category}:</strong> {issue.title}
                          {issue.detail && ` (${issue.detail})`}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </article>
  )
}

QualityCard.propTypes = {
  contractId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  stage: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    status: PropTypes.string,
    dueDate: PropTypes.string,
  }).isRequired,
  isClient: PropTypes.bool,
  freelancerName: PropTypes.string,
}
