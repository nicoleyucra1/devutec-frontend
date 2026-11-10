import EmptyState from '../../components/ui/EmptyState'
import ButtonLink from '../../components/projects/ButtonLink'
import ErrorBox from '../../components/projects/ErrorBox'
import DashboardSection from '../../components/dashboard/DashboardSection'
import ItemList from '../../components/dashboard/ItemList'
import StatCard from '../../components/dashboard/StatCard'
import StatGrid from '../../components/dashboard/StatGrid'
import { useMyApplications } from '../../hooks/useMyApplications'
import { useMyContracts } from '../../hooks/useContracts'
import { useMyFreelancerProfile } from '../../hooks/useMyFreelancerProfile'
import { APPLICATION_STATUS } from '../../utils/applicationStatus'
import { CONTRACT_STATUS } from '../../utils/contractStatus'
import { formatBudget } from '../../utils/format'
import { countBy, latest, sumBy } from '../../utils/stats'

const ACTIVE = ['IN_PROGRESS', 'DELIVERED']

// La calificación viene del perfil; si todavía no tiene reseñas llega vacía
function ratingText(profile) {
  if (!profile?.calificacionPromedio) return 'Sin reseñas'
  return `${Number(profile.calificacionPromedio).toFixed(1)} ★`
}

export default function FreelancerDashboard() {
  const applications = useMyApplications()
  const contracts = useMyContracts()
  const profile = useMyFreelancerProfile()

  const applicationCounts = countBy(applications.data ?? [], 'status')
  const contractCounts = countBy(contracts.data ?? [], 'status')
  const earned = sumBy(contracts.data ?? [], 'amount', (contract) => contract.paymentStatus === 'RELEASED')
  const active = (contracts.data ?? []).filter((contract) => ACTIVE.includes(contract.status))
  const waiting = contractCounts.DELIVERED ?? 0

  return (
    <>
      <StatGrid>
        <StatCard
          label="Postulaciones pendientes"
          value={applicationCounts.PENDING ?? 0}
          hint="Esperando respuesta del cliente"
          loading={applications.loading}
        />
        <StatCard
          label="Contratos activos"
          value={active.length}
          hint={`${waiting} esperando que el cliente confirme`}
          loading={contracts.loading}
        />
        <StatCard label="Ganado" value={formatBudget(earned)} hint="Pagos ya liberados" loading={contracts.loading} />
        <StatCard
          label="Tu calificación"
          value={profile.error ? '—' : ratingText(profile.data)}
          hint={profile.error ? 'Completa tu perfil para recibir reseñas' : 'Promedio de las reseñas de tus clientes'}
          loading={profile.loading}
        />
      </StatGrid>

      <DashboardSection title="Contratos activos" linkTo="/contracts" linkLabel="Ver todos →">
        {contracts.loading && <ItemList loading />}
        {contracts.error && <ErrorBox message={contracts.error} status={contracts.status} onRetry={contracts.reload} />}
        {contracts.data && active.length === 0 && (
          <EmptyState
            title="No tienes contratos activos"
            message="Cuando un cliente acepte tu postulación, el contrato aparecerá aquí."
          />
        )}
        {active.length > 0 && (
          <ItemList
            items={latest(active, 'startedAt', active.length).map((contract) => ({
              key: contract.id,
              to: `/contracts/${contract.id}`,
              title: contract.projectTitle,
              detail: formatBudget(contract.amount),
              status: CONTRACT_STATUS[contract.status]?.label ?? contract.status,
              statusColor: CONTRACT_STATUS[contract.status]?.color,
            }))}
          />
        )}
      </DashboardSection>

      <DashboardSection title="Postulaciones recientes" linkTo="/my-applications" linkLabel="Ver todas →">
        {applications.loading && <ItemList loading />}
        {applications.error && <ErrorBox message={applications.error} status={applications.status} onRetry={applications.reload} />}
        {applications.data?.length === 0 && (
          <EmptyState
            title="Todavía no te has postulado"
            message="Explora los proyectos abiertos y envía tu propuesta."
            action={<ButtonLink to="/projects">Explorar proyectos</ButtonLink>}
          />
        )}
        {applications.data?.length > 0 && (
          <ItemList
            items={latest(applications.data, 'createdAt').map((application) => ({
              key: application.id,
              to: `/projects/${application.projectId}`,
              title: application.projectTitle,
              detail: formatBudget(application.proposedPrice),
              status: APPLICATION_STATUS[application.status]?.label ?? application.status,
              statusColor: APPLICATION_STATUS[application.status]?.color,
            }))}
          />
        )}
      </DashboardSection>
    </>
  )
}
