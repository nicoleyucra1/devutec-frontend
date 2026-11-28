import PropTypes from 'prop-types'
import { useAsync } from '../../hooks/useAsync'
import { metricsService } from '../../services/metricsService'

function TopList({ title, items, empty }) {
  const max = Math.max(1, ...items.map((item) => item.total))
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="text-[10px] font-semibold tracking-[0.13em] text-muted">{title}</p>
      {items.length === 0 ? (
        <p className="mt-3 text-xs text-muted">{empty}</p>
      ) : (
        <ul className="mt-3 grid gap-2.5">
          {items.map((item) => (
            <li key={item.label} className="text-sm">
              <div className="flex justify-between gap-3">
                <span className="min-w-0 truncate">{item.label}</span>
                <span className="font-semibold tabular-nums">{item.total}</span>
              </div>
              <span className="mt-1 block h-1 rounded-full bg-soft" aria-hidden="true">
                <span className="block h-1 rounded-full" style={{ width: `${(item.total / max) * 100}%`, background: 'var(--color-escrow)' }} />
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
  items: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string, total: PropTypes.number })).isRequired,
  empty: PropTypes.string.isRequired,
}

// Reporte Pro: sale de Amplitude, el motor de analítica que DEVUTEC usa por detrás
export default function ProReport({ contractId, isPro, isClient, onUpgrade }) {
  const report = useAsync((options) => (isPro ? metricsService.advanced(contractId, options) : Promise.resolve(null)), [contractId, isPro])

  if (!isPro) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed border-line bg-surface p-6">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-[0.13em] text-muted">REPORTE PRO</p>
          <p className="mt-1 text-sm font-semibold">Páginas más vistas, de dónde llegan tus visitas y tus contactos mes a mes</p>
          <p className="mt-1 text-xs text-muted">Con el análisis de Amplitude, explicado en simple.</p>
        </div>
        {isClient && (
          <button type="button" onClick={onUpgrade} className="rounded-full bg-lime px-4 py-2 text-sm font-semibold text-[#1a1a18]">
            Ver plan Pro
          </button>
        )}
      </div>
    )
  }
  if (report.loading) return <p className="text-sm text-muted">Cargando el reporte Pro…</p>
  if (report.error || !report.data?.available) {
    return <p className="rounded-xl bg-paper p-4 text-sm text-muted">{report.data?.message ?? report.error ?? 'El reporte Pro no está disponible ahora.'}</p>
  }
  const data = report.data
  return (
    <div className="grid gap-4">
      <p className="text-[10px] font-semibold tracking-[0.13em] text-escrow">REPORTE PRO · CON AMPLITUDE</p>
      <div className="grid gap-4 md:grid-cols-3">
        <TopList title="PÁGINAS MÁS VISTAS" items={data.topPages} empty="Todavía no hay visitas." />
        <TopList title="DE DÓNDE LLEGAN" items={data.sources} empty="Todavía no hay datos." />
        <TopList title="CELULAR O COMPUTADORA" items={data.devices} empty="Todavía no hay datos." />
      </div>
      <TopList title="CONTACTOS MES A MES" items={data.contactsByMonth} empty="Todavía no hay contactos." />
    </div>
  )
}

ProReport.propTypes = {
  contractId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  isPro: PropTypes.bool,
  isClient: PropTypes.bool,
  onUpgrade: PropTypes.func,
}
