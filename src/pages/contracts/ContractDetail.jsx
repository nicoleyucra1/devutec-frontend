import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Skeleton from '../../components/ui/Skeleton'
import { useAuth } from '../../hooks/useAuth'
import { useContract } from '../../hooks/useContracts'
import { useToast } from '../../hooks/useToast'
import { contractService } from '../../services/contractService'
import { CONTRACT_STATUS, PAYMENT_STATUS } from '../../utils/contractStatus'
import { errorMessage } from '../../utils/errorMessage'
import { formatBudget, formatDate } from '../../utils/format'

//Cada acción del contrato: qué endpoint llama, qué avisa al terminar y, si es delicada, qué pregunta antes
const ACTIONS = {
  deliver: {
    run: contractService.deliver,
    success: 'Marcaste el trabajo como entregado. El cliente debe confirmarlo.',
  },
  confirm: {
    run: contractService.confirm,
    success: 'Entrega confirmada. El pago fue liberado al freelancer.',
    confirm: {
      title: '¿Confirmar la entrega?',
      message: (c) => `Se liberarán ${formatBudget(c.amount)} a ${c.freelancerName}. Esta acción no se puede deshacer.`,
      label: 'Sí, confirmar y pagar',
    },
  },
  cancel: {
    run: contractService.cancel,
    success: 'Contrato cancelado. El pago fue reembolsado.',
    confirm: {
      title: '¿Cancelar el contrato?',
      message: (c) =>
        `Se te devolverán ${formatBudget(c.amount)} y el proyecto volverá a estar abierto para recibir postulaciones.`,
      label: 'Sí, cancelar',
    },
  },
}

export default function ContractDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const toast = useToast()
  const { data: contract, loading, error, reload } = useContract(id)

  const [busy, setBusy] = useState(false)
  //Acción que espera confirmación en la ventana: 'confirm' o 'cancel'
  const [pending, setPending] = useState(null)

  const runAction = async (type) => {
    setBusy(true)
    try {
      await ACTIONS[type].run(id)
      toast.success(ACTIONS[type].success)
      reload()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setBusy(false)
      setPending(null)
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Card className="space-y-3">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-16 w-full" />
        </Card>
      </main>
    )
  }

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-red-700">{error}</p>
        <Link to="/contracts" className="mt-4 inline-block text-primary-600 hover:underline">
          Volver a mis contratos
        </Link>
      </main>
    )
  }

  //El rol en este contrato se decide comparando el id de la sesión con los ids que manda el backend
  const isClient = user?.id === contract.clientId
  const isFreelancer = user?.id === contract.freelancerUserId
  const status = CONTRACT_STATUS[contract.status]
  const payment = PAYMENT_STATUS[contract.paymentStatus]
  const confirmText = pending && ACTIONS[pending].confirm

  //Qué botones ve cada participante según el estado del contrato
  const canDeliver = isFreelancer && contract.status === 'IN_PROGRESS'
  const canCancel = isClient && contract.status === 'IN_PROGRESS'
  const canConfirm = isClient && contract.status === 'DELIVERED'

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link to="/contracts" className="text-sm text-primary-600 hover:underline">
        ← Volver a mis contratos
      </Link>

      <Card className="mt-4 space-y-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{contract.projectTitle}</h1>
            <Link to={`/projects/${contract.projectId}`} className="text-sm text-primary-600 hover:underline">
              Ver proyecto
            </Link>
          </div>
          <Badge color={status?.color}>{status?.label ?? contract.status}</Badge>
        </header>

        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <dt className="text-xs text-gray-500">Freelancer</dt>
            <dd className="font-semibold text-gray-900">{contract.freelancerName}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Monto</dt>
            <dd className="font-semibold text-gray-900">{formatBudget(contract.amount)}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Inicio</dt>
            <dd className="font-semibold text-gray-900">{formatDate(contract.startedAt)}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Entrega</dt>
            <dd className="font-semibold text-gray-900">
              {contract.deliveredAt ? formatDate(contract.deliveredAt) : 'Pendiente'}
            </dd>
          </div>
        </dl>

        <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700">
          <Badge color={payment?.color}>{payment?.label ?? contract.paymentStatus}</Badge>
          <span>
            {contract.paymentStatus === 'HELD' && 'DevUTEC guarda el pago hasta que el cliente confirme la entrega.'}
            {contract.paymentStatus === 'RELEASED' && 'El pago ya fue entregado al freelancer.'}
            {contract.paymentStatus === 'REFUNDED' && 'El pago fue devuelto al cliente.'}
          </span>
        </div>

        {(canDeliver || canCancel || canConfirm) && (
          <footer className="flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4">
            {canDeliver && (
              <Button loading={busy} onClick={() => runAction('deliver')}>
                {busy ? 'Enviando...' : 'Marcar como entregado'}
              </Button>
            )}
            {canCancel && (
              <Button variant="danger" onClick={() => setPending('cancel')}>
                Cancelar contrato
              </Button>
            )}
            {canConfirm && (
              <Button onClick={() => setPending('confirm')}>Confirmar entrega y liberar pago</Button>
            )}
          </footer>
        )}
      </Card>

      <ConfirmDialog
        open={pending !== null}
        title={confirmText?.title}
        message={pending ? confirmText.message(contract) : ''}
        confirmLabel={confirmText?.label}
        busy={busy}
        onConfirm={() => runAction(pending)}
        onCancel={() => setPending(null)}
      />
    </main>
  )
}