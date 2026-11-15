import { useNavigate } from 'react-router-dom'
import FormHeading from '../../components/projects/FormHeading'
import ProjectForm from '../../components/projects/ProjectForm'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { useProjectActions } from '../../hooks/useProjectActions'
import { useToast } from '../../hooks/useToast'

// Publicar proyecto (mockup FormularioProyecto). Al publicar lleva al detalle del proyecto nuevo.
export default function ProjectCreate() {
  const navigate = useNavigate()
  const toast = useToast()
  const actions = useProjectActions()

  const handleSubmit = async (project) => {
    try {
      const created = await actions.create(project)
      toast.success('Publicaste tu proyecto. Te avisaremos cuando llegue la primera propuesta.')
      navigate(`/projects/${created.id}`, { replace: true })
    } catch {
      // El mensaje ya queda en actions.error
    }
  }

  return (
    <main className="mx-auto w-full max-w-[1248px] px-4 pb-20 pt-[45px] md:px-6 md:pb-[120px] md:pt-[70px]">
      <Breadcrumbs items={[{ label: 'Mis proyectos', to: '/my-projects' }, { label: 'Publicar proyecto' }]} />
      <FormHeading kicker="NUEVO PROYECTO" title="Cuéntanos qué necesitas" emphasis="resolver." />
      <ProjectForm saving={actions.saving} serverError={actions.error} onSubmit={handleSubmit} onCancel={() => navigate(-1)} />
    </main>
  )
}
