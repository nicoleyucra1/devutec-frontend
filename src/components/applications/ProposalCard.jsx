import { Link } from 'react-router-dom'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { initials } from '../layout/navLinks'
import { formatBudget } from '../../utils/format'

// "UTEC · Ciclo 6" o "UTEC · Egresado", con lo que haya en el perfil
function studyLine(profile) {
  if (!profile) return 'Perfil no disponible'
  const university = profile.universidad || 'UTEC'
  if (profile.egresado) return `${university} · Egresado`
  return profile.ciclo ? `${university} · Ciclo ${profile.ciclo}` : university
}

// Cuánto se aleja la propuesta del presupuesto publicado
function versusBudget(price, budget) {
  const diff = Number(price) - Number(budget)
  if (!budget || Number.isNaN(diff)) return { text: '—', tone: 'text-ink' }
  if (diff === 0) return { text: 'Igual', tone: 'text-ink' }
  if (diff > 0) return { text: `${formatBudget(diff)} más`, tone: 'text-pending' }
  return { text: `${formatBudget(-diff)} menos`, tone: 'text-escrow' }
}

function Star() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true" className="text-pending">
      <path d="m12 2 3 6 6.5 1-4.7 4.6 1.1 6.4-5.9-3-5.9 3 1.1-6.4L2.5 9 9 8Z" />
    </svg>
  )
}

// Una propuesta para comparar: quién es, cuánto pide frente al presupuesto y su mensaje.
// Al hacer clic se marca como elegida; Aceptar abre la confirmación y Rechazar la descarta.
export default function ProposalCard({ application, budget, selected, canDecide, busy, onSelect, onAccept, onReject, contractLink }) {
  const { profile, status } = application
  const rejected = status === 'REJECTED'
  const accepted = status === 'ACCEPTED'
  const pending = status === 'PENDING'
  const versus = versusBudget(application.proposedPrice, budget)
  const rating = profile?.calificacionPromedio
  const highlighted = selected || accepted

  return (
    <article
      onClick={pending && canDecide ? onSelect : undefined}
      className={`relative flex flex-col rounded-2xl border bg-surface p-6 transition duration-200 ${
        highlighted ? 'border-escrow shadow-[inset_0_0_0_1px_var(--color-escrow)]' : 'border-line hover:border-escrow'
      } ${rejected ? 'opacity-[0.52]' : ''} ${pending && canDecide ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center gap-[11px]">
        <span aria-hidden="true" className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full bg-escrow text-sm font-semibold text-white">
          {initials(application.freelancerName)}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="mb-[3px] truncate text-[17px] font-semibold">
            <Link
              to={`/freelancers/${application.freelancerUserId}`}
              onClick={(event) => event.stopPropagation()}
              className="rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-progress"
            >
              {application.freelancerName}
            </Link>
          </h2>
          <p className="mb-1.5 text-[11px] text-muted">{studyLine(profile)}</p>
          <span className="flex items-center gap-[3px] text-[11px] text-muted">
            {rating ? (
              <>
                <Star />
                <strong className="text-ink">{Number(rating).toFixed(1)}</strong>
                {application.reviewCount !== null && ` · ${application.reviewCount} ${application.reviewCount === 1 ? 'reseña' : 'reseñas'}`}
              </>
            ) : (
              'Sin reseñas aún'
            )}
          </span>
        </div>
        {pending ? (
          <i
            aria-hidden="true"
            className={`grid h-[21px] w-[21px] shrink-0 place-items-center rounded-full border not-italic ${
              selected ? 'border-escrow bg-escrow text-white' : 'border-line'
            }`}
          >
            {selected && (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 12 4 4L19 6" />
              </svg>
            )}
          </i>
        ) : (
          <Badge color={accepted ? 'green' : 'red'}>{accepted ? 'Aceptada' : 'Rechazada'}</Badge>
        )}
      </div>

      <div className="my-6 grid grid-cols-2 border-y border-line">
        <div className="flex flex-col gap-1.5 py-[15px]">
          <span className="text-[10px] tracking-[0.06em] text-muted">PRECIO PROPUESTO</span>
          <strong className="text-base tabular-nums">{formatBudget(application.proposedPrice)}</strong>
        </div>
        <div className="flex flex-col gap-1.5 border-l border-line py-[15px] pl-[15px]">
          <span className="text-[10px] tracking-[0.06em] text-muted">VS. PRESUPUESTO</span>
          <strong className={`text-base tabular-nums ${versus.tone}`}>{versus.text}</strong>
        </div>
      </div>

      <p className="flex-1 whitespace-pre-line text-[13px] leading-relaxed text-[#55534e]">“{application.message}”</p>

      {pending && canDecide && (
        <div className="mt-[25px] grid grid-cols-2 gap-1.5">
          <Button
            onClick={(event) => {
              event.stopPropagation()
              onAccept()
            }}
            disabled={busy}
          >
            Aceptar
          </Button>
          <Button
            variant="ghost"
            onClick={(event) => {
              event.stopPropagation()
              onReject()
            }}
            disabled={busy}
          >
            Rechazar
          </Button>
        </div>
      )}
      {accepted && contractLink}
    </article>
  )
}
