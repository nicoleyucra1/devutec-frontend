import { useNavigate, useParams } from 'react-router-dom'
import ErrorBox from '../../components/projects/ErrorBox'
import FormHeading from '../../components/projects/FormHeading'
import ProjectForm from '../../components/projects/ProjectForm'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import LoadingNotice from '../../components/ui/LoadingNotice'
import Skeleton from '../../components/ui/Skeleton'
import { useProject } from '../../hooks/useProject'
import { useProjectActions } from '../../hooks/useProjectActions'
import { useToast } from '../../hooks/useToast'
import { projectCode } from '../../utils/contractStatus'

// Editar proyecto: el mismo formulario con los datos cargados. Solo el dueño o el admin (el backend lo valida).
export default function ProjectEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { data: project, loading, error, status, reload } = useProject(id)
  const actions = useProjectActions()

  const handleSubmit = async (changes) => {
    try {
      await actions.update(id, changes)
      toast.success('Guardaste los cambios del proyecto')
      navigate(`/projects/${id}`, { replace: true })
    } catch {
      // El mensaje ya queda en actions.error (por ejemplo 403 si no es el dueño)
    }
  }

  return (
    <main className="mx-auto w-full max-w-[1248px] px-4 pb-20 pt-[45px] md:px-6 md:pb-[120px] md:pt-[70px]">
      <LoadingNotice loading={loading} what="el proyecto" />
      <Breadcrumbs
        items={[
          { label: 'Mis proyectos', to: '/my-projects' },
          { label: project?.title, to: `/projects/${id}` },
          { label: 'Editar' },
        ]}
      />
      <FormHeading kicker={`EDITAR PROYECTO · ${projectCode(id)}`} title="Actualiza los detalles" emphasis="del proyecto." />

      {loading && (
        <div aria-busy="true" className="grid items-start gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <Skeleton className="h-[560px] w-full rounded-[17px]" />
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      )}
      {error && <ErrorBox message={error} status={status} onRetry={reload} />}
      {project && (
        <ProjectForm
          key={project.id}
          initialProject={project}
          saving={actions.saving}
          serverError={actions.error}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/projects/${id}`)}
        />
      )}
    </main>
  )
}
