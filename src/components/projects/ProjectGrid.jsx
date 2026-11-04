import Skeleton from '../ui/Skeleton'
import ProjectCard from './ProjectCard'

const GRID = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'

// Grilla de tarjetas; mientras carga muestra tarjetas grises que parpadean
export default function ProjectGrid({ projects, loading }) {
  if (loading) {
    return (
      <div className={GRID} aria-busy="true" aria-label="Cargando proyectos">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="space-y-3 rounded-xl border border-gray-200 bg-white p-5">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <section className={GRID}>
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </section>
  )
}
