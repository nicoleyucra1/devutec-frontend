import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import Cuyi from '../../components/brand/Cuyi'
import MoneyAmount from '../../components/contracts/MoneyAmount'
import BlockHeading from '../../components/dashboard/BlockHeading'
import NumberCard from '../../components/dashboard/NumberCard'
import ButtonLink from '../../components/projects/ButtonLink'
import ErrorBox from '../../components/projects/ErrorBox'
import Badge from '../../components/ui/Badge'
import LoadingNotice from '../../components/ui/LoadingNotice'
import Skeleton from '../../components/ui/Skeleton'
import { useAuth } from '../../hooks/useAuth'
import { useMyContracts } from '../../hooks/useContracts'
import { useMyApplications } from '../../hooks/useMyApplications'
import { useMyFreelancerProfile } from '../../hooks/useMyFreelancerProfile'
import { useProjects } from '../../hooks/useProjects'
import { useUserReviews } from '../../hooks/useUserReviews'
import { CONTRACT_STATUS, contractCode } from '../../utils/contractStatus'
import { daysUntil, formatBudget, formatDate } from '../../utils/format'
import { idType } from '../../utils/propShapes'
import { sumBy } from '../../utils/stats'

const WEEK = 7 * 86_400_000
const ACTIVE = ['IN_PROGRESS', 'DELIVERED']

const plural = (count, one, many) => (count === 1 ? one : many)
const pad = (count) => String(count).padStart(2, '0')

function Icon({ children, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  )
}

const ArrowIcon = () => (
  <Icon size={15}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
)

const StarIcon = ({ filled }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
    <path d="m12 2 3 6 6.5 1-4.7 4.6 1.1 6.4-5.9-3-5.9 3 1.1-6.4L2.5 9 9 8Z" />
  </svg>
)

// La segunda línea del saludo cuenta lo más importante de la semana
function headline(delivered, inProgress, pending) {
  if (delivered > 0) return delivered === 1 ? 'Tienes una entrega en revisión.' : `Tienes ${delivered} entregas en revisión.`
  if (inProgress > 0) return inProgress === 1 ? 'Tienes un proyecto en curso.' : `Tienes ${inProgress} proyectos en curso.`
  if (pending > 0) return pending === 1 ? 'Tu propuesta está en espera.' : `Tus ${pending} propuestas están en espera.`
  return 'Encuentra tu próximo proyecto.'
}

// Qué le falta al contrato: si ya entregó, esperar al cliente; si no, cuántos días quedan
function contractNote(contract) {
  if (contract.status === 'DELIVERED') return 'Esperando revisión del cliente'
  const days = daysUntil(contract.deadline)
  if (days === null) return 'Sin fecha límite'
  if (days < 0) return `Venció hace ${-days} ${plural(-days, 'día', 'días')}`
  if (days === 0) return 'Vence hoy'
  return `${days} ${plural(days, 'día', 'días')} para entregar`
}

// Lo que mira "Perfil completo": solo datos que guarda el perfil
function profileChecklist(profile, avatarUrl) {
  return [
    { label: 'Datos de UTEC', done: Boolean(profile?.universidad && (profile?.ciclo || profile?.egresado)) },
    { label: 'Tarifa por hora', done: Number(profile?.tarifaHora) > 0 },
    { label: 'Usuario de GitHub', done: Boolean(profile?.githubUsername) },
    { label: 'Enlace a tu portafolio', done: Boolean(profile?.portafolioUrl) },
    { label: 'Foto de perfil', done: Boolean(profile?.avatarUrl || avatarUrl) },
  ]
}

// Valoración con estrellas: el promedio viene del perfil y la cantidad, de las reseñas
function RatingValue({ rating, reviews }) {
  if (!rating) {
    return (
      <div>
        <strong className="text-[40px] leading-none md:text-[53px]">—</strong>
        <small className="mt-2 block text-[10px] font-normal tracking-normal text-muted">Aún sin reseñas</small>
      </div>
    )
  }
  const rounded = Math.round(rating)
  return (
    <div className="flex items-end gap-[15px]">
      <strong className="leading-none">{rating.toFixed(1)}</strong>
      <span className="flex flex-col gap-[7px] pb-1 tracking-normal">
        <span className="flex text-pending" role="img" aria-label={`${rating.toFixed(1)} de 5 estrellas`}>
          {[1, 2, 3, 4, 5].map((n) => (
            <StarIcon key={n} filled={n <= rounded} />
          ))}
        </span>
        <small className="text-[10px] font-normal text-muted">
          {reviews} {plural(reviews, 'reseña', 'reseñas')}
        </small>
      </span>
    </div>
  )
}

