import { useState } from 'react'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { useParams } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'
import { useProject } from '../../hooks/useProject'
import { useProjectApplications } from '../../hooks/useProjectApplications'
import { useToast } from '../../hooks/useToast'
import { applicationService } from '../../services/applicationService'
import { APPLICATION_STATUS } from '../../utils/applicationStatus'
import { errorMessage } from '../../utils/errorMessage'
import { formatBudget, formatDate } from '../../utils/format'

// Textos de la ventana de confirmación según la acción
const CONFIRM_TEXT = {
  accept: {
    title: '¿Aceptar esta postulación?',
    message: (app) =>
      `Se creará un contrato con ${app.freelancerName} y se retendrán ${formatBudget(app.proposedPrice)} hasta que confirmes la entrega. Las demás postulaciones se rechazarán.`,
    label: 'Sí, aceptar',
  },
  reject: {
    title: '¿Rechazar esta postulación?',
    message: (app) => `${app.freelancerName} verá su postulación como rechazada.`,
    label: 'Sí, rechazar',
  },
}

export default function ProjectApplications() {
  const { id } = useParams()
  const toast = useToast()
  const { data: project } = useProject(id)
  const { data: applications, loading, error, reload } = useProjectApplications(id)

  // Acción pendiente de confirmar: { type: 'accept' | 'reject', application }
  const [pending, setPending] = useState(null)
  const [busy, setBusy] = useState(false)

  const handleConfirm = async () => {
    const { type, application } = pending
    setBusy(true)
    try {
      if (type === 'accept') {
        await applicationService.accept(application.id)
        toast.success('Postulación aceptada. Se creó el contrato.')
      } else {
        await applicationService.reject(application.id)
        toast.success('Postulación rechazada')
      }
      reload()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setBusy(false)
      setPending(null)
    }
  }

  const confirmText = pending && CONFIRM_TEXT[pending.type]

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumbs
        items={[
          { label: 'Mis proyectos', to: '/my-projects' },
          { label: project?.title, to: `/projects/${id}` },
          { label: 'Postulantes' },
        ]}
      />
      <h1 className=" text-2xl font-bold text-gray-900">Postulantes</h1>
      {project && <p className="mt-1 text-gray-500">{project.title}</p>}

      <div className="mt-6 space-y-4">
        {loading &&
          [1, 2].map((n) => (
            <Card key={n} className="space-y-2">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-full" />
            </Card>
          ))}

        {error && (
          <div className="text-red-700">
            <p>{error}</p>
            <Button variant="secondary" className="mt-3" onClick={reload}>
              Reintentar
            </Button>
          </div>
        )}

        {applications?.length === 0 && (
          <EmptyState
            title="Todavía nadie postuló"
            message="Cuando un freelancer postule a tu proyecto, aparecerá aquí."
          />
        )}

        {applications?.map((application) => {
          const status = APPLICATION_STATUS[application.status]
          return (
            <Card key={application.id}>
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-gray-900">{application.freelancerName}</p>
                <Badge color={status?.color}>{status?.label ?? application.status}</Badge>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Propone {formatBudget(application.proposedPrice)} · {formatDate(application.createdAt)}
              </p>
              <p className="mt-3 text-sm whitespace-pre-line text-gray-700">{application.message}</p>

              {application.status === 'PENDING' && (
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => setPending({ type: 'reject', application })}>
                    Rechazar
                  </Button>
                  <Button onClick={() => setPending({ type: 'accept', application })}>Aceptar</Button>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      <ConfirmDialog
        open={pending !== null}
        title={confirmText?.title}
        message={pending ? confirmText.message(pending.application) : ''}
        confirmLabel={confirmText?.label}
        busy={busy}
        onConfirm={handleConfirm}
        onCancel={() => setPending(null)}
      />
    </main>
  )
}