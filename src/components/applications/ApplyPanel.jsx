import { useId, useState } from 'react'
import PropTypes from 'prop-types'
import ButtonLink from '../projects/ButtonLink'
import Button from '../ui/Button'
import Skeleton from '../ui/Skeleton'
import CopilotCard from './CopilotCard'
import { useAsync } from '../../hooks/useAsync'
import { applicationService } from '../../services/applicationService'
import { pricingService } from '../../services/pricingService'
import { formatRate, splitClientTotal } from '../../utils/commission'
import { errorMessage } from '../../utils/errorMessage'
import { formatBudget, formatDate } from '../../utils/format'
import { idType, projectShape } from '../../utils/propShapes'

// Mismas reglas que ApplicationRequestDTO en el backend
const MIN_MESSAGE = 20
const MAX_MESSAGE = 2000

// Hoy en formato AAAA-MM-DD (hora local), para el mínimo del calendario y para validar la fecha propuesta
function todayIso() {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

function validate({ message, proposedPrice, proposedDeadline }) {
  const errors = {}
  const length = message.trim().length
  if (length < MIN_MESSAGE) errors.message = `Cuéntale al cliente un poco más (mínimo ${MIN_MESSAGE} caracteres)`
  if (length > MAX_MESSAGE) errors.message = `El mensaje no puede pasar de ${MAX_MESSAGE} caracteres`
  if (!proposedPrice || Number(proposedPrice) <= 0) errors.proposedPrice = 'Ingresa un precio mayor que 0'
  if (proposedDeadline && proposedDeadline < todayIso()) errors.proposedDeadline = 'La fecha no puede ser pasada'
  return errors
}

const PANEL = 'rounded-[17px] border border-line bg-surface p-7 lg:sticky lg:top-24'

function ShieldNote() {
  return (
    <div className="flex gap-2.5 rounded-[10px] bg-escrow-light p-3.5 text-escrow">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="m9 12 2 2 4-5" />
      </svg>
      <span className="text-xs leading-normal">
        <strong className="block font-semibold">Pago protegido</strong>
        <span className="text-[#52705f] dark:text-[#9cc9ae]">El cliente deja el monto en garantía antes de que empieces.</span>
      </span>
    </div>
  )
}

// Panel con un mensaje: postulación enviada, en revisión, aceptada, rechazada o proyecto cerrado
function StatusPanel({ tone = 'ink', icon, kicker, title, text, action }) {
  const tones = { green: 'bg-escrow text-white', amber: 'bg-pending-light text-pending', ink: 'bg-paper text-muted' }
  return (
    <aside className={`${PANEL} text-center`} aria-live="polite">
      {icon && <span className={`mx-auto mb-6 mt-1 grid h-[55px] w-[55px] place-items-center rounded-full ${tones[tone]}`}>{icon}</span>}
      <p className="text-[11px] font-semibold tracking-[0.13em]">{kicker}</p>
      <h2 className="my-3 text-[26px] font-semibold leading-tight tracking-[-0.02em]">{title}</h2>
      <p className="mb-6 text-[13px] leading-relaxed text-muted">{text}</p>
      {action}
    </aside>
  )
}

const CheckIcon = (
  <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12 4 4L19 6" />
  </svg>
)
const ClockIcon = (
  <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
)

// Panel del freelancer en el detalle del proyecto (mockup DetalleFreelancer): postula sin salir de la página.
// Si ya postuló, en vez del formulario se muestra cómo va su propuesta, así no aparece "Postular" dos veces.
export default function ApplyPanel({ project, application, contract, loading, onApplied }) {
  const id = useId()
  const [values, setValues] = useState({
    message: '',
    proposedPrice: project.budget ? String(project.budget) : '',
    proposedDeadline: '',
  })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [justSent, setJustSent] = useState(false)

  // El copiloto solo hace falta mientras se puede postular
  const canApply = !loading && !application && project.status === 'OPEN'
  const copilot = useAsync(
    (options) => (canApply ? pricingService.estimateProject(project.id, options) : Promise.resolve(null)),
    [project.id, canApply],
  )

  const client = project.clientName || 'El cliente'
  const toMyApplications = (
    <ButtonLink to="/my-applications" variant="secondary" className="w-full">
      Ver mis postulaciones
    </ButtonLink>
  )

  // Recién enviada va primero: mientras se recargan las postulaciones no debe aparecer el esqueleto
  if (loading && !justSent) {
    return (
      <aside className={`${PANEL} grid gap-4`} aria-busy="true">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-36 w-full rounded-[10px]" />
        <Skeleton className="h-12 w-full rounded-[11px]" />
      </aside>
    )
  }

  if (justSent || application?.status === 'PENDING') {
    const sentOn = application ? formatDate(application.createdAt) : null
    return justSent ? (
      <StatusPanel
        tone="green"
        icon={CheckIcon}
        kicker="POSTULACIÓN ENVIADA"
        title={`${client} ya recibió tu propuesta.`}
        text="Te avisaremos cuando la revise. Mientras siga pendiente, puedes retirarla desde Mis postulaciones."
        action={toMyApplications}
      />
    ) : (
      <StatusPanel
        tone="amber"
        icon={ClockIcon}
        kicker="YA POSTULASTE"
        title="Tu propuesta está en revisión."
        text={`Propusiste ${formatBudget(application.proposedPrice)}${sentOn ? ` el ${sentOn}` : ''}. Mientras siga pendiente, puedes retirarla desde Mis postulaciones.`}
        action={toMyApplications}
      />
    )
  }

  if (application?.status === 'ACCEPTED') {
    return (
      <StatusPanel
        tone="green"
        icon={CheckIcon}
        kicker="¡TE ELIGIERON!"
        title={`${client} aceptó tu propuesta.`}
        text="El pago queda en garantía y se libera cuando el cliente apruebe tu entrega."
        action={
          <ButtonLink to={contract ? `/contracts/${contract.id}` : '/contracts'} className="w-full">
            Ver contrato
          </ButtonLink>
        }
      />
    )
  }

  if (application?.status === 'REJECTED') {
    return (
      <StatusPanel
        // Mismo texto que el correo de rechazo: el cliente puede rechazar sin haber elegido a nadie
        kicker="NOVEDADES SOBRE TU PROPUESTA"
        title="El cliente decidió seguir con otra opción."
        text="No te desanimes: hay más proyectos esperándote."
        action={
          <ButtonLink to="/projects" className="w-full">
            Explorar proyectos
          </ButtonLink>
        }
      />
    )
  }

  if (project.status !== 'OPEN') {
    return (
      <StatusPanel
        kicker="PROYECTO"
        title="Ya no recibe propuestas."
        text="Este proyecto ya tiene a alguien trabajando o terminó."
        action={
          <ButtonLink to="/projects" variant="secondary" className="w-full">
            Explorar otros proyectos
          </ButtonLink>
        }
      />
    )
  }

  const handleChange = (event) => {
    const next = { ...values, [event.target.name]: event.target.value }
    setValues(next)
    // Los errores se recalculan al escribir solo si ya se intentó enviar
    if (Object.keys(errors).length > 0) setErrors(validate(next))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError(null)
    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      const firstField = found.message ? 'message' : found.proposedPrice ? 'price' : 'deadline'
      document.getElementById(`${id}-${firstField}`)?.focus()
      return
    }

    setSubmitting(true)
    try {
      await applicationService.apply({
        projectId: Number(project.id),
        message: values.message.trim(),
        proposedPrice: Number(values.proposedPrice),
        proposedDeadline: values.proposedDeadline,
      })
      setJustSent(true)
      onApplied?.()
    } catch (err) {
      setSubmitError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const length = values.message.trim().length
  const counterInvalid = errors.message || length > MAX_MESSAGE

  // El precio que escribe el estudiante es el total que paga el cliente: la comisión de DEVUTEC va adentro
  const split = splitClientTotal(values.proposedPrice)
  const info = copilot.data?.estimate
  // Alerta de subestimación: lo que recibiría queda por debajo del mínimo razonable (aviso, no bloquea)
  const underestimate =
    info && split.freelancerAmount > 0 && split.freelancerAmount < Number(copilot.data.underestimateBelow)
  const averageHours = info ? Math.round((info.hoursMin + info.hoursMax) / 2) : 0
  const perHour = averageHours > 0 ? Math.round(split.freelancerAmount / averageHours) : 0
  // Plazo corto: la fecha propuesta deja menos semanas de las que suele tomar un proyecto así
  const daysProposed = values.proposedDeadline
    ? Math.round((new Date(values.proposedDeadline) - new Date(todayIso())) / 86400000)
    : null
  const shortDeadline = info && daysProposed !== null && daysProposed >= 0 && daysProposed < info.weeksMin * 7

  return (
    <aside className={PANEL}>
      <p className="text-[11px] font-semibold tracking-[0.13em]">TU PROPUESTA</p>
      <h2 className="my-3 text-[27px] font-semibold leading-tight tracking-[-0.02em]">Postula a este proyecto</h2>
      <p className="mb-6 text-[13px] leading-relaxed text-muted">
        Explica de forma concreta cómo resolverías esta necesidad y cuándo podrías empezar.
      </p>

      <form onSubmit={handleSubmit} noValidate className="grid gap-5">
        <CopilotCard estimate={copilot.data} loading={copilot.loading} error={copilot.error} />

        <div className="flex flex-col gap-2 text-xs">
          <label htmlFor={`${id}-message`} className="font-medium">
            Mensaje para el cliente
          </label>
          <textarea
            id={`${id}-message`}
            name="message"
            value={values.message}
            onChange={handleChange}
            maxLength={MAX_MESSAGE}
            placeholder="Hola, puedo desarrollar…"
            aria-invalid={Boolean(errors.message)}
            aria-describedby={`${id}-message-help`}
            className={`h-[150px] resize-none rounded-[10px] border bg-surface p-3 text-[13px] leading-normal transition-colors focus:border-ink ${
              errors.message ? 'border-error' : 'border-line'
            }`}
            style={{ outline: 'none' }}
          />
          <small id={`${id}-message-help`} className={`flex justify-between gap-2 text-[11px] ${counterInvalid ? 'text-error' : 'text-muted'}`}>
            <span>{errors.message}</span>
            <span className="shrink-0 tabular-nums">
              {length}/{MAX_MESSAGE} · Mínimo {MIN_MESSAGE}
            </span>
          </small>
        </div>

        <div className="flex flex-col gap-2 text-xs">
          <label htmlFor={`${id}-price`} className="font-medium">
            Precio total para el cliente
          </label>
          <div
            className={`flex min-h-12 items-center overflow-hidden rounded-[10px] border bg-surface transition-colors focus-within:border-ink ${
              errors.proposedPrice ? 'border-error' : 'border-gray-300'
            }`}
          >
            <span className="border-r border-line px-3 text-muted">S/</span>
            <input
              id={`${id}-price`}
              name="proposedPrice"
              type="number"
              min="1"
              step="0.01"
              inputMode="decimal"
              value={values.proposedPrice}
              onChange={handleChange}
              aria-invalid={Boolean(errors.proposedPrice)}
              aria-describedby={errors.proposedPrice ? `${id}-price-error` : `${id}-price-help`}
              className="w-full min-w-0 bg-transparent px-3 text-sm tabular-nums"
              style={{ outline: 'none' }}
            />
          </div>
          {errors.proposedPrice ? (
            <small id={`${id}-price-error`} className="text-[11px] text-error">
              {errors.proposedPrice}
            </small>
          ) : (
            <small id={`${id}-price-help`} className="text-[11px] leading-normal text-muted">
              {split.freelancerAmount > 0 && (
                <>
                  Tú recibes <strong className="font-semibold text-ink">{formatBudget(split.freelancerAmount)}</strong>; el{' '}
                  {formatRate(split.rate)} es la tarifa de DEVUTEC.{' '}
                </>
              )}
              El cliente ofrece {formatBudget(project.budget)}.
            </small>
          )}
          {underestimate && (
            <p role="status" className="rounded-[10px] bg-pending-light p-3 text-[11px] leading-normal text-pending">
              <strong className="font-semibold">Ojo:</strong> proyectos así toman entre {info.hoursMin} y {info.hoursMax} horas.
              Con {formatBudget(values.proposedPrice)} estarías cobrando unos S/ {perHour} la hora. Un precio más realista
              empieza en {formatBudget(info.clientMin)}.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 text-xs">
          <label htmlFor={`${id}-deadline`} className="font-medium">
            Fecha en que propones entregar <span className="font-normal text-muted">(opcional)</span>
          </label>
          <input
            id={`${id}-deadline`}
            name="proposedDeadline"
            type="date"
            min={todayIso()}
            value={values.proposedDeadline}
            onChange={handleChange}
            aria-invalid={Boolean(errors.proposedDeadline)}
            aria-describedby={`${id}-deadline-help`}
            className={`min-h-12 rounded-[10px] border bg-surface px-3 text-sm transition-colors focus:border-ink ${
              errors.proposedDeadline ? 'border-error' : 'border-gray-300'
            }`}
            style={{ outline: 'none' }}
          />
          <small id={`${id}-deadline-help`} className={`text-[11px] ${errors.proposedDeadline ? 'text-error' : 'text-muted'}`}>
            {errors.proposedDeadline ||
              (project.deadline
                ? `El cliente lo necesita para el ${formatDate(project.deadline)}. Déjalo vacío si aceptas esa fecha.`
                : 'Déjalo vacío si aceptas la fecha del cliente.')}
          </small>
          {shortDeadline && (
            <p role="status" className="rounded-[10px] bg-pending-light p-3 text-[11px] leading-normal text-pending">
              <strong className="font-semibold">Ojo:</strong> proyectos así suelen tomar {info.weeksMin}{' '}
              {info.weeksMin === 1 ? 'semana' : 'semanas'} o más. Asegúrate de que te alcance el tiempo.
            </p>
          )}
        </div>

        <ShieldNote />

        {submitError && (
          <p role="alert" className="rounded-[10px] bg-error-light px-3.5 py-3 text-sm text-error">
            {submitError}
          </p>
        )}

        <Button type="submit" loading={submitting} className="w-full">
          {submitting ? 'Enviando…' : 'Enviar postulación'}
        </Button>
      </form>
    </aside>
  )
}

StatusPanel.propTypes = {
  tone: PropTypes.oneOf(['green', 'amber', 'ink']),
  icon: PropTypes.node,
  kicker: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  text: PropTypes.string,
  action: PropTypes.node,
}

ApplyPanel.propTypes = {
  project: projectShape.isRequired,
  application: PropTypes.shape({
    status: PropTypes.string,
    proposedPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    createdAt: PropTypes.string,
  }),
  contract: PropTypes.shape({ id: idType }),
  loading: PropTypes.bool,
  onApplied: PropTypes.func,
}
