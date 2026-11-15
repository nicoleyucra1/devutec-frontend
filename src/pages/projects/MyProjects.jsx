import { useState } from 'react'
import { Link } from 'react-router-dom'
import Cuyi from '../../components/brand/Cuyi'
import ButtonLink from '../../components/projects/ButtonLink'
import DeleteProjectDialog from '../../components/projects/DeleteProjectDialog'
import ErrorBox from '../../components/projects/ErrorBox'
import ProjectStatusBadge from '../../components/projects/ProjectStatusBadge'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import LoadingNotice from '../../components/ui/LoadingNotice'
import Pagination from '../../components/ui/Pagination'
import SearchField from '../../components/ui/SearchField'
import Skeleton from '../../components/ui/Skeleton'
import { useMyContracts } from '../../hooks/useContracts'
import { useListParams } from '../../hooks/useListParams'
import { useProjectActions } from '../../hooks/useProjectActions'
import { useProjectsWithApplications } from '../../hooks/useProjectsWithApplications'
import { useToast } from '../../hooks/useToast'
import { projectCode, projectInitials } from '../../utils/contractStatus'
import { errorMessage } from '../../utils/errorMessage'
import { daysUntil, formatBudget, formatDate } from '../../utils/format'

// Misma grilla en la cabecera, las filas y el esqueleto. En celular la tabla se desliza de lado.
const ROW = 'grid min-w-[850px] grid-cols-[2fr_0.75fr_1fr_0.85fr_1fr_0.55fr] items-center gap-3.5 px-[18px]'

// Activos = abiertos o en curso; Archivados = terminados. En la URL: ?estado=ARCHIVADOS
const TABS = [
  { value: 'ALL', label: 'Activos', matches: (project) => project.status !== 'DONE' },
  { value: 'ARCHIVADOS', label: 'Archivados', matches: (project) => project.status === 'DONE' },
]

// Busca por título o por código, con o sin "#": "pizzería", "PR-0056" o "56"
function matchesQuery(project, query) {
  const q = query.trim().toLowerCase().replace(/^#/, '')
  if (!q) return true
  return project.title.toLowerCase().includes(q) || projectCode(project.id).toLowerCase().includes(q)
}

// Aviso en ámbar cuando la fecha límite está cerca o ya pasó (solo si el proyecto sigue activo)
function dueNote(project) {
  if (project.status === 'DONE') return null
  const days = daysUntil(project.deadline)
  if (days === null || days > 3) return null
  if (days < 0) return 'Ya venció'
  if (days === 0) return 'Vence hoy'
  if (days === 1) return 'Vence mañana'
  return `Vence en ${days} días`
}

function Icon({ children }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  )
}

function Applicants({ project }) {
  const applications = project.applications
  if (!applications) return <span className="text-muted">—</span>
  if (applications.length === 0) return <span className="text-muted">Ninguno aún</span>
  return (
    <Link
      to={`/projects/${project.id}/applications`}
      className="group flex w-fit items-center gap-[7px] rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-progress"
    >
      <span className="flex">
        {applications.slice(0, 2).map((application, index) => (
          <Avatar key={application.id} name={application.freelancerName} size="sm" className={index > 0 ? '-ml-[9px] ring-2 ring-surface' : ''} />
        ))}
      </span>
      <strong className="tabular-nums">{applications.length}</strong>
      <small className="text-[11px] text-escrow underline group-hover:no-underline">
        Ver<span className="sr-only"> postulantes de {project.title}</span>
      </small>
    </Link>
  )
}

function ProjectRow({ project, onDelete }) {
  const note = dueNote(project)
  return (
    <li className={`${ROW} min-h-[78px] border-t border-line py-3.5 text-[13px]`}>
      <Link
        to={`/projects/${project.id}`}
        className="flex min-w-0 items-center gap-2.5 rounded-md hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-progress"
      >
        <i className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-lg bg-paper text-[10px] font-semibold not-italic">
          {projectInitials(project.title)}
        </i>
        <span className="flex min-w-0 flex-col gap-[5px]">
          <strong className="truncate font-semibold">{project.title}</strong>
          <small className="font-mono text-[10px] text-muted">{projectCode(project.id)}</small>
        </span>
      </Link>
      <span>
        <ProjectStatusBadge status={project.status} />
      </span>
      <Applicants project={project} />
      <strong className="tabular-nums">{formatBudget(project.budget)}</strong>
      <span className="flex flex-col gap-1">
        {formatDate(project.deadline)}
        {note && <small className="text-[10px] uppercase tracking-[0.06em] text-pending">{note}</small>}
      </span>
      {project.status === 'DONE' ? (
        <span className="text-muted">—</span>
      ) : (
        <div className="flex gap-[5px]">
          <Link
            to={`/projects/${project.id}/edit`}
            aria-label={`Editar ${project.title}`}
            title="Editar"
            className="grid h-[30px] w-[30px] place-items-center rounded-[7px] border border-line bg-surface transition-colors hover:border-ink"
          >
            <Icon>
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </Icon>
          </Link>
          <button
            type="button"
            onClick={() => onDelete(project)}
            aria-label={`Eliminar ${project.title}`}
            title="Eliminar"
            className="grid h-[30px] w-[30px] cursor-pointer place-items-center rounded-[7px] border border-line bg-surface text-error transition-colors hover:border-error"
          >
            <Icon>
              <path d="m6 6 12 12M18 6 6 18" />
            </Icon>
          </button>
        </div>
      )}
    </li>
  )
}

