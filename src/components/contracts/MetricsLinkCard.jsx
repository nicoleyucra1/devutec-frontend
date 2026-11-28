import PropTypes from 'prop-types'
import ButtonLink from '../projects/ButtonLink'
import { useAsync } from '../../hooks/useAsync'
import { metricsService } from '../../services/metricsService'
import { summarySentence } from '../../utils/metrics'

// Acceso a las métricas desde el contrato: en qué va (sin activar, esperando datos o la frase del resumen) y el botón al panel
export default function MetricsLinkCard({ contractId, isClient }) {
  const { data } = useAsync((options) => metricsService.get(contractId, options), [contractId])
  if (!data) return null
  // Al estudiante solo se le muestra si el cliente las pidió o ya las activó
  if (!isClient && !data.enabled && !data.requested) return null

  let title
  let action
  let link = `/contracts/${contractId}/metricas`
  if (!data.enabled) {
    title = isClient
      ? data.requested
        ? 'Pediste métricas para tu web: actívalas para que se puedan instalar.'
        : 'Mira cuántas personas visitan tu web y cuántas te contactan.'
      : 'El cliente pidió métricas. Cuando las active, aquí verás cómo integrarlas.'
    action = isClient ? 'Activar métricas' : 'Ver detalle'
  } else if (!data.integrated) {
    title = isClient ? 'Activadas. Esperando la primera visita de tu web.' : 'Integra las métricas en la web antes de la Entrega final.'
    action = isClient ? 'Ver panel' : 'Cómo integrarlo'
    if (!isClient) link += '?tab=integrar'
  } else if (data.access.locked) {
    title = isClient ? 'Tu prueba gratis terminó. Elige un plan para ver tus números.' : 'La web está enviando datos ✓'
    action = 'Ver panel'
  } else {
    title = summarySentence(data.summary)
    action = 'Ver panel'
  }

  return (
    <article className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-6 sm:p-[30px]">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold tracking-[0.13em] text-escrow">MÉTRICAS DE LA WEB</p>
        <h2 className="mt-2 text-lg font-semibold tracking-tight">{title}</h2>
      </div>
      <ButtonLink to={link} variant="secondary">
        {action}
      </ButtonLink>
    </article>
  )
}

MetricsLinkCard.propTypes = {
  contractId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  isClient: PropTypes.bool,
}