// Tarjeta de un contrato activo, clickeable completa
function ContractCard({ contract }) {
  const status = CONTRACT_STATUS[contract.status]
  const late = contract.status === 'IN_PROGRESS' && daysUntil(contract.deadline) !== null && daysUntil(contract.deadline) <= 3
  return (
    <Link
      to={`/contracts/${contract.id}`}
      className="block rounded-[15px] border border-line bg-surface p-[22px] transition-colors hover:border-ink"
    >
      <div className="flex items-center justify-between gap-3">
        <Badge color={status?.color}>{status?.label ?? contract.status}</Badge>
        <span className="font-mono text-[11px] text-muted">{contractCode(contract.id)}</span>
      </div>
      <h3 className="mb-2 mt-[27px] truncate text-[19px] font-semibold">{contract.projectTitle}</h3>
      <p className="mb-[30px] truncate text-[11px] text-muted">
        {[contract.clientName, contract.deadline && `Vence ${formatDate(contract.deadline)}`].filter(Boolean).join(' · ')}
      </p>
      <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
        <strong className="text-sm tabular-nums">{formatBudget(contract.amount)}</strong>
        <span className={`text-right text-[10px] ${contract.status === 'DELIVERED' || late ? 'text-pending' : 'text-muted'}`}>
          {contractNote(contract)}
        </span>
      </div>
    </Link>
  )
}

// Anillo con el porcentaje del perfil y lo que falta completar
function CompletionCard({ items, loading, userId }) {
  const done = items.filter((item) => item.done).length
  const percent = Math.round((done / items.length) * 100)
  const complete = done === items.length

  return (
    <aside className="rounded-2xl border border-line bg-surface p-6">
      {loading ? (
        <Skeleton className="mb-6 h-20 w-20 rounded-full" />
      ) : (
        <div
          className="mb-6 grid h-20 w-20 place-items-center rounded-full"
          style={{ background: `conic-gradient(var(--color-escrow) ${percent}%, var(--color-line) 0)` }}
        >
          <span className="grid h-[66px] w-[66px] place-items-center rounded-full bg-surface">
            <strong className="text-lg tabular-nums">{percent}%</strong>
          </span>
        </div>
      )}
      <p className="text-[11px] font-semibold tracking-[0.13em]">PERFIL COMPLETO</p>
      <h3 className="mt-2 text-xl font-semibold leading-tight">
        {complete ? 'Tu perfil está listo para los clientes.' : 'Un perfil completo da más confianza a los clientes.'}
      </h3>
      <ul className="my-5 grid gap-[11px] text-[11px]">
        {items.map((item) => (
          <li key={item.label} className={`flex items-center gap-2 ${item.done ? 'text-escrow' : 'text-muted'}`}>
            {item.done ? (
              <Icon size={16}>
                <path d="m5 12 4 4L19 6" />
              </Icon>
            ) : (
              <span aria-hidden="true" className="h-4 w-4 rounded-full border border-line" />
            )}
            {item.label}
            <span className="sr-only">{item.done ? ' (listo)' : ' (pendiente)'}</span>
          </li>
        ))}
      </ul>
      {complete ? (
        <ButtonLink to={`/freelancers/${userId}`} variant="secondary" className="w-full">
          Ver mi perfil público
        </ButtonLink>
      ) : (
        <ButtonLink to="/profile/edit" variant="secondary" className="w-full">
          Completar perfil
        </ButtonLink>
      )}
    </aside>
  )
}

