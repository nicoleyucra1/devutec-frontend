import { useNavigate, useParams } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Skeleton from '../../components/ui/Skeleton'
import ErrorBox from '../../components/projects/ErrorBox'
import ProjectForm from '../../components/projects/ProjectForm'
import { useProject } from '../../hooks/useProject'
import { useProjectActions } from '../../hooks/useProjectActions'
import { useToast } from '../../hooks/useToast'

export default function ProjectEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { data: project, loading, error, reload } = useProject(id)
  const actions = useProjectActions()

  const handleSubmit = async (changes) => {
    try {
      await actions.update(id, changes)
      toast.success('Cambios guardados')
      navigate(`/projects/${id}`, { replace: true })
    } catch {
      // El mensaje ya queda en actions.error (por ejemplo 403 si no es el dueño)
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Breadcrumbs
        items={[
          { label: 'Mis proyectos', to: '/my-projects' },
          { label: project?.title, to: `/projects/${id}` },
          { label: 'Editar' },
        ]}
      />
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Editar proyecto</h1>

      {loading && (
        <Card className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-10 w-1/2" />
        </Card>
      )}
      {!loading && error && <ErrorBox message={error} onRetry={reload} />}
      {!loading && !error && (
        <ProjectForm
          key={project.id}
          initialProject={project}
          submitLabel="Guardar cambios"
          saving={actions.saving}
          serverError={actions.error}
          onSubmit={handleSubmit}
        />
      )}
    </main>
  )
}
