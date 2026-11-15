import { Link } from 'react-router-dom'
import ProjectStatusBadge from './ProjectStatusBadge'
import { formatBudget, formatDate, timeAgo } from '../../utils/format'
import { projectShape } from '../../utils/propShapes'

// Tarjeta de Explorar: lugar y hace cuánto se publicó, título, habilidades, presupuesto y entrega.
// Toda la tarjeta lleva al proyecto: el link del título se estira sobre la tarjeta con un ::after
// (sigue siendo un solo link, así que el lector de pantalla y el Tab lo leen una vez, con el título).
// Con Tab, el contorno de foco rodea toda la tarjeta y no solo el título.
export default function ProjectCard({ project }) {
  // "Barranco · Publicado hace 2 h"; si falta alguno de los dos, se muestra solo el otro
  const eyebrow = [project.location, project.createdAt && `Publicado ${timeAgo(project.createdAt)}`].filter(Boolean).join(' · ')

  return (
    <article className="group relative flex min-h-[290px] flex-col justify-between gap-4 rounded-2xl border border-line bg-surface p-[22px] transition duration-200 hover:-translate-y-0.5 hover:border-[#a8a59e] has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-progress md:min-h-[230px]">
      <div className="md:absolute md:right-[22px] md:top-[22px]">
        <ProjectStatusBadge status={project.status} />
      </div>

      <div className="md:pr-28">
        {eyebrow && <p className="text-[10px] uppercase tracking-[0.06em] text-muted">{eyebrow}</p>}
        <h3 className="my-3 text-[23px] font-semibold tracking-[-0.025em]">
          <Link
            to={`/projects/${project.id}`}
            className="after:absolute after:inset-0 after:rounded-2xl after:content-[''] group-hover:underline"
            // El contorno de foco lo dibuja la tarjeta; la regla global de :focus-visible le ganaría a una clase
            style={{ outline: 'none' }}
          >
            {project.title}
          </Link>
        </h3>
      </div>

      {project.skills?.length > 0 && (
        <ul aria-label="Habilidades" className="flex flex-wrap gap-1.5">
          {project.skills.map((skill) => (
            <li key={skill.id} className="rounded-[7px] border border-line bg-paper px-[9px] py-1.5 text-[11px]">
              {skill.name}
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-end gap-[25px] border-t border-line pt-[18px]">
        <div className="flex flex-col gap-[5px]">
          <span className="text-[10px] text-muted">Presupuesto</span>
          <strong className="text-sm tabular-nums">{formatBudget(project.budget)}</strong>
        </div>
        <div className="flex flex-col gap-[5px]">
          <span className="text-[10px] text-muted">Entrega</span>
          <strong className="text-sm tabular-nums">{formatDate(project.deadline)}</strong>
        </div>
        {/* Solo decorativa: el link es toda la tarjeta */}
        <span aria-hidden="true" className="ml-auto grid h-10 w-10 place-items-center rounded-full bg-ink text-on-ink">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </article>
  )
}

ProjectCard.propTypes = {
  project: projectShape.isRequired,
}
