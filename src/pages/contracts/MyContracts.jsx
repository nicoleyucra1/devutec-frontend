import { Link } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'
import { useAuth } from '../../hooks/useAuth'
import { useMyContracts } from '../../hooks/useContracts'
import { CONTRACT_STATUS, PAYMENT_STATUS } from '../../utils/contractStatus'
import { formatBudget, formatDate } from '../../utils/format'

export default function MyContracts() {
  const { user } = useAuth()
  const { data: contracts, loading, error, reload } = useMyContracts()
  const isClient = user?.rol === 'CLIENT'

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">Mis contratos</h1>

      <div className="mt-6 space-y-4">
        {loading &&
          [1, 2].map((n) => (
            <Card key={n} className="space-y-2">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
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

        {contracts?.length === 0 && (
          <EmptyState
            title="Todavía no tienes contratos"
            message={
              isClient
                ? 'Cuando aceptes una postulación en uno de tus proyectos, el contrato aparecerá aquí.'
                : 'Cuando un cliente acepte una de tus postulaciones, el contrato aparecerá aquí.'
            }
          />
        )}

        {contracts?.map((contract) => {
          const status = CONTRACT_STATUS[contract.status]
          const payment = PAYMENT_STATUS[contract.paymentStatus]
          return (
            <Link key={contract.id} to={`/contracts/${contract.id}`} className="block">
              <Card className="transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-gray-900">{contract.projectTitle}</p>
                  <Badge color={status?.color}>{status?.label ?? contract.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {isClient ? `Freelancer: ${contract.freelancerName}` : 'Tú eres el freelancer'} · Desde el{' '}
                  {formatDate(contract.startedAt)}
                </p>
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-700">
                  <span className="font-semibold">{formatBudget(contract.amount)}</span>
                  <Badge color={payment?.color}>{payment?.label ?? contract.paymentStatus}</Badge>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </main>
  )
}