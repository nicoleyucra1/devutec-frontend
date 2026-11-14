import { Link } from 'react-router-dom'
import Cuyi from '../../components/brand/Cuyi'
import MoneyAmount from '../../components/contracts/MoneyAmount'
import ActionItem from '../../components/dashboard/ActionItem'
import BlockHeading from '../../components/dashboard/BlockHeading'
import EscrowNote from '../../components/dashboard/EscrowNote'
import NumberCard from '../../components/dashboard/NumberCard'
import RecentProjectsTable, { RecentProjectsSkeleton } from '../../components/dashboard/RecentProjectsTable'
import ButtonLink from '../../components/projects/ButtonLink'
import ErrorBox from '../../components/projects/ErrorBox'
import LoadingNotice from '../../components/ui/LoadingNotice'
import Skeleton from '../../components/ui/Skeleton'
import { useAuth } from '../../hooks/useAuth'
import { useMyContracts } from '../../hooks/useContracts'
import { useProjectsWithApplications } from '../../hooks/useProjectsWithApplications'
import { formatBudget, formatWhen } from '../../utils/format'
import { sumBy } from '../../utils/stats'

const WEEK = 7 * 86_400_000

// "MIÉRCOLES, 11 NOV 2026"
function todayLabel(date) {
  const weekday = date.toLocaleDateString('es-PE', { weekday: 'long' })
  const month = date.toLocaleDateString('es-PE', { month: 'short' }).replace('.', '')
  return `${weekday}, ${String(date.getDate()).padStart(2, '0')} ${month} ${date.getFullYear()}`.toUpperCase()
}

function greeting(date) {
  const hour = date.getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

const plural = (count, one, many) => (count === 1 ? one : many)
const pad = (count) => String(count).padStart(2, '0')

// La segunda línea del saludo cuenta lo más importante que hay por hacer
function headline(deliveries, pending) {
  if (deliveries > 0) return deliveries === 1 ? 'Hay una entrega lista.' : `Hay ${deliveries} entregas listas.`
  if (pending > 0) return pending === 1 ? 'Tienes una postulación nueva.' : `Tienes ${pending} postulaciones nuevas.`
  return 'Todo está al día.'
}

const pendingOf = (project) => (project.applications ?? []).filter((application) => application.status === 'PENDING').length

const icon = (path) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {path}
  </svg>
)

