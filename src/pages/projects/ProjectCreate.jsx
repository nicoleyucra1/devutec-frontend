import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormHeading from '../../components/projects/FormHeading'
import ProjectAssistant from '../../components/projects/ProjectAssistant'
import ProjectForm from '../../components/projects/ProjectForm'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { useProjectActions } from '../../hooks/useProjectActions'
import { useToast } from '../../hooks/useToast'

// Publicar proyecto. Por defecto el cliente conversa con el asistente IA, que arma el proyecto;
// después lo revisa en el formulario ya lleno. También puede llenarlo a mano desde el inicio.
export default function ProjectCreate() {
  const navigate = useNavigate()
  const toast = useToast()
  const actions = useProjectActions()
  // assistant: conversando · form: formulario (vacío o con el borrador del asistente)
  const [mode, setMode] = useState('assistant')
  const [draft, setDraft] = useState(null)

  const handleSubmit = async (project) => {
    try {
      const created = await actions.create(project)
      toast.success('Publicaste tu proyecto. Te avisaremos cuando llegue la primera propuesta.')
      navigate(`/projects/${created.id}`, { replace: true })
    } catch {
      // El mensaje ya queda en actions.error
    }
  }

  const goToForm = (fromAssistant) => {
    setDraft(fromAssistant ?? null)
    setMode('form')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className="mx-auto w-full max-w-[1248px] px-4 pb-20 pt-[45px] md:px-6 md:pb-[120px] md:pt-[70px]">
      <Breadcrumbs items={[{ label: 'Mis proyectos', to: '/my-projects' }, { label: 'Publicar proyecto' }]} />
      <FormHeading kicker="NUEVO PROYECTO" title="Cuéntanos qué necesitas" emphasis="resolver." />
      {mode === 'assistant' ? (
        <ProjectAssistant onContinue={goToForm} onManual={() => goToForm(null)} />
      ) : (
        <ProjectForm
          key={draft ? 'draft' : 'manual'}
          draft={draft}
          saving={actions.saving}
          serverError={actions.error}
          onSubmit={handleSubmit}
          onCancel={() => (draft ? setMode('assistant') : navigate(-1))}
        />
      )}
    </main>
  )
}
