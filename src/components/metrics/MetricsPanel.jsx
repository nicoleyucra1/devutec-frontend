import PropTypes from 'prop-types'
import Cuyi from '../brand/Cuyi'
import Button from '../ui/Button'
import { timeAgo } from '../../utils/format'
import VisitsChart from './VisitsChart'
import { plural, summarySentence } from '../../utils/metrics'

// Un número grande con su nombre (sin gráfico: es un solo dato)
function Stat({ label, value, help, highlight = false }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? 'border-escrow bg-escrow-light' : 'border-line bg-surface'}`}>
      <p className={`text-[10px] font-semibold tracking-[0.13em] ${highlight ? 'text-escrow' : 'text-muted'}`}>{label}</p>
      <p className="mt-2 text-[28px] font-semibold leading-none tracking-tight tabular-nums">{value}</p>
      {help && <p className="mt-1.5 text-[11px] text-muted">{help}</p>}
    </div>
  )
}

Stat.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  help: PropTypes.string,
  highlight: PropTypes.bool,
}

// "1,4 s" o "850 ms"
function loadTime(ms) {
  if (ms == null) return '—'
  return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toLocaleString('es-PE', { maximumFractionDigits: 1 })} s`
}

// Panel básico: el resumen en una frase, los números del último mes y las visitas por día (sale de la base de DEVUTEC)
export default function MetricsPanel({ data, isClient, freelancerName, onShowGuide }) {
  const firstName = freelancerName?.split(' ')[0] ?? 'El estudiante'

  if (!data.integrated) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-line bg-surface px-6 py-12 text-center">
        <Cuyi anim="escribe" px={4} />
        <p className="mt-6 text-[11px] font-semibold tracking-[0.13em]">SIN DATOS TODAVÍA</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          {isClient ? `${firstName} todavía no conecta tu web` : 'Conecta la web que entregas'}
        </h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
          {isClient
            ? `Cuando ${firstName} instale las métricas de DEVUTEC, aquí verás cuántas personas visitan tu web y cuántas te contactan.`
            : 'Pega una línea de código en tu web y tu cliente verá aquí sus visitas y sus contactos. Toma 2 minutos.'}
        </p>
        {!isClient && (
          <Button variant="lime" className="mt-6" onClick={onShowGuide}>
            Ver cómo integrarlo
          </Button>
        )}
      </div>
    )
  }

  const summary = data.summary
  const speed = summary.averageLoadMs == null ? null : summary.averageLoadMs <= 2500 ? 'Rápida' : summary.averageLoadMs <= 4000 ? 'Normal' : 'Lenta'

  return (
    <div className="rounded-2xl border border-line bg-surface p-6 sm:p-[30px]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] font-semibold tracking-[0.13em] text-escrow">TU WEB EN NÚMEROS · ÚLTIMOS 30 DÍAS</p>
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <span className="h-2 w-2 rounded-full bg-escrow" aria-hidden="true" />
          Conectada · último dato {timeAgo(data.lastEventAt)}
        </span>
      </div>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">{summarySentence(summary)}</h2>
      {summary.includesTestData && (
        <p className="mt-2 inline-flex rounded-full bg-pending-light px-2.5 py-1 text-[11px] font-semibold text-pending">
          Incluye datos de prueba (localhost o la página de ejemplo)
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="CONTACTOS" value={summary.contacts} help="WhatsApp, llamadas y formularios" highlight />
        <Stat label="VISITAS" value={summary.visits} help="Páginas abiertas" />
        <Stat label="PEDIDOS Y RESERVAS" value={summary.orders + summary.reservations} help={`${plural(summary.orders, 'pedido', 'pedidos')} · ${plural(summary.reservations, 'reserva', 'reservas')}`} />
        <Stat label="CARGA PROMEDIO" value={loadTime(summary.averageLoadMs)} help={speed ? `${speed} en celular y PC` : 'Sin datos'} />
      </div>

      <div className="mt-8">
        <p className="mb-4 text-sm font-semibold">Visitas por día (últimas 2 semanas)</p>
        <VisitsChart daily={summary.lastDays} />
      </div>
    </div>
  )
}

MetricsPanel.propTypes = {
  data: PropTypes.shape({
    integrated: PropTypes.bool,
    lastEventAt: PropTypes.string,
    summary: PropTypes.shape({
      visits: PropTypes.number,
      contacts: PropTypes.number,
      orders: PropTypes.number,
      reservations: PropTypes.number,
      clicks: PropTypes.number,
      averageLoadMs: PropTypes.number,
      includesTestData: PropTypes.bool,
      lastDays: PropTypes.array,
    }),
  }).isRequired,
  isClient: PropTypes.bool,
  freelancerName: PropTypes.string,
  onShowGuide: PropTypes.func,
}
