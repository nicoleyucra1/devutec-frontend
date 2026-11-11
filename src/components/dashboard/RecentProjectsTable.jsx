import { Link } from 'react-router-dom'
import ProjectStatusBadge from '../projects/ProjectStatusBadge'
import Avatar from '../ui/Avatar'
import Skeleton from '../ui/Skeleton'
import { projectInitials } from '../../utils/contractStatus'
import { formatBudget, formatDate } from '../../utils/format'

// Misma grilla en la cabecera, las filas y el esqueleto. En celular la tabla se desliza de lado.
const ROW = 'grid min-w-[800px] grid-cols-[2.2fr_0.8fr_1fr_0.8fr_1fr_24px] items-center gap-4 px-[18px]'

// Avatares de los dos primeros postulantes y el total. null = no se pudieron cargar.
function Applicants({ applications }) {
  if (!applications) return <span className="text-muted">—</span>
  if (applications.length === 0) return <span className="text-muted">Ninguna aún</span>
  return (
    <span className="flex items-center gap-2">
      <span className="flex">
        {applications.slice(0, 2).map((application, index) => (
          <Avatar
            key={application.id}
            name={application.freelancerName}
            size="sm"
            className={index > 0 ? '-ml-[9px] ring-2 ring-surface' : ''}
          />
        ))}
      </span>
      <b className="font-semibold tabular-nums">{applications.length}</b>
      <span className="sr-only">{applications.length === 1 ? 'postulación' : 'postulaciones'}</span>
    </span>
  )
}

function Frame({ children, label }) {
  return (
    <div className="overflow-x-auto rounded-[15px] border border-line bg-surface">
      <div aria-hidden="true" className={`${ROW} min-h-[42px] bg-[#efede7] text-[10px] font-semibold tracking-[0.1em] text-muted`}>
        <span>PROYECTO</span>
        <span>ESTADO</span>
        <span>POSTULACIONES</span>
        <span>PRESUPUESTO</span>
        <span>FECHA LÍMITE</span>
        <span />
      </div>
      <ul aria-label={label}>{children}</ul>
    </div>
  )
}

// Tabla de los proyectos del cliente; cada fila lleva al detalle del proyecto
export default function RecentProjectsTable({ projects }) {
  return (
    <Frame label="Tus proyectos recientes">
      {projects.map((project) => (
        <li key={project.id}>
          <Link
            to={`/projects/${project.id}`}
            className={`${ROW} min-h-[72px] border-t border-line py-2.5 text-[13px] transition-colors duration-200 hover:bg-[#faf9f6] focus-visible:bg-[#faf9f6] focus-visible:outline-none`}
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <i className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-paper text-[10px] font-semibold not-italic">
                {projectInitials(project.title)}
              </i>
              <span className="min-w-0">
                <b className="block truncate font-semibold">{project.title}</b>
                <small className="text-[11px] text-muted">{project.location || 'Remoto'}</small>
              </span>
            </span>
            <span>
              <ProjectStatusBadge status={project.status} />
            </span>
            <Applicants applications={project.applications} />
            <strong className="tabular-nums">{formatBudget(project.budget)}</strong>
            <span>{formatDate(project.deadline)}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-muted">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </li>
      ))}
    </Frame>
  )
}

// Esqueleto de la tabla mientras cargan los proyectos y sus postulaciones
export function RecentProjectsSkeleton({ rows = 3 }) {
  return (
    <div aria-busy="true">
      <p role="status" className="sr-only">
        Cargando tus proyectos…
      </p>
      <Frame label="Cargando proyectos">
        {Array.from({ length: rows }, (_, row) => (
          <li key={row} aria-hidden="true" className={`${ROW} min-h-[72px] border-t border-line py-2.5`}>
            <span className="flex items-center gap-2.5">
              <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
              <span className="grid flex-1 gap-2">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2 w-16" />
              </span>
            </span>
            <Skeleton className="h-[22px] w-[70px] rounded-full" />
            <span className="flex items-center gap-2">
              <Skeleton className="h-[26px] w-[26px] rounded-full" />
              <Skeleton className="h-3 w-4" />
            </span>
            <Skeleton className="h-3 w-[70px]" />
            <Skeleton className="h-3 w-[70px]" />
            <span />
          </li>
        ))}
      </Frame>
    </div>
  )
}
