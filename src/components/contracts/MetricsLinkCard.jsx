import PropTypes from 'prop-types'
import ButtonLink from '../projects/ButtonLink'
import { useAsync } from '../../hooks/useAsync'
import { metricsService } from '../../services/metricsService'

// Acceso a las métricas desde el contrato (solo proyectos web): la frase del resumen y el botón al panel
export default function MetricsLinkCard({ contractId, isClient }) {
  const { data } = useAsync((options) => metricsService.getDashboard(contractId, 30, options), [contractId])
  if (!data?.webProject) return null

  return (
    <article className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-6 sm:p-[30px]">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold tracking-[0.13em] text-escrow">MÉTRICAS DE LA WEB</p>
        <h2 className="mt-2 text-lg font-semibold tracking-tight">
          {data.installed ? data.summary : isClient ? 'Pronto verás las visitas y los pedidos de tu web.' : 'Conecta la web para que tu cliente vea sus visitas.'}
        </h2>
      </div>
      <ButtonLink to={`/contracts/${contractId}/metricas${!data.installed && !isClient ? '?tab=integrar' : ''}`} variant="secondary">
        {data.installed ? 'Ver panel' : isClient ? 'Ver cómo funciona' : 'Cómo integrarlo'}
      </ButtonLink>
    </article>
  )
}

MetricsLinkCard.propTypes = {
  contractId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  isClient: PropTypes.bool,
}
