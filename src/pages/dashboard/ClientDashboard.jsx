import EmptyState from '../../components/ui/EmptyState'
import ButtonLink from '../../components/projects/ButtonLink'
import ErrorBox from '../../components/projects/ErrorBox'
import ProjectGrid from '../../components/projects/ProjectGrid'
import DashboardSection from '../../components/dashboard/DashboardSection'
import ItemList from '../../components/dashboard/ItemList'
import StatCard from '../../components/dashboard/StatCard'
import StatGrid from '../../components/dashboard/StatGrid'
import { useMyContracts } from '../../hooks/useContracts'
import { useMyProjects } from '../../hooks/useMyProjects'
import { CONTRACT_STATUS } from '../../utils/contractStatus'
import { formatBudget } from '../../utils/format'
import { countBy, latest, sumBy } from '../../utils/stats'

function toItem(contract) {
  return {
    key: contract.id,
    to: `/contracts/${contract.id}`,
    title: contract.projectTitle,
    subtitle: contract.freelancerName,
    detail: formatBudget(contract.amount),
    status: CONTRACT_STATUS[contract.status]?.label ?? contract.status,
    statusColor: CONTRACT_STATUS[contract.status]?.color,
  }
}

export default function ClientDashboard() {
  const projects = useMyProjects({ page: 1, size: 3 })
  const contracts = useMyContracts()

  const counts = countBy(contracts.data ?? [], 'status')
  const held = sumBy(contracts.data ?? [], 'amount', (contract) => contract.paymentStatus === 'HELD')
  const delivered = (contracts.data ?? []).filter((contract) => contract.status === 'DELIVERED')

  return (
    <>
      <StatGrid>
        <StatCard label="Proyectos publicados" value={projects.data?.totalElements ?? '—'} loading={projects.loading} />
        <StatCard label="Contratos en curso" value={counts.IN_PROGRESS ?? 0} loading={contracts.loading} />
        <StatCard
          label="Entregas por confirmar"
          value={counts.DELIVERED ?? 0}
          hint="El freelancer ya entregó el trabajo"
          loading={contracts.loading}
        />
        <StatCard
          label="Pagos en garantía"
          value={formatBudget(held)}
          hint="Se liberan cuando confirmas la entrega"
          loading={contracts.loading}
        />
      </StatGrid>

      {contracts.error && (
        <div className="mt-8">
          <ErrorBox message={contracts.error} status={contracts.status} onRetry={contracts.reload} compact />
        </div>
      )}

      {delivered.length > 0 && (
        <DashboardSection title="Entregas por confirmar">
          <ItemList items={delivered.map(toItem)} />
        </DashboardSection>
      )}

      {!contracts.error && (
        <DashboardSection title="Contratos recientes" linkTo="/contracts" linkLabel="Ver todos →">
          {contracts.loading && <ItemList loading />}
          {contracts.data?.length === 0 && (
            <EmptyState
              title="Todavía no tienes contratos"
              message="Cuando aceptes una postulación, el contrato aparecerá aquí."
            />
          )}
          {contracts.data?.length > 0 && <ItemList items={latest(contracts.data, 'startedAt').map(toItem)} />}
        </DashboardSection>
      )}

      <DashboardSection title="Tus proyectos recientes" linkTo="/my-projects" linkLabel="Ver todos →">
        {projects.loading && <ProjectGrid loading />}
        {projects.error && <ErrorBox message={projects.error} status={projects.status} onRetry={projects.reload} compact />}
        {projects.data?.content.length === 0 && (
          <EmptyState
            title="Todavía no has publicado proyectos"
            message="Cuenta qué necesitas y recibe propuestas de estudiantes de UTEC."
            action={<ButtonLink to="/projects/new">Publicar mi primer proyecto</ButtonLink>}
          />
        )}
        {projects.data?.content.length > 0 && <ProjectGrid projects={projects.data.content} />}
      </DashboardSection>
    </>
  )
}