// Franja oscura con los proyectos abiertos de la semana y las habilidades que más piden
function SuggestedStrip({ projects, now }) {
  const thisWeek = projects.filter((project) => now - new Date(project.createdAt) < WEEK)
  const list = thisWeek.length > 0 ? thisWeek : projects
  const counts = {}
  list.forEach((project) => (project.skills ?? []).forEach((skill) => (counts[skill.name] = (counts[skill.name] ?? 0) + 1)))
  const topSkills = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name)

  const title =
    thisWeek.length > 0
      ? `${thisWeek.length} ${plural(thisWeek.length, 'proyecto nuevo', 'proyectos nuevos')} esta semana`
      : `${projects.length} ${plural(projects.length, 'proyecto abierto', 'proyectos abiertos')} para ti`

  return (
    <section className="mt-[55px] grid items-center gap-[22px] rounded-2xl bg-ink p-7 text-white md:mt-[60px] lg:grid-cols-[1fr_1fr_auto]">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.13em] text-lime">RECOMENDADO PARA TI</p>
        <h2 className="mt-2 text-[25px] font-semibold leading-tight">{title}</h2>
      </div>
      {topSkills.length > 0 ? (
        <ul aria-label="Habilidades más pedidas" className="flex flex-wrap gap-1.5">
          {topSkills.map((name) => (
            <li key={name} className="rounded-[7px] border border-line bg-paper px-[9px] py-1.5 text-[11px] text-ink">
              {name}
            </li>
          ))}
        </ul>
      ) : (
        <span />
      )}
      <ButtonLink to="/projects" variant="lime" className="w-full lg:w-auto">
        <ArrowIcon />
        Ver proyectos
      </ButtonLink>
    </section>
  )
}