function Table({ children, label }) {
  return (
    <div className="overflow-x-auto rounded-[15px] border border-line bg-surface">
      <div aria-hidden="true" className={`${ROW} min-h-[43px] bg-[#efede7] text-[10px] font-semibold tracking-[0.09em] text-muted`}>
        <span>PROYECTO</span>
        <span>ESTADO</span>
        <span>POSTULANTES</span>
        <span>PRESUPUESTO</span>
        <span>FECHA LÍMITE</span>
        <span>ACCIONES</span>
      </div>
      <ul aria-label={label}>{children}</ul>
    </div>
  )
}

function TableLoading() {
  return (
    <div aria-busy="true">
      <p role="status" className="sr-only">
        Cargando tus proyectos…
      </p>
      <Table label="Cargando proyectos">
        {[0, 1, 2].map((row) => (
          <li key={row} aria-hidden="true" className={`${ROW} min-h-[78px] border-t border-line py-3.5`}>
            <span className="flex items-center gap-2.5">
              <Skeleton className="h-[38px] w-[38px] shrink-0 rounded-lg" />
              <span className="grid flex-1 gap-2">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2 w-14" />
              </span>
            </span>
            <Skeleton className="h-[22px] w-[70px] rounded-full" />
            <Skeleton className="h-[26px] w-16 rounded-full" />
            <Skeleton className="h-3 w-[70px]" />
            <Skeleton className="h-3 w-[70px]" />
            <span className="flex gap-[5px]">
              <Skeleton className="h-[30px] w-[30px] rounded-[7px]" />
              <Skeleton className="h-[30px] w-[30px] rounded-[7px]" />
            </span>
          </li>
        ))}
      </Table>
    </div>
  )
}

function Empty({ kicker, title, text, action }) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-line bg-surface p-[30px] text-center">
      <Cuyi anim="duerme" px={4} />
      <p className="mt-6 text-[11px] font-semibold tracking-[0.13em]">{kicker}</p>
      <h2 className="my-2.5 text-[25px] font-semibold tracking-[-0.02em]">{title}</h2>
      <p className="mb-[22px] max-w-[440px] text-[13px] leading-relaxed text-muted">{text}</p>
      {action}
    </div>
  )
}

