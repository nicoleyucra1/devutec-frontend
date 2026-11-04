import { Link, useNavigate } from 'react-router-dom'
import ProjectForm from '../../components/projects/ProjectForm'
import { useProjectActions } from '../../hooks/useProjectActions'
import { useToast } from '../../hooks/useToast'

export default function ProjectCreate() {
  const navigate = useNavigate()
  const toast = useToast()
  const actions = useProjectActions()

  const handleSubmit = async (project) => {
    try {
      const created = await actions.create(project)
      toast.success('Proyecto publicado')
      navigate(`/projects/${created.id}`, { replace: true })
    } catch {
      // El mensaje ya queda en actions.error
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link to="/my-projects" className="mb-4 inline-block text-sm font-semibold text-indigo-600 hover:underline">
        ← Mis proyectos
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Publicar proyecto</h1>
      <ProjectForm submitLabel="Publicar" saving={actions.saving} serverError={actions.error} onSubmit={handleSubmit} />
    </main>
  )
}
