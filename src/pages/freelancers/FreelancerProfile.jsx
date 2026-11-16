import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import { QRCodeSVG } from 'qrcode.react'
import MoneyAmount from '../../components/contracts/MoneyAmount'
import ButtonLink from '../../components/projects/ButtonLink'
import ErrorBox from '../../components/projects/ErrorBox'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import LoadingNotice from '../../components/ui/LoadingNotice'
import Pagination from '../../components/ui/Pagination'
import Skeleton from '../../components/ui/Skeleton'
import { useAuth } from '../../hooks/useAuth'
import { useFreelancerProfile } from '../../hooks/useFreelancerProfile'
import { useGithubRepos } from '../../hooks/useGithubRepos'
import { useRatingDistribution } from '../../hooks/useRatingDistribution'
import { useToast } from '../../hooks/useToast'
import { useUserReviews } from '../../hooks/useUserReviews'
import { formatDate } from '../../utils/format'
import { freelancerProfileShape, idType } from '../../utils/propShapes'

const plural = (count, one, many) => (count === 1 ? one : many)

// Colores de los lenguajes más comunes en los repos (el resto va en gris)
const LANGUAGE_COLORS = {
  JavaScript: 'bg-[#f1e05a]',
  TypeScript: 'bg-progress',
  Java: 'bg-error',
  Python: 'bg-pending',
  HTML: 'bg-[#e34c26]',
  CSS: 'bg-[#663399]',
  Kotlin: 'bg-[#a97bff]',
  'C++': 'bg-[#f34b7d]',
}

function Icon({ children, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
      {children}
    </svg>
  )
}

const CodeIcon = () => (
  <Icon>
    <path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14" />
  </Icon>
)

const ArrowIcon = () => (
  <Icon>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
)