// Resumen del cliente: qué tiene que revisar hoy, cuánto dinero tiene en garantía y sus proyectos recientes
export default function ClientDashboard() {
  const { user } = useAuth()
  const projects = useProjectsWithApplications()
  const contracts = useMyContracts()
  const now = new Date()

  const allProjects = projects.data ?? []
  const allContracts = contracts.data ?? []
  const open = allProjects.filter((project) => project.status === 'OPEN')
  const newThisWeek = allProjects.filter((project) => now - new Date(project.createdAt) < WEEK).length
  const withPending = open.filter((project) => pendingOf(project) > 0).sort((a, b) => pendingOf(b) - pendingOf(a))
  const pending = withPending.reduce((total, project) => total + pendingOf(project), 0)
  const deliveries = allContracts.filter((contract) => contract.status === 'DELIVERED')
  const held = allContracts.filter((contract) => contract.paymentStatus === 'HELD')
  const actions = deliveries.length + withPending.length
  const loading = projects.loading || contracts.loading

  return (
    <main className="mx-auto w-full max-w-[1248px] px-4 pb-20 pt-[45px] md:px-6 md:pb-[120px] md:pt-[70px]">
      <LoadingNotice loading={loading} what="tu resumen" />

      <header className="mb-[35px] md:mb-[50px]">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.13em]">{todayLabel(now)}</p>
          <h1 className="mt-4 text-[36px] font-semibold leading-[1.02] tracking-[-0.04em] md:text-[48px]">
            {greeting(now)}, {user.nombre ?? user.email}.
            <br />
            {/* Mientras carga, la segunda línea queda vacía con su altura para que la página no salte */}
            <em
              aria-hidden={loading || undefined}
              className={`font-serif font-normal text-escrow transition-opacity duration-300 ${loading ? 'opacity-0' : ''}`}
            >
              {loading ? 'Cargando…' : headline(deliveries.length, pending)}
            </em>
          </h1>
        </div>
      </header>

      <section aria-label="Tus números" className="grid grid-cols-2 gap-3 md:grid-cols-[0.8fr_0.8fr_1.4fr]">
        <NumberCard
          label="PROYECTOS ABIERTOS"
          value={pad(open.length)}
          note={
            newThisWeek > 0
              ? `${newThisWeek} ${plural(newThisWeek, 'publicado', 'publicados')} esta semana`
              : 'Ninguno publicado esta semana'
          }
          loading={projects.loading}
        />
        <NumberCard
          label="POSTULACIONES NUEVAS"
          value={
            <span
              className={
                pending > 0 ? 'underline decoration-lime decoration-[7px] underline-offset-[-4px] [text-decoration-skip-ink:none]' : ''
              }
            >
              {pad(pending)}
            </span>
          }
          note={pending > 0 ? `${pendingOf(withPending[0])} para “${withPending[0].title}”` : 'Nada por revisar'}
          loading={projects.loading}
        />
        <NumberCard
          tone="dark"
          className="col-span-2 md:col-span-1"
          label="DINERO EN GARANTÍA"
          icon={icon(
            <>
              <rect x="4" y="10" width="16" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </>,
          )}
          value={<MoneyAmount value={sumBy(held, 'amount')} />}
          note={
            held.length > 0 ? `Protegido en ${held.length} ${plural(held.length, 'contrato', 'contratos')}` : 'Ningún pago retenido ahora'
          }
          loading={contracts.loading}
        />
      </section>

      <section className="mt-[55px] grid items-end gap-[18px] md:mt-[70px] lg:grid-cols-[1.5fr_0.5fr]">
        <div>
          <BlockHeading
            kicker="ACCIÓN REQUERIDA"
            title={
              deliveries.length > 0
                ? 'No dejes esperando una entrega.'
                : withPending.length > 0
                  ? 'Revisa a tus postulantes.'
                  : 'Nada pendiente por ahora.'
            }
          >
            {actions > 0 && (
              <span className="grid h-[26px] min-w-[26px] place-items-center rounded-full bg-lime px-1.5 text-[11px] font-semibold tabular-nums">
                {actions}
              </span>
            )}
          </BlockHeading>

          {contracts.error && (
            <div className="mb-3">
              <ErrorBox message={contracts.error} status={contracts.status} onRetry={contracts.reload} compact />
            </div>
          )}

          {loading && <Skeleton className="h-[92px] w-full rounded-[15px]" />}

          {!loading && (
            <div className="grid gap-3">
              {deliveries.map((contract) => (
                <ActionItem
                  key={`c-${contract.id}`}
                  to={`/contracts/${contract.id}`}
                  title={`${contract.freelancerName} entregó “${contract.projectTitle}”`}
                  text={`Revisa el trabajo y libera ${formatBudget(contract.amount)} si todo está conforme.`}
                  meta={contract.deliveredAt && `Recibido ${formatWhen(contract.deliveredAt)}`}
                />
              ))}
              {withPending.map((project) => (
                <ActionItem
                  key={`p-${project.id}`}
                  to={`/projects/${project.id}/applications`}
                  icon="people"
                  title={`${pendingOf(project)} ${plural(pendingOf(project), 'postulación nueva', 'postulaciones nuevas')} en “${project.title}”`}
                  text="Compara las propuestas y acepta la que más te convenza."
                />
              ))}
              {actions === 0 && !contracts.error && (
                <div className="flex items-center gap-5 rounded-[15px] border border-dashed border-[#cbc7be] px-[22px] py-5">
                  <Cuyi anim="duerme" px={3} />
                  <p className="text-[13px] text-muted">
                    Cuando un freelancer entregue un trabajo o recibas postulaciones nuevas, aparecerán aquí.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        <EscrowNote active={held.length > 0} />
      </section>

      <section className="mt-[55px] md:mt-[75px]">
        <BlockHeading kicker="RECIENTES" title="Tus proyectos">
          <Link to="/my-projects" className="inline-flex items-center gap-[7px] text-[11px] font-semibold hover:underline">
            Ver todos
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </BlockHeading>

        {projects.error && <ErrorBox message={projects.error} status={projects.status} onRetry={projects.reload} compact />}

        {projects.loading && <RecentProjectsSkeleton />}

        {projects.data?.length === 0 && (
          <div className="flex flex-col items-center rounded-2xl border border-line bg-surface px-6 py-14 text-center">
            <Cuyi anim="saluda" px={5} />
            <h2 className="mt-5 text-lg font-semibold">Todavía no has publicado proyectos</h2>
            <p className="mt-1 max-w-md text-sm text-muted">Cuenta qué necesitas y recibe propuestas de estudiantes de UTEC.</p>
            <ButtonLink to="/projects/new" className="mt-6">
              Publicar mi primer proyecto
            </ButtonLink>
          </div>
        )}

        {allProjects.length > 0 && <RecentProjectsTable projects={allProjects.slice(0, 3)} />}
      </section>
    </main>
  )
}
