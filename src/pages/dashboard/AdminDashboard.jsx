import EmptyState from '../../components/ui/EmptyState'
import ErrorBox from '../../components/projects/ErrorBox'
import DashboardSection from '../../components/dashboard/DashboardSection'
import ItemList from '../../components/dashboard/ItemList'
import StatCard from '../../components/dashboard/StatCard'
import StatGrid from '../../components/dashboard/StatGrid'
import { usePayments } from '../../hooks/usePayments'
import { useReports } from '../../hooks/useReports'
import { REPORT_REASON_LABELS } from '../../services/reportService'
import { useProjects } from '../../hooks/useProjects'
import { PAYMENT_STATUS, paymentCode } from '../../utils/contractStatus'
import { formatBudget, formatDate } from '../../utils/format'
import { countBy, latest, sumBy } from '../../utils/stats'

export default function AdminDashboard() {
  // Solo se necesita el total, así que se pide una página de 1 elemento
  const projects = useProjects({ page: 1, size: 1 })
  const payments = usePayments()
  const reports = useReports()
  const openReports = (reports.data ?? []).filter((report) => report.status === 'OPEN')

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

      <DashboardSection title="Últimos pagos" linkTo="/admin/payments" linkLabel="Ver todos los pagos →">
        {payments.loading && <ItemList loading />}
        {payments.error && <ErrorBox message={payments.error} status={payments.status} onRetry={payments.reload} compact />}
        {payments.data?.length === 0 && <EmptyState title="Todavía no hay pagos" />}
        {payments.data?.length > 0 && (
          <ItemList
            items={latest(payments.data, 'createdAt', 10).map((payment) => ({
              key: payment.id,
              title: payment.projectTitle ?? paymentCode(payment.id),
              subtitle: `${paymentCode(payment.id)} · ${formatDate(payment.createdAt)}`,
              detail: formatBudget(payment.amount),
              status: PAYMENT_STATUS[payment.status]?.label ?? payment.status,
              statusColor: PAYMENT_STATUS[payment.status]?.color,
            }))}
          />
        )}
      </DashboardSection>

      <DashboardSection title="Reportes pendientes" linkTo="/admin/reports" linkLabel="Ver todos los reportes →">
        {reports.loading && <ItemList loading />}
        {reports.error && <ErrorBox message={reports.error} status={reports.status} onRetry={reports.reload} compact />}
        {reports.data && openReports.length === 0 && <EmptyState title="No hay reportes pendientes" />}
        {openReports.length > 0 && (
          <ItemList
            items={openReports.slice(0, 5).map((report) => ({
              key: report.id,
              title: report.reportedName,
              subtitle: `${report.place} · ${formatDate(report.createdAt)}`,
              detail: `${report.reportedReports} en total`,
              status: REPORT_REASON_LABELS[report.reason] ?? report.reason,
              statusColor: report.reason === 'FILTRO_AUTOMATICO' ? 'gray' : 'red',
            }))}
          />
        )}
      </DashboardSection>
    </>
  )
}