// Mis proyectos del diseño: pestañas Activos y Archivados, buscador y tabla para editar, ver postulantes o eliminar.
// La pestaña, la búsqueda y la página quedan en la URL (?estado=&q=&page=).
export default function MyProjects() {
  const projects = useProjectsWithApplications()
  const contracts = useMyContracts()
  const list = useListParams()
  const actions = useProjectActions()
  const toast = useToast()
  const [toDelete, setToDelete] = useState(null)
  const [conflict, setConflict] = useState(null)

  const all = projects.data ?? []
  const tab = TABS.find((item) => item.value === list.status) ?? TABS[0]
  const rows = all.filter((project) => tab.matches(project) && matchesQuery(project, list.query))
  const totalPages = Math.max(1, Math.ceil(rows.length / list.size))
  const page = Math.min(list.page, totalPages)
  const visible = rows.slice((page - 1) * list.size, page * list.size)

  // El contrato más reciente del proyecto, si tiene (también los cancelados: impiden eliminarlo)
  const contractOf = (project) =>
    (contracts.data ?? []).filter((contract) => contract.projectId === project.id).sort((a, b) => b.id - a.id)[0] ?? null

  const closeDelete = () => {
    setToDelete(null)
    setConflict(null)
  }

  const handleDelete = async () => {
    try {
      await actions.remove(toDelete.id)
      toast.success(`Eliminaste “${toDelete.title}”`)
      closeDelete()
      projects.reload()
    } catch (error) {
      // 409: el backend no lo deja eliminar (por ejemplo, alguien aceptó una postulación mientras tanto)
      if (error?.response?.status === 409) setConflict(error.response.data?.message ?? 'Este proyecto ya no se puede eliminar.')
      else {
        toast.error(errorMessage(error))
        closeDelete()
      }
    }
  }

  return (
    <main className="mx-auto w-full max-w-[1248px] px-4 pb-20 pt-[45px] md:px-6 md:pb-[120px] md:pt-[70px]">
      <LoadingNotice loading={projects.loading} what="tus proyectos" />

      <header className="mb-[35px] flex flex-col items-start gap-[22px] md:mb-[50px] md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.13em]">ESPACIO DE CLIENTE</p>
          <h1 className="mb-2 mt-3.5 text-[39px] font-semibold leading-none tracking-[-0.04em] md:text-[47px]">Mis proyectos</h1>
          <p className="text-muted">Administra publicaciones, revisa postulaciones y sigue el trabajo contratado.</p>
        </div>
        {/* En escritorio la barra ya tiene "Publicar proyecto"; aquí se muestra solo en celular */}
        <div className="w-full md:hidden">
        <ButtonLink to="/projects/new" className="w-full">
          <Icon>
            <rect x="3" y="7" width="18" height="13" rx="2" />
            <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" />
          </Icon>
          Publicar proyecto
        </ButtonLink>
        </div>
      </header>

      <div className="mb-[18px] flex flex-col items-stretch gap-2.5 border-b border-line md:flex-row md:items-center md:justify-between md:gap-0">
        <div role="tablist" aria-label="Mostrar proyectos" className="flex">
          {TABS.map((item) => {
            const active = item.value === tab.value
            return (
              <button
                key={item.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => list.setStatus(item.value)}
                className={`mr-[22px] cursor-pointer border-b-2 px-1 py-4 text-[13px] transition-colors ${
                  active ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink'
                }`}
              >
                {item.label}{' '}
                <span className="rounded-full bg-lime px-[5px] py-px text-[11px] tabular-nums text-ink">
                  {projects.data ? all.filter(item.matches).length : '·'}
                </span>
              </button>
            )
          })}
        </div>
        <SearchField
          value={list.query}
          onChange={list.setQuery}
          placeholder="Buscar en mis proyectos"
          label="Buscar en mis proyectos"
          className="mb-[15px] w-full md:mb-0 md:w-[260px]"
        />
      </div>

      {projects.error && <ErrorBox message={projects.error} status={projects.status} onRetry={projects.reload} />}

      {projects.loading && <TableLoading />}

      {projects.data && all.length === 0 && (
        <Empty
          kicker="TODAVÍA NO HAY PROYECTOS"
          title="Publica tu primer proyecto."
          text="Cuenta qué necesitas, cuánto quieres invertir y para cuándo. Los estudiantes de UTEC te enviarán sus propuestas."
          action={<ButtonLink to="/projects/new">Publicar proyecto</ButtonLink>}
        />
      )}

      {all.length > 0 && rows.length === 0 && !list.query && tab.value === 'ARCHIVADOS' && (
        <Empty
          kicker="SIN PROYECTOS ARCHIVADOS"
          title="Aquí aparecerán los proyectos terminados."
          text="Cuando confirmes la entrega de un proyecto, lo podrás consultar aquí con su contrato y sus postulaciones."
          action={
            <Button variant="secondary" onClick={() => list.setStatus('ALL')}>
              Ver proyectos activos
            </Button>
          }
        />
      )}

      {all.length > 0 && rows.length === 0 && (list.query || tab.value === 'ALL') && (
        <Empty
          kicker="SIN RESULTADOS"
          title={list.query ? 'No encontramos ese proyecto.' : 'No tienes proyectos activos.'}
          text={list.query ? 'Prueba con otra palabra o con el código del proyecto, por ejemplo #PR-0012.' : 'Todos tus proyectos ya terminaron. Publica uno nuevo cuando lo necesites.'}
          action={
            list.query ? (
              <Button variant="secondary" onClick={() => list.setQuery('')}>
                Borrar búsqueda
              </Button>
            ) : (
              <ButtonLink to="/projects/new">Publicar proyecto</ButtonLink>
            )
          }
        />
      )}

      {visible.length > 0 && (
        <>
          <Table label={tab.value === 'ALL' ? 'Proyectos activos' : 'Proyectos archivados'}>
            {visible.map((project) => (
              <ProjectRow key={project.id} project={project} onDelete={setToDelete} />
            ))}
          </Table>
          {rows.length > 10 && (
            <Pagination
              page={page}
              size={list.size}
              totalPages={totalPages}
              totalElements={rows.length}
              onPageChange={list.setPage}
              onSizeChange={list.setSize}
            />
          )}
        </>
      )}

      <DeleteProjectDialog
        project={toDelete}
        contract={toDelete ? contractOf(toDelete) : null}
        busy={actions.saving}
        conflict={conflict}
        onConfirm={handleDelete}
        onClose={closeDelete}
      />
    </main>
  )
}
