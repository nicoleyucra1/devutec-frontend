import Skeleton from '../ui/Skeleton'
import ProjectCard from './ProjectCard'
import PropTypes from 'prop-types'
import { projectShape } from '../../utils/propShapes'

const LIST = 'grid gap-3'

// Lista de tarjetas de Explorar; mientras carga muestra tarjetas grises que parpadean
export default function ProjectGrid({ projects, loading }) {
  if (loading) {
    return (
      <div className={LIST} aria-busy="true" aria-label="Cargando proyectos">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="flex min-h-[230px] flex-col justify-between rounded-2xl border border-line bg-surface p-[22px]">
            <div className="space-y-3">
              <Skeleton className="h-3 w-1/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <ul className={LIST} aria-label="Proyectos">
      {projects.map((project) => (
        <li key={project.id}>
          <ProjectCard project={project} />
        </li>
      ))}
    </ul>
  )
}

ProjectGrid.propTypes = {
  projects: PropTypes.arrayOf(projectShape),
  loading: PropTypes.bool,
}
