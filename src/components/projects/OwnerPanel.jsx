import PropTypes from 'prop-types'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ButtonLink from './ButtonLink'
import DeleteProjectDialog from './DeleteProjectDialog'
import Button from '../ui/Button'
import Skeleton from '../ui/Skeleton'
import { useAsync } from '../../hooks/useAsync'
import { useMyContracts } from '../../hooks/useContracts'
import { useProjectActions } from '../../hooks/useProjectActions'
import { useToast } from '../../hooks/useToast'
import { applicationService } from '../../services/applicationService'
import { errorMessage } from '../../utils/errorMessage'
import { formatBudget, timeAgo } from '../../utils/format'
import { projectShape } from '../../utils/propShapes'

// Resumen de las propuestas: cuántas hay y cuánto piden en promedio
function proposalsText(applications) {
  if (!applications) return null
  if (applications.length === 0) return 'Todavía no recibiste propuestas. Te avisaremos por correo cuando llegue la primera.'
  const average = applications.reduce((sum, item) => sum + Number(item.proposedPrice || 0), 0) / applications.length
  const count = applications.length === 1 ? 'Recibiste 1 propuesta' : `Recibiste ${applications.length} propuestas`
  return `${count}. El precio promedio es ${formatBudget(average)}.`
}

// Panel del dueño del proyecto (o del admin): propuestas recibidas, contrato si ya hay uno, editar y eliminar.
// Las propuestas solo las puede ver el cliente dueño; el admin ve solo editar y eliminar.
export default function OwnerPanel({ project, isOwner }) {
  const navigate = useNavigate()
  const toast = useToast()
  const actions = useProjectActions()
  const [deleting, setDeleting] = useState(false)
  const [conflict, setConflict] = useState(null)

  const applications = useAsync(
    (options) => (isOwner ? applicationService.getByProject(project.id, options) : Promise.resolve(null)),
    [project.id, isOwner],
  )
  const contracts = useMyContracts()
  // El contrato más reciente del proyecto (uno cancelado igual impide eliminarlo)
  const contract = (contracts.data ?? []).filter((item) => item.projectId === project.id).sort((a, b) => b.id - a.id)[0] ?? null
  const activeContract = contract && contract.status !== 'CANCELLED' ? contract : null
  const count = applications.data?.length

  const closeDelete = () => {
    setDeleting(false)
    setConflict(null)
  }

  const handleDelete = async () => {
    try {
      await actions.remove(project.id)
      toast.success(`Eliminaste “${project.title}”`)
      navigate('/my-projects', { replace: true })
    } catch (error) {
      if (error?.response?.status === 409) setConflict(error.response.data?.message ?? 'Este proyecto ya no se puede eliminar.')
      else {
        toast.error(errorMessage(error))
        closeDelete()
      }
    }
  }

  return (
    <aside className="rounded-[17px] border border-line bg-surface p-7 lg:sticky lg:top-24">
      <p className="text-[11px] font-semibold tracking-[0.13em]">GESTIONAR PROYECTO</p>
      <h2 className="my-3 text-[26px] font-semibold leading-tight tracking-[-0.02em]">Publicado {timeAgo(project.createdAt)}</h2>
      {isOwner &&
        (applications.loading ? (
          <Skeleton className="mb-6 h-10 w-full" />
        ) : (
          <p className="mb-6 text-[13px] leading-relaxed text-muted">{proposalsText(applications.data) ?? 'No pudimos cargar las propuestas.'}</p>
        ))}

      <div className="grid gap-2">
        {activeContract && (
          <ButtonLink to={`/contracts/${activeContract.id}`} className="w-full">
            Ver contrato
          </ButtonLink>
        )}
        {isOwner && (
          <ButtonLink to={`/projects/${project.id}/applications`} variant={activeContract ? 'secondary' : 'primary'} className="w-full">
            Ver postulaciones
            {count > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-lime px-1.5 text-[11px] tabular-nums text-ink">{count}</span>
            )}
          </ButtonLink>
        )}
        <ButtonLink to={`/projects/${project.id}/edit`} variant="secondary" className="w-full">
          Editar proyecto
        </ButtonLink>
        {project.status !== 'DONE' && (
          <Button variant="danger" onClick={() => setDeleting(true)} className="w-full">
            Eliminar proyecto
          </Button>
        )}
      </div>

      <DeleteProjectDialog
        project={deleting ? { ...project, applications: applications.data } : null}
        contract={contract}
        busy={actions.saving}
        conflict={conflict}
        onConfirm={handleDelete}
        onClose={closeDelete}
      />
    </aside>
  )
}

OwnerPanel.propTypes = {
  project: projectShape.isRequired,
  // false para el admin que no es dueño: no puede ver las propuestas
  isOwner: PropTypes.bool,
}