function Stars({ rating, size = 15 }) {
  const rounded = Math.round(Number(rating))
  return (
    <span className="flex text-pending" role="img" aria-label={`${Number(rating).toFixed(1)} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width={size} height={size} viewBox="0 0 24 24" fill={n <= rounded ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
          <path d="m12 2 3 6 6.5 1-4.7 4.6 1.1 6.4-5.9-3-5.9 3 1.1-6.4L2.5 9 9 8Z" />
        </svg>
      ))}
    </span>
  )
}

function studyLabel(profile) {
  if (profile.egresado) return 'Egresado'
  if (profile.ciclo) return `Ciclo ${profile.ciclo}`
  return null
}

// "https://camilarios.dev/" → "camilarios.dev"
const shortUrl = (url) => url.replace(/^https?:\/\//, '').replace(/\/$/, '')

// Banda oscura de arriba: foto, nombre, estudios, enlaces y tarifa
function ProfileHero({ profile, isOwner }) {
  const study = [profile.universidad, studyLabel(profile)].filter(Boolean).join(' · ')
  return (
    <section className="bg-ink py-[45px] text-white md:py-[65px]">
      <div className="mx-auto flex w-full max-w-[1248px] flex-col gap-[35px] px-4 md:flex-row md:items-end md:justify-between md:px-6">
        <div className="flex items-start gap-4 md:items-center md:gap-[22px]">
          <Avatar name={profile.nombre} src={profile.avatarUrl} size="xl" className="h-16! w-16! bg-lime! text-base! text-ink! md:h-[92px]! md:w-[92px]! md:text-[22px]!" />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.13em] text-[#a6a39c]">FREELANCER EN DEVUTEC</p>
            <h1 className="mb-[5px] mt-2.5 text-[38px] font-semibold leading-tight tracking-[-0.045em] md:text-[53px]">{profile.nombre}</h1>
            <p className="text-[#aaa8a0]">{study || 'Estudiante de UTEC'}</p>
            {(profile.githubUsername || profile.portafolioUrl) && (
              <div className="mt-[18px] flex flex-col gap-2 text-xs text-[#aaa8a0] md:flex-row md:gap-5">
                {profile.githubUsername && (
                  <a
                    href={`https://github.com/${profile.githubUsername}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 hover:text-white hover:underline"
                  >
                    <CodeIcon />
                    github.com/{profile.githubUsername}
                  </a>
                )}
                {profile.portafolioUrl && (
                  <a href={profile.portafolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white hover:underline">
                    <ArrowIcon />
                    {shortUrl(profile.portafolioUrl)}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end">
          <span className="text-[10px] font-semibold tracking-[0.12em] text-lime">TARIFA POR HORA</span>
          {profile.tarifaHora ? (
            <MoneyAmount value={profile.tarifaHora} className="mb-[15px] mt-1.5 text-[43px] leading-none" />
          ) : (
            <strong className="mb-[15px] mt-1.5 text-2xl font-semibold text-[#aaa8a0]">Por conversar</strong>
          )}
          {isOwner && (
            <ButtonLink to="/profile/edit" variant="lime">
              Editar mi perfil
            </ButtonLink>
          )}
        </div>
      </div>
    </section>
  )
}

// "Sobre Camila": la presentación que escribió en Editar perfil. Si no tiene, a los demás no se les muestra
// nada y a la dueña del perfil se le invita a escribirla.
function About({ profile, firstName, isOwner }) {
  const text = profile.presentacion?.trim()
  if (!text && !isOwner) return null

  return (
    <section className="border-b border-line pb-[55px] pt-[55px]">
      <p className="text-[11px] font-semibold tracking-[0.13em]">SOBRE {firstName.toUpperCase()}</p>
      {text ? (
        <p className="mt-5 max-w-[700px] whitespace-pre-line text-[17px] leading-[1.7] text-[#55534e]">{text}</p>
      ) : (
        <p className="mt-5 text-sm text-muted">
          Todavía no escribiste tu presentación. Cuéntales a los clientes qué haces bien y cómo trabajas.{' '}
          <Link to="/profile/edit" className="font-semibold text-ink underline hover:no-underline">
            Escribir mi presentación
          </Link>
        </p>
      )}
    </section>
  )
}

// Repos públicos de su GitHub; si no tiene usuario o GitHub falla, la sección no aparece
function GithubRepos({ username }) {
  const { data: repos, loading } = useGithubRepos(username)
  if (!username || (!loading && !repos?.length)) return null

  return (
    <section className="pt-[55px]">
      <div className="mb-5">
        <p className="text-[11px] font-semibold tracking-[0.13em]">GITHUB</p>
        <h2 className="mt-2 text-[27px] font-semibold leading-tight tracking-[-0.025em]">Repositorios destacados</h2>
      </div>
      {loading ? (
        <div className="grid gap-3">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-[72px] w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <ul>
          {repos.map((repo) => (
            <li key={repo.id}>
              <a
                href={repo.url}
                target="_blank"
                rel="noreferrer"
                className="group grid grid-cols-[40px_1fr_20px] items-center gap-3 border-t border-line py-[17px]"
              >
                <span className="grid h-10 w-10 place-items-center rounded-[9px] border border-line bg-surface">
                  <CodeIcon />
                </span>
                <span className="min-w-0">
                  <strong className="font-mono text-[13px] group-hover:underline">{repo.name}</strong>
                  {repo.description && <span className="my-1 block truncate text-xs text-muted">{repo.description}</span>}
                  <small className="flex items-center gap-1.5 text-[11px] text-muted">
                    {repo.language && (
                      <>
                        <i aria-hidden="true" className={`h-[7px] w-[7px] rounded-full ${LANGUAGE_COLORS[repo.language] ?? 'bg-muted'}`} />
                        {repo.language}
                      </>
                    )}
                    {repo.stars > 0 && (
                      <span className="ml-2 flex items-center gap-1">
                        <Icon size={12}>
                          <path d="m12 2 3 6 6.5 1-4.7 4.6 1.1 6.4-5.9-3-5.9 3 1.1-6.4L2.5 9 9 8Z" />
                        </Icon>
                        {repo.stars}
                        <span className="sr-only"> estrellas</span>
                      </span>
                    )}
                  </small>
                </span>
                <span className="text-muted transition-transform group-hover:translate-x-0.5">
                  <ArrowIcon />
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
      <p className="border-t border-line pt-3 text-[11px] text-muted">Datos públicos de GitHub.</p>
    </section>
  )
}

// Reseñas que le dejaron sus clientes, con filtro "mínimo 4 estrellas" y páginas
function Reviews({ userId, firstName }) {
  const [onlyGood, setOnlyGood] = useState(false)
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const { data, loading, error, status, reload } = useUserReviews(userId, { page, size, minRating: onlyGood ? 4 : undefined })

  return (
    <section className="pt-[55px]">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.13em]">RESEÑAS</p>
          <h2 className="mt-2 text-[27px] font-semibold leading-tight tracking-[-0.025em]">Lo que dicen sus clientes</h2>
        </div>
        <label className="flex shrink-0 cursor-pointer items-center gap-[7px] text-[11px]">
          <input
            type="checkbox"
            checked={onlyGood}
            onChange={(event) => {
              setOnlyGood(event.target.checked)
              setPage(1)
            }}
            className="accent-escrow"
          />
          Mínimo 4 ★
        </label>
      </div>

      {error && <ErrorBox message={error} status={status} onRetry={reload} compact />}

      <div className="border-t border-line">
        {loading &&
          [1, 2, 3].map((n) => (
            <div key={n} className="grid gap-3 border-b border-line py-6">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}

        {data?.content.length === 0 && (
          <EmptyState
            title={onlyGood ? 'No hay reseñas de 4 estrellas o más' : 'Todavía no tiene reseñas'}
            message={
              onlyGood
                ? 'Quita el filtro para ver todas las reseñas.'
                : `Las reseñas aparecen cuando un cliente califica un trabajo terminado con ${firstName}.`
            }
          />
        )}

        {data?.content.map((review) => (
          <article key={review.id} className="border-b border-line py-[25px]">
            <div className="flex items-center gap-2.5">
              <Avatar name={review.authorName} size="md" />
              <span className="flex min-w-0 flex-col gap-1">
                <strong className="truncate text-xs font-semibold">{review.authorName}</strong>
                <small className="truncate text-[11px] text-muted">
                  {review.projectTitle} · {formatDate(review.createdAt)}
                </small>
              </span>
              <span className="ml-auto">
                <Stars rating={review.rating} size={13} />
              </span>
            </div>
            {review.comment && (
              <p className="mt-[18px] text-[13px] leading-[1.65] text-[#454440] md:ml-[46px]">“{review.comment}”</p>
            )}
          </article>
        ))}
      </div>

      {data && data.totalElements > size && (
        <Pagination
          page={data.page}
          size={size}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          onPageChange={setPage}
          onSizeChange={(value) => {
            setSize(value)
            setPage(1)
          }}
        />
      )}
    </section>
  )
}

// Tarjeta "Valoración": promedio, estrellas y una barra por cada cantidad de estrellas
function RatingSummary({ userId, average }) {
  const { data } = useRatingDistribution(userId)
  const total = data?.total ?? 0

  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <p className="text-[11px] font-semibold tracking-[0.13em]">VALORACIÓN</p>
      {average ? (
        <div className="my-[22px] flex items-center gap-3.5">
          <strong className="text-5xl font-semibold leading-none tabular-nums">{Number(average).toFixed(1)}</strong>
          <span className="flex flex-col gap-[5px]">
            <Stars rating={average} />
            <small className="text-[11px] text-muted">
              {data ? `Basado en ${total} ${plural(total, 'reseña', 'reseñas')}` : ' '}
            </small>
          </span>
        </div>
      ) : (
        <p className="my-[22px] text-[13px] text-muted">Aún sin reseñas.</p>
      )}
      {data && total > 0 && (
        <ul className="grid gap-2">
          {[5, 4, 3, 2, 1].map((stars) => (
            <li key={stars} className="grid grid-cols-[28px_1fr_18px] items-center gap-2 text-[11px] text-muted">
              <span>{stars} ★</span>
              <span className="h-[5px] overflow-hidden rounded-full bg-line">
                <span className="block h-full bg-escrow" style={{ width: `${(data.counts[stars] / total) * 100}%` }} />
              </span>
              <span className="text-right tabular-nums">{data.counts[stars]}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// Tarjeta para compartir el perfil: un QR, el enlace y un botón para copiarlo.
// El QR guarda la misma URL de la web: con la cámara de cualquier celular abre el perfil en la web, y el
// escáner de la app de DEVUTEC también la reconoce (parseProfileLink acepta .../freelancers/49) y lo abre en la app.
function ShareCard({ userId }) {
  const toast = useToast()
  const link = `${window.location.origin}/freelancers/${userId}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      toast.success('Enlace copiado')
    } catch {
      toast.error('No se pudo copiar. Copia el enlace a mano.')
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-6 text-center">
      <p className="text-[11px] font-semibold tracking-[0.13em]">COMPARTIR PERFIL</p>
      <div className="mx-auto mb-[15px] mt-[22px] w-fit rounded-lg border border-line bg-white p-2.5">
        <QRCodeSVG
          value={link}
          size={134}
          level="H"
          fgColor="#0e0e0c"
          bgColor="#ffffff"
          role="img"
          aria-label="Código QR para abrir este perfil"
        />
      </div>
      <strong className="block break-all font-mono text-[11px]">{link.replace(/^https?:\/\//, '')}</strong>
      {/* El perfil es solo para usuarios de DEVUTEC (política de privacidad): quien escanea inicia sesión y vuelve aquí */}
      <p className="mb-4 mt-1 text-[11px] leading-snug text-muted">
        Escanéalo con la cámara o con la app de DEVUTEC. Para ver el perfil hay que iniciar sesión.
      </p>
      <Button variant="secondary" onClick={copy} className="w-full">
        <Icon>
          <rect x="8" y="8" width="11" height="11" rx="2" />
          <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
        </Icon>
        Copiar enlace
      </Button>
    </div>
  )
}

function ProfileFacts({ profile }) {
  const facts = [
    { label: 'Universidad', value: profile.universidad || '—' },
    { label: 'Estudios', value: studyLabel(profile) || '—' },
    { label: 'Tarifa por hora', value: profile.tarifaHora ? `S/ ${Number(profile.tarifaHora).toFixed(2)}` : 'Por conversar' },
  ]
  return (
    <dl className="rounded-2xl border border-line bg-surface px-6 py-3">
      {facts.map((fact) => (
        <div key={fact.label} className="flex justify-between gap-4 border-b border-line py-[11px] text-xs last:border-b-0">
          <dt className="text-muted">{fact.label}</dt>
          <dd className="text-right font-semibold">{fact.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function ProfileLoading() {
  return (
    <div aria-busy="true">
      <div className="bg-ink py-[65px]">
        <div className="mx-auto flex max-w-[1248px] items-center gap-[22px] px-4 md:px-6">
          <Skeleton className="h-[92px] w-[92px] rounded-full opacity-20" />
          <div className="grid flex-1 gap-3">
            <Skeleton className="h-3 w-40 opacity-20" />
            <Skeleton className="h-12 w-2/3 opacity-20" />
          </div>
        </div>
      </div>
      <div className="mx-auto grid max-w-[1248px] gap-12 px-4 py-[55px] md:px-6 lg:grid-cols-[1.35fr_0.65fr]">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  )
}

// Perfil público del freelancer (mockup Perfil): lo ven los clientes antes de aceptar una propuesta
export default function FreelancerProfile() {
  const { userId } = useParams()
  const { user } = useAuth()
  const { data: profile, loading, error, status, reload } = useFreelancerProfile(userId)
  const isOwner = String(user?.id) === userId
  const firstName = profile?.nombre?.split(' ')[0] ?? ''

  return (
    <main>
      <LoadingNotice loading={loading} what="el perfil" />
      {loading && <ProfileLoading />}

      {error && (
        <div className="mx-auto max-w-3xl px-4 py-16">
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
        </div>
      )}

      {profile && (
        <>
          <ProfileHero profile={profile} isOwner={isOwner} />
          <div className="mx-auto grid w-full max-w-[1248px] items-start gap-[50px] px-4 pb-20 pt-[55px] md:px-6 md:pb-[110px] md:pt-[75px] lg:grid-cols-[1.35fr_0.65fr] lg:gap-[70px]">
            <section className="min-w-0">
              <About profile={profile} firstName={firstName} isOwner={isOwner} />
              <GithubRepos username={profile.githubUsername} />
              <Reviews userId={userId} firstName={firstName} />
            </section>
            <aside className="grid gap-[15px] lg:pt-[55px]">
              <RatingSummary userId={userId} average={profile.calificacionPromedio} />
              <ShareCard userId={userId} />
              <ProfileFacts profile={profile} />
            </aside>
          </div>
        </>
      )}
    </main>
  )
}

Icon.propTypes = {
  children: PropTypes.node,
  size: PropTypes.number,
}

Stars.propTypes = {
  rating: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  size: PropTypes.number,
}

ProfileHero.propTypes = {
  profile: freelancerProfileShape.isRequired,
  isOwner: PropTypes.bool,
}

About.propTypes = {
  profile: freelancerProfileShape.isRequired,
  firstName: PropTypes.string,
  isOwner: PropTypes.bool,
}

GithubRepos.propTypes = {
  username: PropTypes.string,
}

Reviews.propTypes = {
  userId: idType.isRequired,
  firstName: PropTypes.string,
}

RatingSummary.propTypes = {
  userId: idType.isRequired,
  average: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
}

ShareCard.propTypes = {
  userId: idType.isRequired,
}

ProfileFacts.propTypes = {
  profile: freelancerProfileShape.isRequired,
}

