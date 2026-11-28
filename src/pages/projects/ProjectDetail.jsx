import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'
import MoneyAmount from '../../components/contracts/MoneyAmount'
import ApplyPanel from '../../components/applications/ApplyPanel'
import ButtonLink from '../../components/projects/ButtonLink'
import ClientCard from '../../components/projects/ClientCard'
import ErrorBox from '../../components/projects/ErrorBox'
import OwnerPanel from '../../components/projects/OwnerPanel'
import ProjectStatusBadge from '../../components/projects/ProjectStatusBadge'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import LoadingNotice from '../../components/ui/LoadingNotice'
import Skeleton from '../../components/ui/Skeleton'
import { useAuth } from '../../hooks/useAuth'
import { useMyProjectApplication } from '../../hooks/useMyProjectApplication'
import { useProject } from '../../hooks/useProject'
import { projectCode } from '../../utils/contractStatus'
import { formatDate, timeAgo } from '../../utils/format'
import { projectShape } from '../../utils/propShapes'

const ICONS = {
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  shield: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-5" />
    </>
  ),
}

function Icon({ name, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
      {ICONS[name]}
    </svg>
  )
}

Icon.propTypes = {
  name: PropTypes.oneOf(Object.keys(ICONS)).isRequired,
  size: PropTypes.number,
}

// El dueño llega desde Mis proyectos; el resto, desde Explorar
function ProjectBreadcrumbs({ title, mine }) {
  return (
    <Breadcrumbs
      items={[mine ? { label: 'Mis proyectos', to: '/my-projects' } : { label: 'Explorar', to: '/projects' }, { label: title }]}
    />
  )
}

ProjectBreadcrumbs.propTypes = {
  title: PropTypes.string,
  mine: PropTypes.bool,
}

// Panel de quien mira el proyecto sin ser el dueño ni freelancer (por ejemplo, otro cliente)
function VisitorPanel({ project }) {
  return (
    <aside className="rounded-[17px] border border-line bg-surface p-7 lg:sticky lg:top-24">
      <p className="text-[11px] font-semibold tracking-[0.13em]">PROYECTO</p>
      <h2 className="my-3 text-[26px] font-semibold leading-tight tracking-[-0.02em]">
        {project.status === 'OPEN' ? 'Recibiendo propuestas' : 'Ya no recibe propuestas'}
      </h2>
      <p className="mb-6 text-[13px] leading-relaxed text-muted">
        {project.status === 'OPEN'
          ? 'Los estudiantes de UTEC pueden postular con su propuesta y su precio.'
          : 'Este proyecto ya tiene a alguien trabajando o terminó.'}
      </p>
      <ButtonLink to="/projects" variant="secondary" className="w-full">
        Explorar proyectos
      </ButtonLink>
      <div className="mt-4 flex gap-2.5 rounded-[10px] bg-escrow-light p-3.5 text-escrow">
        <Icon name="shield" />
        <span className="text-xs leading-normal">
          <strong className="block font-semibold">Pago protegido en garantía.</strong>
          <span className="text-[#52705f] dark:text-[#9cc9ae]">El cliente paga al contratar y el dinero se libera al aprobar la entrega.</span>
        </span>
      </div>
    </aside>
  )
}

VisitorPanel.propTypes = {
  project: projectShape.isRequired,
}

function DetailLoading() {
  return (
    <div aria-busy="true">
      <p role="status" className="sr-only">
        Cargando el proyecto…
      </p>
      <div className="grid gap-8 border-b border-line pb-12 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
        <div className="grid gap-4">
          <Skeleton className="h-6 w-40 rounded-full" />
          <Skeleton className="h-14 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-14 w-48 lg:justify-self-end" />
      </div>
      <div className="grid gap-12 pt-11 lg:grid-cols-[1.35fr_0.65fr] lg:gap-[70px]">
        <div className="grid gap-6">
          <Skeleton className="h-[74px] w-full rounded-[13px]" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-72 w-full rounded-[17px]" />
      </div>
    </div>
  )
}

