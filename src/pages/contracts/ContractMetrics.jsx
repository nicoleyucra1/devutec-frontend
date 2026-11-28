import { useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import ButtonLink from '../../components/projects/ButtonLink'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import ErrorState from '../../components/ui/ErrorState'
import LoadingNotice from '../../components/ui/LoadingNotice'
import IntegrationGuide from '../../components/metrics/IntegrationGuide'
import MetricsPanel from '../../components/metrics/MetricsPanel'
import { useAsync } from '../../hooks/useAsync'
import { useAuth } from '../../hooks/useAuth'
import { useContract } from '../../hooks/useContracts'
import { metricsService } from '../../services/metricsService'

const RANGES = [7, 30, 90]
const TABS = [
  { key: 'panel', label: 'Panel' },
  { key: 'integrar', label: 'Cómo integrarlo' },
]

// Métricas de la web del cliente (Fase 7 del plan): el cliente ve sus visitas y pedidos; el estudiante instala
// el script con «Cómo integrarlo». Solo para proyectos web.
export default function ContractMetrics() {
  const { id } = useParams()
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const [days, setDays] = useState(30)
  const contract = useContract(id)
  const dashboard = useAsync((options) => metricsService.getDashboard(id, days, options), [id, days])
  const setup = useAsync((options) => metricsService.getSetup(id, options), [id])

  const isClient = user?.id === contract.data?.clientId
  const tab = params.get('tab') ?? (isClient || dashboard.data?.installed ? 'panel' : 'integrar')
  const goTo = (next) => setParams({ tab: next }, { replace: true })
  const freelancerName = contract.data?.freelancerName

  const shell = (children) => <main className="mx-auto w-full max-w-[1200px] px-5 pb-20 pt-8 lg:px-6">{children}</main>

  if (contract.error || setup.error) {
    return shell(<ErrorState title="No pudimos cargar las métricas" message={contract.error ?? setup.error} onRetry={() => { contract.reload(); setup.reload() }} />)
  }
  if (contract.loading || setup.loading) {
    return shell(<LoadingNotice loading what="las métricas" />)
  }
  if (!setup.data.webProject) {
    return shell(
      <>
        <Breadcrumbs items={[{ label: 'Contratos', to: '/contracts' }, { label: contract.data.projectTitle, to: `/contracts/${id}` }, { label: 'Métricas' }]} />
        <div className="mt-8 rounded-2xl border border-line bg-surface p-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Las métricas son para proyectos web</h1>
          <p className="mt-2 text-sm text-muted">Este proyecto no es una web, así que no tiene panel de visitas.</p>
          <ButtonLink to={`/contracts/${id}`} variant="secondary" className="mt-6">
            Volver al contrato
          </ButtonLink>
        </div>
      </>,
    )
  }

  return shell(
    <>
      <Breadcrumbs items={[{ label: 'Contratos', to: '/contracts' }, { label: contract.data.projectTitle, to: `/contracts/${id}` }, { label: 'Métricas' }]} />
      <header className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.13em] text-muted">MÉTRICAS DE LA WEB</p>
          <h1 className="mt-2 text-[32px] font-semibold leading-tight tracking-[-0.02em]">{contract.data.projectTitle}</h1>
        </div>
        {/* Filtros en una sola fila: pestaña y rango de días */}
        <div className="flex flex-wrap items-center gap-2">
          <div role="tablist" aria-label="Secciones de métricas" className="flex rounded-full border border-line bg-surface p-1">
            {TABS.map((item) => (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={tab === item.key}
                onClick={() => goTo(item.key)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${tab === item.key ? 'bg-ink text-surface' : 'text-muted hover:text-ink'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          {tab === 'panel' && (
            <div className="flex rounded-full border border-line bg-surface p-1" role="group" aria-label="Rango de días">
              {RANGES.map((range) => (
                <button
                  key={range}
                  type="button"
                  aria-pressed={days === range}
                  onClick={() => setDays(range)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold tabular-nums transition ${days === range ? 'bg-lime text-[#1a1a18]' : 'text-muted hover:text-ink'}`}
                >
                  {range} días
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="mt-6" role="tabpanel">
        {tab === 'panel' ? (
          dashboard.error ? (
            <ErrorState title="No pudimos cargar el panel" message={dashboard.error} onRetry={dashboard.reload} />
          ) : dashboard.loading ? (
            <LoadingNotice loading what="el panel" />
          ) : (
            <MetricsPanel data={dashboard.data} isClient={isClient} freelancerName={freelancerName} onShowGuide={() => goTo('integrar')} />
          )
        ) : (
          <IntegrationGuide contractId={id} setup={setup.data} isClient={isClient} freelancerName={freelancerName} />
        )}
      </div>
    </>,
  )
}
