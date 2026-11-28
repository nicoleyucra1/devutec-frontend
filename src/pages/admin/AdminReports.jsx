import { useState } from 'react'
import ErrorBox from '../../components/projects/ErrorBox'
import LoadingNotice from '../../components/ui/LoadingNotice'
import ItemList from '../../components/dashboard/ItemList'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import FilterChips from '../../components/ui/FilterChips'
import { useReports } from '../../hooks/useReports'
import { useToast } from '../../hooks/useToast'
import { REPORT_REASON_LABELS, reportService } from '../../services/reportService'
import { errorMessage } from '../../utils/errorMessage'
import { formatDate } from '../../utils/format'

const FILTERS = [
  { value: 'OPEN', label: 'Pendientes' },
  { value: 'ALL', label: 'Todos' },
]

// Admin · Reportes: los que hacen clientes y estudiantes (botón "Reportar") y los que deja el filtro automático
// cuando bloquea un texto con datos de contacto o un pedido de pagar por fuera. Con el número de reportes de cada
// persona el admin ve si es algo repetido y decide (advertencia, suspensión).
export default function AdminReports() {
  const { data, loading, error, status, reload } = useReports()
  const toast = useToast()
  const [filter, setFilter] = useState('OPEN')
  const [busyId, setBusyId] = useState(null)

  const all = data ?? []
  const visible = filter === 'ALL' ? all : all.filter((report) => report.status === 'OPEN')

  const markReviewed = async (report) => {
    setBusyId(report.id)
    try {
      await reportService.markReviewed(report.id)
      toast.success('Reporte marcado como revisado')
      reload()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <main className="mx-auto w-full max-w-[1000px] px-5 pb-20 pt-10 lg:px-6 lg:pt-14">
      <LoadingNotice loading={loading} what="los reportes" />
      <header className="mb-8">
        <p className="text-[11px] font-semibold tracking-[0.13em]">
          <span className="mr-2 rounded-md bg-night px-2 py-1 font-mono text-[10px] tracking-[0.1em] text-lime">ADMIN</span>
          ADMINISTRACIÓN
        </p>
        <h1 className="mt-4 text-[46px] leading-none tracking-[-0.045em] lg:text-[60px]">
          Reportes
          <br />
          <em>de salirse de DEVUTEC.</em>
        </h1>
        <p className="mt-4 max-w-[640px] text-sm text-muted">
          Pedidos de pagar o hablar por fuera de la plataforma: los que reportan las personas y los que bloquea el filtro
          automático. Si alguien acumula reportes, toca advertirle o suspender su cuenta.
        </p>
      </header>

      <FilterChips
        options={FILTERS.map((option) => ({
          ...option,
          count: option.value === 'ALL' ? all.length : all.filter((report) => report.status === 'OPEN').length,
        }))}
        value={filter}
        onChange={setFilter}
        label="Estado de los reportes"
      />

      <div className="mt-6">
        {loading && <ItemList loading />}
        {error && <ErrorBox message={error} status={status} onRetry={reload} />}
        {!loading && !error && visible.length === 0 && (
          <EmptyState title={filter === 'OPEN' ? 'No hay reportes pendientes' : 'Todavía no hay reportes'} />
        )}
        {!loading && !error && visible.length > 0 && (
          <ul className="grid gap-3">
            {visible.map((report) => (
              <li key={report.id} className="rounded-2xl border border-line bg-surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm">
                      <strong>{report.reportedName}</strong>
                      <span className="ml-2 text-xs text-muted">
                        {report.reportedReports} reporte{report.reportedReports === 1 ? '' : 's'} en total
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {report.place} · {formatDate(report.createdAt)} ·{' '}
                      {report.reason === 'FILTRO_AUTOMATICO' ? 'lo bloqueó el filtro' : `lo reportó ${report.reporterName}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge color={report.reason === 'FILTRO_AUTOMATICO' ? 'gray' : 'red'}>
                      {REPORT_REASON_LABELS[report.reason] ?? report.reason}
                    </Badge>
                    {report.status === 'REVIEWED' && <Badge color="green">Revisado</Badge>}
                  </div>
                </div>
                {report.detail && (
                  <p className="mt-3 whitespace-pre-line rounded-xl bg-paper p-3 text-[13px] leading-relaxed">{report.detail}</p>
                )}
                {report.status === 'OPEN' && (
                  <Button variant="secondary" className="mt-3" onClick={() => markReviewed(report)} disabled={busyId === report.id}>
                    {busyId === report.id ? 'Guardando…' : 'Marcar como revisado'}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