// Detalle del proyecto (mockup DetalleCliente). Lo ven el dueño, el admin y los freelancers:
// el contenido es el mismo y el panel de la derecha cambia según quién lo mira.
export default function ProjectDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { data: project, loading, error, status, reload } = useProject(id)

  const isOwner = Boolean(user?.id && project && user.id === project.clientId)
  const canManage = isOwner || user?.rol === 'ADMIN'
  const isFreelancer = user?.rol === 'FREELANCER'
  const mine = useMyProjectApplication(id, isFreelancer)

  const facts = project
    ? [
        { icon: 'clock', label: 'FECHA LÍMITE', value: formatDate(project.deadline) },
        { icon: 'pin', label: 'UBICACIÓN', value: project.location || 'Sin ubicación' },
        { icon: 'calendar', label: 'PUBLICADO', value: formatDate(project.createdAt) },
      ]
    : []
  const byline = project ? [isOwner ? (user.nombre ?? 'Tú') : project.clientName, project.location, `Publicado ${timeAgo(project.createdAt)}`].filter(Boolean).join(' · ') : ''

  return (
    <main className="mx-auto w-full max-w-[1248px] px-4 pb-20 pt-[45px] md:px-6 md:pb-[120px] md:pt-[70px]">
      <LoadingNotice loading={loading} what="el proyecto" />
      <ProjectBreadcrumbs title={project?.title ?? (error ? 'Proyecto' : '')} mine={isOwner} />

      {error && <ErrorBox message={error} status={status} onRetry={reload} />}
      {loading && <DetailLoading />}

      {project && (
        <>
          <header className="mt-8 grid gap-8 border-b border-line pb-12 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <ProjectStatusBadge status={project.status} />
                <span className="font-mono text-xs text-muted">{projectCode(project.id)}</span>
                {project.metricsRequested && (
                  <span className="rounded-full bg-progress-light px-2.5 py-1 text-[11px] font-semibold text-progress">
                    Incluye métricas DEVUTEC
                  </span>
                )}
              </div>
              <h1 className="mb-2 mt-[18px] text-[40px] font-semibold leading-[1.02] tracking-[-0.045em] md:text-[57px]">{project.title}</h1>
              <p className="text-muted">{byline}</p>
            </div>
            <div className="flex flex-col items-start lg:items-end">
              <span className="text-[11px] font-semibold tracking-[0.12em] text-escrow">PRESUPUESTO</span>
              <MoneyAmount value={project.budget} className="mb-0.5 mt-2 text-[44px] leading-none md:text-[49px]" />
              <small className="text-xs text-muted">Pago fijo · Protegido en garantía</small>
            </div>
          </header>

          <div className="grid gap-12 pt-11 lg:grid-cols-[1.35fr_0.65fr] lg:items-start lg:gap-[70px]">
            <section className="min-w-0">
              <dl className="grid rounded-[13px] border border-line bg-surface sm:grid-cols-3">
                {facts.map((fact, index) => (
                  <div
                    key={fact.label}
                    className={`flex items-center gap-3 p-[18px] text-escrow ${index > 0 ? 'border-t border-line sm:border-l sm:border-t-0' : ''}`}
                  >
                    <Icon name={fact.icon} />
                    <span className="flex min-w-0 flex-col gap-1">
                      <dt className="text-[10px] font-semibold tracking-[0.1em] text-muted">{fact.label}</dt>
                      <dd className="truncate text-[13px] font-semibold text-ink">{fact.value}</dd>
                    </span>
                  </div>
                ))}
              </dl>

              {project.metricsRequested && (
                <p className="mt-5 rounded-xl bg-progress-light p-4 text-sm leading-relaxed text-progress">
                  <strong className="font-semibold">El cliente pidió métricas DEVUTEC.</strong> Antes de la Entrega final tienes que
                  dejar instalado el script de métricas en su web (es una línea y DEVUTEC te da las instrucciones). Sin costo extra.
                </p>
              )}

              <div className="border-b border-line py-11">
                <p className="text-[11px] font-semibold tracking-[0.13em]">DESCRIPCIÓN</p>
                <p className="mt-5 whitespace-pre-line text-[15px] leading-[1.75] text-[#55534e] dark:text-gray-600">{project.description || 'Sin descripción.'}</p>
              </div>

              {project.skills?.length > 0 && (
                <div className="border-b border-line py-11">
                  <p className="text-[11px] font-semibold tracking-[0.13em]">HABILIDADES SOLICITADAS</p>
                  <ul className="mt-5 flex flex-wrap gap-1.5">
                    {project.skills.map((skill) => (
                      <li key={skill.id} className="rounded-[7px] border border-line bg-surface px-3 py-2 text-xs">
                        {skill.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!isOwner && <ClientCard project={project} />}
            </section>

            <div className="row-start-1 lg:row-start-auto">
              {canManage ? (
                <OwnerPanel project={project} isOwner={isOwner} />
              ) : isFreelancer ? (
                <ApplyPanel
                  project={project}
                  application={mine.data?.application}
                  contract={mine.data?.contract}
                  loading={mine.loading}
                  onApplied={mine.reload}
                />
              ) : (
                <VisitorPanel project={project} />
              )}
            </div>
          </div>
        </>
      )}
    </main>
  )
}
