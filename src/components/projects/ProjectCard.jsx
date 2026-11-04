import { Link } from 'react-router-dom'
import Card from '../ui/Card'
import ProjectStatusBadge from './ProjectStatusBadge'
import ProjectMeta from './ProjectMeta'
import SkillList from './SkillList'
import { formatBudget, formatDate } from '../../utils/format'

export default function ProjectCard({ project }) {
  return (
    <Card className="flex flex-col gap-3 transition-shadow hover:shadow-md">
      <header className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900">
          <Link to={`/projects/${project.id}`} className="hover:underline">
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
