import { useId, useState } from 'react'
import PropTypes from 'prop-types'
import ButtonLink from '../projects/ButtonLink'
import Button from '../ui/Button'
import Skeleton from '../ui/Skeleton'
import { applicationService } from '../../services/applicationService'
import { errorMessage } from '../../utils/errorMessage'
import { formatBudget, formatDate } from '../../utils/format'
import { idType, projectShape } from '../../utils/propShapes'

// Mismas reglas que ApplicationRequestDTO en el backend
const MIN_MESSAGE = 20
const MAX_MESSAGE = 2000

function validate({ message, proposedPrice }) {
  const errors = {}
  const length = message.trim().length
  if (length < MIN_MESSAGE) errors.message = `Cuéntale al cliente un poco más (mínimo ${MIN_MESSAGE} caracteres)`
  if (length > MAX_MESSAGE) errors.message = `El mensaje no puede pasar de ${MAX_MESSAGE} caracteres`
  if (!proposedPrice || Number(proposedPrice) <= 0) errors.proposedPrice = 'Ingresa un precio mayor que 0'
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
        <span className="text-[#52705f]">El cliente deja el monto en garantía antes de que empieces.</span>
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
  const [values, setValues] = useState({ message: '', proposedPrice: project.budget ? String(project.budget) : '' })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [justSent, setJustSent] = useState(false)

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
        kicker="PROPUESTA NO ELEGIDA"
        title="El cliente eligió otra propuesta."
        text="No te desanimes: hay más proyectos esperando una buena propuesta."
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
      document.getElementById(`${id}-${found.message ? 'message' : 'price'}`)?.focus()
      return
    }

    setSubmitting(true)
    try {
      await applicationService.apply({
        projectId: Number(project.id),
        message: values.message.trim(),
        proposedPrice: Number(values.proposedPrice),
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

  return (
    <aside className={PANEL}>
      <p className="text-[11px] font-semibold tracking-[0.13em]">TU PROPUESTA</p>
      <h2 className="my-3 text-[27px] font-semibold leading-tight tracking-[-0.02em]">Postula a este proyecto</h2>
      <p className="mb-6 text-[13px] leading-relaxed text-muted">
        Explica de forma concreta cómo resolverías esta necesidad y cuándo podrías empezar.
      </p>

      <form onSubmit={handleSubmit} noValidate className="grid gap-5">
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
            className={`h-[150px] resize-none rounded-[10px] border bg-white p-3 text-[13px] leading-normal transition-colors focus:border-ink ${
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
            Precio propuesto
          </label>
          <div
            className={`flex min-h-12 items-center overflow-hidden rounded-[10px] border bg-white transition-colors focus-within:border-ink ${
              errors.proposedPrice ? 'border-error' : 'border-[#cfcac1]'
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
            <small id={`${id}-price-help`} className="text-[11px] text-muted">
              El cliente ofrece {formatBudget(project.budget)}.
            </small>
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
