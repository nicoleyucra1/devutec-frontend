import PropTypes from 'prop-types'
import Cuyi from '../brand/Cuyi'
import Button from '../ui/Button'
import { timeAgo } from '../../utils/format'
import VisitsChart from './VisitsChart'

// Un número grande con su nombre (sin gráfico: es un solo dato)
function Stat({ label, value, help }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="text-[10px] font-semibold tracking-[0.13em] text-muted">{label}</p>
      <p className="mt-2 text-[28px] font-semibold leading-none tracking-tight tabular-nums">{value}</p>
      {help && <p className="mt-1.5 text-[11px] text-muted">{help}</p>}
    </div>
  )
}

Stat.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  help: PropTypes.string,
}

function TopList({ title, items, empty }) {
  const max = Math.max(1, ...items.map((item) => item.count))
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="text-[10px] font-semibold tracking-[0.13em] text-muted">{title}</p>
      {items.length === 0 ? (
        <p className="mt-3 text-xs text-muted">{empty}</p>
      ) : (
        <ul className="mt-3 grid gap-2.5">
          {items.map((item) => (
            <li key={item.name} className="text-sm">
              <div className="flex justify-between gap-3">
                <span className="min-w-0 truncate">{item.name}</span>
                <span className="font-semibold tabular-nums">{item.count}</span>
              </div>
              <span className="mt-1 block h-1 rounded-full bg-soft" aria-hidden="true">
                <span className="block h-1 rounded-full" style={{ width: `${(item.count / max) * 100}%`, background: 'var(--color-escrow)' }} />
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

TopList.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string, count: PropTypes.number })).isRequired,
  empty: PropTypes.string.isRequired,
}

// "1,4 s" o "850 ms"
function loadTime(ms) {
  if (ms == null) return '—'
  return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toLocaleString('es-PE', { maximumFractionDigits: 1 })} s`
}

// Panel de métricas de la web del cliente: el resumen en una frase, 4 números, visitas por día y lo más visto
export default function MetricsPanel({ data, isClient, freelancerName, onShowGuide }) {
  const firstName = freelancerName?.split(' ')[0] ?? 'El estudiante'

  if (!data.installed) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-line bg-surface px-6 py-12 text-center">
        <Cuyi anim="escribe" px={4} />
        <p className="mt-6 text-[11px] font-semibold tracking-[0.13em]">SIN DATOS TODAVÍA</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          {isClient ? `${firstName} todavía no conecta tu web` : 'Conecta la web que entregas'}
        </h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
          {isClient
            ? `Cuando ${firstName} instale las métricas de DEVUTEC, aquí verás cuántas personas visitan tu web y cuántos pedidos te hacen.`
            : 'Pega una línea de código en tu web y tu cliente verá aquí sus visitas y sus pedidos. Toma 2 minutos.'}
        </p>
        {!isClient && (
          <Button variant="lime" className="mt-6" onClick={onShowGuide}>
            Ver cómo integrarlo
          </Button>
        )}
      </div>
    )
  }

  const speed = data.averageLoadMs == null ? null : data.averageLoadMs <= 2500 ? 'Rápida' : data.averageLoadMs <= 4000 ? 'Normal' : 'Lenta'

  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border border-line bg-surface p-6 sm:p-[30px]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] font-semibold tracking-[0.13em] text-escrow">TU WEB EN NÚMEROS</p>
          <span className="flex items-center gap-1.5 text-xs text-muted">
            <span className="h-2 w-2 rounded-full bg-escrow" aria-hidden="true" />
            Conectada · última visita {timeAgo(data.lastEventAt)}
          </span>
        </div>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">{data.summary}</h2>

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="VISITAS" value={data.visits} help="Páginas abiertas" />
          <Stat label="PERSONAS" value={data.visitors} help="Visitantes distintos" />
          <Stat label="PEDIDOS" value={data.orders} help="Botones de pedido tocados" />
          <Stat label="CARGA PROMEDIO" value={loadTime(data.averageLoadMs)} help={speed ? `${speed}` : 'Sin datos'} />
        </div>

        <div className="mt-8">
          <p className="mb-4 text-sm font-semibold">Visitas por día</p>
          <VisitsChart daily={data.daily} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TopList title="PEDIDOS, CONTACTOS Y RESERVAS" items={data.topEvents} empty="Todavía nadie tocó un botón marcado." />
        <TopList title="DE DÓNDE LLEGAN" items={data.sources ?? []} empty="Todavía no hay visitas." />
        <TopList title="CELULAR O COMPUTADORA" items={data.devices ?? []} empty="Todavía no hay visitas." />
        <TopList title="PÁGINAS MÁS VISTAS" items={data.topPages} empty="Todavía no hay visitas." />
      </div>
    </div>
  )
}

MetricsPanel.propTypes = {
  data: PropTypes.shape({
    installed: PropTypes.bool,
    lastEventAt: PropTypes.string,
    summary: PropTypes.string,
    visits: PropTypes.number,
    visitors: PropTypes.number,
    orders: PropTypes.number,
    averageLoadMs: PropTypes.number,
    daily: PropTypes.array,
    topPages: PropTypes.array,
    topEvents: PropTypes.array,
    sources: PropTypes.array,
    devices: PropTypes.array,
  }).isRequired,
  isClient: PropTypes.bool,
  freelancerName: PropTypes.string,
  onShowGuide: PropTypes.func,
}
