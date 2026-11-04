import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Skeleton from '../../components/ui/Skeleton'
import ButtonLink from '../../components/projects/ButtonLink'
import ErrorBox from '../../components/projects/ErrorBox'
import ProjectMeta from '../../components/projects/ProjectMeta'
import ProjectStatusBadge from '../../components/projects/ProjectStatusBadge'
import SkillList from '../../components/projects/SkillList'
import { useProject } from '../../hooks/useProject'
import { useProjectActions } from '../../hooks/useProjectActions'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { formatBudget, formatDate } from '../../utils/format'

function BackLink() {
  return (
    <Link to="/projects" className="mb-4 inline-block text-sm font-semibold text-indigo-600 hover:underline">
      ← Volver a proyectos
    </Link>
  )
}

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()
  const { data: project, loading, error, reload } = useProject(id)
  const actions = useProjectActions()
  const [confirmOpen, setConfirmOpen] = useState(false)

  // El id del usuario viene de la sesión (AuthProvider lo obtiene de GET /users/me al iniciar sesión)
  const isOwner = Boolean(user?.id && project && user.id === project.clientId)
  const canManage = isOwner || user?.rol === 'ADMIN'

  const handleDelete = async () => {
    try {
      await actions.remove(id)
      toast.success('Proyecto eliminado')
      navigate(user?.rol === 'CLIENT' ? '/my-projects' : '/projects', { replace: true })
    } catch {
      setConfirmOpen(false)
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10" aria-busy="true">
        <BackLink />
        <Card className="space-y-4">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-20 w-full" />
        </Card>
      </main>
    )
  }

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <BackLink />
        <ErrorBox message={error} onRetry={reload} />
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <BackLink />

      <Card className="space-y-6">
        <header className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
          <ProjectStatusBadge status={project.status} />
        </header>

        <ProjectMeta
          items={[
            { label: 'Presupuesto', value: formatBudget(project.budget) },
            { label: 'Fecha límite', value: formatDate(project.deadline) },
            { label: 'Publicado', value: formatDate(project.createdAt) },
            ...(project.location ? [{ label: 'Ubicación', value: project.location }] : []),
          ]}
        />

        <section>
          <h2 className="mb-1 text-sm font-semibold text-gray-900">Descripción</h2>
          <p className="whitespace-pre-line text-gray-600">{project.description || 'Sin descripción.'}</p>
        </section>

        {project.skills?.length > 0 && (
          <section>
            <h2 className="mb-2 text-sm font-semibold text-gray-900">Habilidades requeridas</h2>
            <SkillList skills={project.skills} />
          </section>
        )}

        {actions.error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {actions.error}
          </p>
        )}

        <footer className="flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4">
          {user?.rol === 'FREELANCER' && project.status === 'OPEN' && (
            <ButtonLink to={`/projects/${project.id}/apply`}>Postular</ButtonLink>
          )}
          {isOwner && (
            <ButtonLink to={`/projects/${project.id}/applications`} variant="secondary">
              Ver postulaciones
            </ButtonLink>
          )}
          {canManage && (
            <>
              <ButtonLink to={`/projects/${project.id}/edit`} variant="secondary">
                Editar
              </ButtonLink>
              {/* La API solo permite eliminar proyectos abiertos y sin contratos */}
              {project.status === 'OPEN' && (
                <Button variant="danger" onClick={() => setConfirmOpen(true)}>
                  Eliminar
                </Button>
              )}
            </>
          )}
        </footer>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        title="¿Eliminar proyecto?"
        message={`Se eliminará "${project.title}" junto con sus postulaciones. Esta acción no se puede deshacer.`}
        confirmLabel="Sí, eliminar"
        busy={actions.saving}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </main>
  )
}
