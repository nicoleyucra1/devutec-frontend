import EmptyState from '../../components/ui/EmptyState'
import ErrorBox from '../../components/projects/ErrorBox'
import DashboardSection from '../../components/dashboard/DashboardSection'
import ItemList from '../../components/dashboard/ItemList'
import StatCard from '../../components/dashboard/StatCard'
import StatGrid from '../../components/dashboard/StatGrid'
import { usePayments } from '../../hooks/usePayments'
import { useProjects } from '../../hooks/useProjects'
import { PAYMENT_STATUS } from '../../utils/contractStatus'
import { formatBudget, formatDate } from '../../utils/format'
import { countBy, latest, sumBy } from '../../utils/stats'

export default function AdminDashboard() {
  // Solo se necesita el total, así que se pide una página de 1 elemento
  const projects = useProjects({ page: 1, size: 1 })
  const payments = usePayments()

  const counts = countBy(payments.data ?? [], 'status')
  const totalOf = (status) => sumBy(payments.data ?? [], 'amount', (payment) => payment.status === status)
  const paymentsHint = (status) => `${counts[status] ?? 0} pago${counts[status] === 1 ? '' : 's'}`

  return (
    <>
      <StatGrid>
        <StatCard label="Proyectos en la plataforma" value={projects.data?.totalElements ?? '—'} loading={projects.loading} />
        <StatCard label="En garantía" value={formatBudget(totalOf('HELD'))} hint={paymentsHint('HELD')} loading={payments.loading} />
        <StatCard label="Liberado" value={formatBudget(totalOf('RELEASED'))} hint={paymentsHint('RELEASED')} loading={payments.loading} />
        <StatCard
          label="Reembolsado"
          value={formatBudget(totalOf('REFUNDED'))}
          hint={paymentsHint('REFUNDED')}
          loading={payments.loading}
        />
      </StatGrid>

      <DashboardSection title="Últimos pagos" linkTo="/projects" linkLabel="Ver proyectos →">
        {payments.loading && <ItemList loading />}
        {payments.error && <ErrorBox message={payments.error} onRetry={payments.reload} />}
        {payments.data?.length === 0 && <EmptyState title="Todavía no hay pagos" />}
        {payments.data?.length > 0 && (
          <ItemList
            items={latest(payments.data, 'createdAt', 10).map((payment) => ({
              key: payment.id,
              title: `Pago #${payment.id}`,
              subtitle: formatDate(payment.createdAt),
              detail: formatBudget(payment.amount),
              status: PAYMENT_STATUS[payment.status]?.label ?? payment.status,
              statusColor: PAYMENT_STATUS[payment.status]?.color,
            }))}
          />
        )}
      </DashboardSection>
    </>
  )
}