// Resumen del freelancer (mockup ResumenFreelancer): su valoración, contratos, postulaciones y dinero liberado,
// los contratos en curso, qué le falta al perfil y proyectos abiertos para postular
export default function FreelancerDashboard() {
  const { user } = useAuth()
  const applications = useMyApplications()
  const contracts = useMyContracts()
  const profile = useMyFreelancerProfile()
  const reviews = useUserReviews(user.id, { size: 1 })
  const openProjects = useProjects({ status: 'OPEN', size: 50 })
  const now = new Date()

  const allContracts = contracts.data ?? []
  const allApplications = applications.data ?? []
  const active = allContracts
    .filter((contract) => ACTIVE.includes(contract.status))
    // Primero las entregadas (esperan al cliente) y después las que vencen antes
    .sort((a, b) => (a.status === b.status ? (a.deadline ?? '9').localeCompare(b.deadline ?? '9') : a.status === 'DELIVERED' ? -1 : 1))
  const delivered = active.filter((contract) => contract.status === 'DELIVERED').length
  const held = sumBy(active, 'amount', (contract) => contract.paymentStatus === 'HELD')
  const released = allContracts.filter((contract) => contract.paymentStatus === 'RELEASED')
  const pending = allApplications.filter((application) => application.status === 'PENDING').length
  const sentThisWeek = allApplications.filter((application) => now - new Date(application.createdAt) < WEEK).length
  const rating = profile.data?.calificacionPromedio ? Number(profile.data.calificacionPromedio) : null
  const loading = contracts.loading || applications.loading
  const firstName = (user.nombre ?? '').split(' ')[0] || user.email

  return (
    <main className="mx-auto w-full max-w-[1248px] px-4 pb-20 pt-[45px] md:px-6 md:pb-[120px] md:pt-[70px]">
      <LoadingNotice loading={loading} what="tu resumen" />

      <header className="mb-[35px] flex flex-col items-start gap-6 md:mb-[50px] md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.13em]">TU SEMANA EN DEVUTEC</p>
          <h1 className="mt-4 text-[36px] font-semibold leading-[1.02] tracking-[-0.04em] md:text-[48px]">
            Hola, {firstName}.
            <br />
            {/* Mientras carga, la segunda línea queda vacía con su altura para que la página no salte */}
            <em
              aria-hidden={loading || undefined}
              className={`font-serif font-normal text-escrow transition-opacity duration-300 ${loading ? 'opacity-0' : ''}`}
            >
              {loading ? 'Cargando…' : headline(delivered, active.length - delivered, pending)}
            </em>
          </h1>
        </div>
        <ButtonLink to="/projects" className="w-full md:w-auto">
          <Icon>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </Icon>
          Explorar proyectos
        </ButtonLink>
      </header>

      <section aria-label="Tus números" className="grid grid-cols-2 gap-3 lg:grid-cols-[1.15fr_0.75fr_0.9fr_1.3fr]">
        <NumberCard
          label="VALORACIÓN"
          value={<RatingValue rating={rating} reviews={reviews.data?.totalElements ?? 0} />}
          loading={profile.loading || reviews.loading}
        />
        <NumberCard
          label="CONTRATOS ACTIVOS"
          value={pad(active.length)}
          note={held > 0 ? `${formatBudget(held)} en garantía` : 'Ningún pago retenido ahora'}
          loading={contracts.loading}
        />
        <NumberCard
          label="POSTULACIONES PENDIENTES"
          value={pad(pending)}
          note={sentThisWeek > 0 ? `${sentThisWeek} ${plural(sentThisWeek, 'enviada', 'enviadas')} esta semana` : 'Ninguna enviada esta semana'}
          loading={applications.loading}
        />
        <NumberCard
          tone="green"
          className="col-span-2 lg:col-span-1"
          label="PAGOS LIBERADOS"
          value={<MoneyAmount value={sumBy(released, 'amount')} />}
          note={
            released.length > 0
              ? `En ${released.length} ${plural(released.length, 'contrato terminado', 'contratos terminados')}`
              : 'Se suman cuando el cliente aprueba tu entrega'
          }
          loading={contracts.loading}
        />
      </section>

      <section className="mt-[55px] grid items-start gap-[18px] md:mt-[70px] lg:grid-cols-[1.45fr_0.55fr]">
        <div>
          <BlockHeading kicker="EN CURSO" title="Contratos activos">
            <Link to="/contracts" className="inline-flex shrink-0 items-center gap-[7px] text-[11px] font-semibold hover:underline">
              Ver contratos
              <ArrowIcon />
            </Link>
          </BlockHeading>

          {contracts.error && <ErrorBox message={contracts.error} status={contracts.status} onRetry={contracts.reload} compact />}

          {contracts.loading && (
            <div className="grid gap-3 md:grid-cols-2">
              <Skeleton className="h-[190px] w-full rounded-[15px]" />
              <Skeleton className="h-[190px] w-full rounded-[15px]" />
            </div>
          )}

          {contracts.data && active.length === 0 && (
            <div className="flex items-center gap-5 rounded-[15px] border border-dashed border-[#cbc7be] px-[22px] py-5">
              <Cuyi anim="duerme" px={3} />
              <p className="text-[13px] text-muted">
                Cuando un cliente acepte una de tus propuestas, el contrato aparecerá aquí.{' '}
                <Link to="/projects" className="font-semibold text-ink underline hover:no-underline">
                  Busca un proyecto
                </Link>
              </p>
            </div>
          )}

          {active.length > 0 && (
            <ul className="grid gap-3 md:grid-cols-2">
              {active.map((contract) => (
                <li key={contract.id}>
                  <ContractCard contract={contract} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <CompletionCard items={profileChecklist(profile.data, user.avatarUrl)} loading={profile.loading} userId={user.id} />
      </section>

      {openProjects.data?.content.length > 0 && <SuggestedStrip projects={openProjects.data.content} now={now} />}
    </main>
  )
}

Icon.propTypes = {
  children: PropTypes.node,
  size: PropTypes.number,
}

StarIcon.propTypes = {
  filled: PropTypes.bool,
}

RatingValue.propTypes = {
  rating: PropTypes.number,
  reviews: PropTypes.number,
}

ContractCard.propTypes = {
  contract: PropTypes.shape({
    id: idType.isRequired,
    projectTitle: PropTypes.string,
    clientName: PropTypes.string,
    status: PropTypes.string,
    amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    deadline: PropTypes.string,
  }).isRequired,
}

CompletionCard.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string, done: PropTypes.bool })).isRequired,
  loading: PropTypes.bool,
  userId: idType,
}

SuggestedStrip.propTypes = {
  projects: PropTypes.arrayOf(
    PropTypes.shape({ createdAt: PropTypes.string, skills: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string })) }),
  ).isRequired,
  now: PropTypes.instanceOf(Date).isRequired,
}
