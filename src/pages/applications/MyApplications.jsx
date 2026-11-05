import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'
import { useMyApplications } from '../../hooks/useMyApplications'
import { applicationService } from '../../services/applicationService'
import { APPLICATION_STATUS } from '../../utils/applicationStatus'
import { errorMessage } from '../../utils/errorMessage'
import { formatBudget, formatDate } from '../../utils/format'

export default function MyApplications() {
  const location = useLocation()
  const { data: applications, loading, error, reload } = useMyApplications()

  // Postulación que se quiere retirar; mientras sea null, la ventana de confirmación está cerrada
  const [toWithdraw, setToWithdraw] = useState(null)
  const [withdrawing, setWithdrawing] = useState(false)
  const [actionError, setActionError] = useState(null)

  const handleWithdraw = async () => {
    setWithdrawing(true)
    setActionError(null)
    try {
      await applicationService.withdraw(toWithdraw.id)
      setToWithdraw(null)
      reload()
    } catch (err) {
      setActionError(errorMessage(err))
      setToWithdraw(null)
    } finally {
      setWithdrawing(false)
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">Mis postulaciones</h1>

      {location.state?.message && (
        <p role="status" className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
          {location.state.message}
        </p>
      )}
      {actionError && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {actionError}
        </p>
      )}

      <div className="mt-6 space-y-4">
        {loading &&
          [1, 2, 3].map((n) => (
            <Card key={n} className="space-y-2">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
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
            title="Todavía no tienes postulaciones"
            message="Explora los proyectos abiertos y postula al que te interese."
            action={
              <Link to="/projects" className="font-semibold text-primary-600 hover:underline">
                Explorar proyectos →
              </Link>
            }
          />
        )}

        {applications?.map((application) => {
          const status = APPLICATION_STATUS[application.status]
          return (
            <Card key={application.id}>
              <div className="flex items-start justify-between gap-3">
                <Link
                  to={`/projects/${application.projectId}`}
                  className="font-semibold text-gray-900 hover:underline"
                >
                  {application.projectTitle}
                </Link>
                <Badge color={status?.color}>{status?.label ?? application.status}</Badge>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Tu precio: {formatBudget(application.proposedPrice)} · Enviada el {formatDate(application.createdAt)}
              </p>
              <p className="mt-3 line-clamp-2 text-sm text-gray-700">{application.message}</p>

              {application.status === 'PENDING' && (
                <div className="mt-4 flex justify-end">
                  <Button variant="secondary" onClick={() => setToWithdraw(application)}>
                    Retirar postulación
                  </Button>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      <ConfirmDialog
        open={toWithdraw !== null}
        title="¿Retirar tu postulación?"
        message={`Se eliminará tu postulación a "${toWithdraw?.projectTitle}". Podrás volver a postular mientras el proyecto siga abierto.`}
        confirmLabel="Sí, retirar"
        busy={withdrawing}
        onConfirm={handleWithdraw}
        onCancel={() => setToWithdraw(null)}
      />
    </main>
  )
}