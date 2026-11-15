import { Link } from 'react-router-dom'
import Card from '../ui/Card'
import ProjectStatusBadge from './ProjectStatusBadge'
import ProjectMeta from './ProjectMeta'
import SkillList from './SkillList'
import { formatBudget, formatDate } from '../../utils/format'
import { projectShape } from '../../utils/propShapes'

// Toda la tarjeta lleva al proyecto: el link del título se estira sobre la tarjeta con un ::after
// (sigue siendo un solo link, así que el lector de pantalla y el Tab lo leen una vez, con el título)
export default function ProjectCard({ project }) {
  return (
    <Card className="group relative flex flex-col gap-3 transition-shadow focus-within:ring-2 focus-within:ring-ink/20 hover:shadow-md">
      <header className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900">
          <Link
            to={`/projects/${project.id}`}
            className="after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:outline-none group-hover:underline"
          >
            {project.title}
          </Link>
        </h3>
        <ProjectStatusBadge status={project.status} />
      </header>
      {project.description && <p className="line-clamp-3 text-sm text-gray-600">{project.description}</p>}
      <ProjectMeta
        items={[
          { label: 'Presupuesto', value: formatBudget(project.budget) },
          { label: 'Fecha límite', value: formatDate(project.deadline) },
        ]}
      />
      <SkillList skills={project.skills} />
    </Card>
  )
}

ProjectCard.propTypes = {
  project: projectShape.isRequired,
}
