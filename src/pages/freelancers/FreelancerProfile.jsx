import { useState } from 'react'
import ErrorBox from '../../components/projects/ErrorBox'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { Link, useParams } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import Skeleton from '../../components/ui/Skeleton'
import { useAuth } from '../../hooks/useAuth'
import { useFreelancerProfile } from '../../hooks/useFreelancerProfile'
import { useUserReviews } from '../../hooks/useUserReviews'
import { formatBudget, formatDate } from '../../utils/format'

const RATING_FILTERS = [
  { value: '', label: 'Todas las calificaciones' },
  { value: '5', label: 'Solo 5 estrellas' },
  { value: '4', label: '4 estrellas o más' },
  { value: '3', label: '3 estrellas o más' },
]

function Stars({ rating }) {
  const rounded = Math.round(rating)
  return (
    <span aria-label={`${rating} de 5 estrellas`} className="tracking-wide text-amber-500">
      {'★'.repeat(rounded)}
      <span className="text-gray-300">{'★'.repeat(5 - rounded)}</span>
    </span>
  )
}

function studyLabel(profile) {
  if (profile.egresado) return 'Egresado'
  if (profile.ciclo) return `Ciclo ${profile.ciclo}`
  return null
}

function ProfileHeader({ profile, isOwner }) {
  const study = studyLabel(profile)
  const githubUrl = profile.githubUsername ? `https://github.com/${profile.githubUsername}` : null

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{profile.nombre}</h1>
          <p className="mt-1 text-gray-500">
            {[profile.universidad, study].filter(Boolean).join(' · ') || 'Freelancer en DevUTEC'}
          </p>
        </div>
        {isOwner && (
          <Link
            to="/profile/edit"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            Editar mi perfil
          </Link>
        )}
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium tracking-wide text-gray-500 uppercase">Tarifa por hora</dt>
          <dd className="mt-1 text-lg font-semibold text-gray-900">
            {profile.tarifaHora ? formatBudget(profile.tarifaHora) : 'Sin definir'}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium tracking-wide text-gray-500 uppercase">Calificación</dt>
          <dd className="mt-1 text-lg font-semibold text-gray-900">
            {profile.calificacionPromedio ? (
              <>
                {Number(profile.calificacionPromedio).toFixed(1)} <Stars rating={profile.calificacionPromedio} />
              </>
            ) : (
              <span className="text-base font-normal text-gray-500">Aún sin reseñas</span>
            )}
          </dd>
        </div>
      </dl>

      {(profile.portafolioUrl || githubUrl) && (
        <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold">
          {profile.portafolioUrl && (
            <a href={profile.portafolioUrl} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline">
              Portafolio ↗
            </a>
          )}
          {githubUrl && (
            <a href={githubUrl} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline">
              GitHub · {profile.githubUsername} ↗
            </a>
          )}
        </div>
      )}
    </Card>
  )
}

function ReviewList({ userId }) {
  const [minRating, setMinRating] = useState('')
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const { data, loading, error, status, reload } = useUserReviews(userId, { page, size, minRating })

  const changeFilter = (event) => {
    setMinRating(event.target.value)
    setPage(1)
  }

  const changeSize = (value) => {
    setSize(value)
    setPage(1)
  }

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900">Reseñas</h2>
        <select
          value={minRating}
          onChange={changeFilter}
          aria-label="Filtrar por calificación"
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
        >
          {RATING_FILTERS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 space-y-3">
        {loading && [1, 2, 3].map((n) => <Skeleton key={n} className="h-24 w-full rounded-xl" />)}

        {error && <ErrorBox message={error} status={status} onRetry={reload} compact />}

        {data?.content.length === 0 && (
          <EmptyState
            title={minRating ? 'No hay reseñas con ese filtro' : 'Todavía no tiene reseñas'}
            message={
              minRating
                ? 'Prueba con otra calificación mínima.'
                : 'Las reseñas aparecen cuando un cliente califica un contrato terminado.'
            }
          />
        )}

        {data?.content.map((review) => (
          <Card key={review.id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Stars rating={review.rating} />
              <span className="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
            </div>
            {review.comment && <p className="mt-2 text-gray-800">{review.comment}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <span>{review.authorName}</span>
              <Badge>{review.projectTitle}</Badge>
            </div>
          </Card>
        ))}
      </div>

      {data && (
        <Pagination
          page={data.page}
          size={size}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          onPageChange={setPage}
          onSizeChange={changeSize}
        />
      )}
    </section>
  )
}

export default function FreelancerProfile() {
  const { userId } = useParams()
  const { user } = useAuth()
  const { data: profile, loading, error, status, reload } = useFreelancerProfile(userId)
  const isOwner = String(user?.id) === userId

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumbs
        items={[{ label: 'Resumen', to: '/' }, { label: isOwner ? 'Mi perfil' : error ? 'Perfil' : profile?.nombre }]}
      />

      <div>
        {loading && <Skeleton className="h-48 w-full rounded-xl" />}

        {error && (
          <EmptyState
            title={status === 404 ? 'Este freelancer no existe' : 'No pudimos cargar el perfil'}
            message={status === 404 ? 'Puede que el enlace esté mal o que el usuario no sea freelancer.' : error}
            action={
              status !== 404 && (
                <Button variant="secondary" onClick={reload}>
                  Reintentar
                </Button>
              )
            }
          />
        )}

        {profile && (
          <>
            <ProfileHeader profile={profile} isOwner={isOwner} />
            <ReviewList userId={userId} />
          </>
        )}
      </div>
    </main>
  )
}
