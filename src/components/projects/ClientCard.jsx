import Avatar from '../ui/Avatar'
import { useUserReviews } from '../../hooks/useUserReviews'
import { projectShape } from '../../utils/propShapes'
import SocialIcon from '../profile/SocialIcon'
import { filledLinks, shortLink } from '../../utils/socialLinks'

// "mar 2026" para "Miembro desde"
function monthYear(value) {
  if (!value) return null
  return new Date(value).toLocaleDateString('es-PE', { month: 'short', year: 'numeric' }).replace('.', '')
}

// Tarjeta del cliente que publicó el proyecto: foto, nombre, distrito, desde cuándo está, su calificación
// y las redes de su negocio.
// La calificación sale de las reseñas que recibió (las primeras 50 alcanzan para un cliente de DEVUTEC).
// Si el backend todavía no manda clientName, se muestra "Cliente de DEVUTEC".
export default function ClientCard({ project }) {
  const reviews = useUserReviews(project.clientId, { size: 50 })
  const list = reviews.data?.content ?? []
  const total = reviews.data?.totalElements ?? 0
  const average = list.length ? list.reduce((sum, review) => sum + review.rating, 0) / list.length : null

  const name = project.clientName || 'Cliente de DEVUTEC'
  const since = monthYear(project.clientSince)
  const details = [project.location, since && `Miembro desde ${since}`].filter(Boolean).join(' · ')
  // Redes del negocio, para que el freelancer vea el estilo de la marca antes de postular
  const links = filledLinks(project.clientLinks)

  return (
    <section aria-label="Cliente" className="mt-11 flex items-center gap-4 rounded-[15px] border border-line bg-surface p-[22px]">
      <Avatar name={name} src={`/api/v1/users/${project.clientId}/avatar`} size="lg" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold tracking-[0.13em]">CLIENTE</p>
        <h3 className="mb-1 mt-[7px] truncate text-lg font-semibold">{name}</h3>
        {details && <p className="text-xs text-muted">{details}</p>}
        {reviews.data && (
          <p className="mt-3 flex items-center gap-1.5 text-[13px]">
            {average !== null ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="text-pending">
                  <path d="m12 2 3 6 6.5 1-4.7 4.6 1.1 6.4-5.9-3-5.9 3 1.1-6.4L2.5 9 9 8Z" />
                </svg>
                <strong>{average.toFixed(1)}</strong>
                <span className="text-muted">
                  · {total} {total === 1 ? 'reseña de freelancers' : 'reseñas de freelancers'}
                </span>
              </>
            ) : (
              <span className="text-muted">Todavía no tiene reseñas</span>
            )}
          </p>
        )}
        {links.length > 0 && (
          <ul aria-label="Redes del negocio" className="mt-4 flex flex-wrap gap-1.5">
            {links.map((link) => (
              <li key={link.key} className="min-w-0 max-w-full">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-semibold transition hover:border-ink"
                >
                  <SocialIcon network={link.key} />
                  <span className="truncate">{shortLink(link.key, link.url)}</span>
                  <span className="sr-only">({link.label}, se abre en otra pestaña)</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

ClientCard.propTypes = {
  project: projectShape.isRequired,
}
