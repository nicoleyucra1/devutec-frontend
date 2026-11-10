import ErrorBox from '../../components/projects/ErrorBox'
import MoneyAmount from '../../components/contracts/MoneyAmount'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import FilterChips from '../../components/ui/FilterChips'
import Pagination from '../../components/ui/Pagination'
import SearchField from '../../components/ui/SearchField'
import Skeleton from '../../components/ui/Skeleton'
import { useListParams } from '../../hooks/useListParams'
import { usePayments } from '../../hooks/usePayments'
import { contractCode, PAYMENT_STATUS, paymentCode, projectInitials } from '../../utils/contractStatus'
import { formatBudget, formatDate } from '../../utils/format'
import { countBy, sumBy } from '../../utils/stats'

const FILTERS = ['ALL', 'HELD', 'RELEASED', 'REFUNDED']
const SORTS = { recientes: 'Más recientes', monto: 'Mayor monto' }
const COLUMNS = 'lg:grid-cols-[minmax(0,2fr)_minmax(0,0.8fr)_minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]'

// Busca por proyecto, por #PG del pago o por #CT del contrato
function matches(payment, query) {
  const q = query.trim().toLowerCase().replace(/^#/, '')
  if (!q) return true
  return [payment.projectTitle, paymentCode(payment.id), payment.contractId && contractCode(payment.contractId)]
    .filter(Boolean)
    .some((text) => text.toLowerCase().includes(q))
}

// Descarga los pagos que se ven con el filtro actual como un archivo CSV que abre Excel
function exportCsv(payments) {
  const header = ['Pago', 'Contrato', 'Proyecto', 'Cliente', 'Freelancer', 'Monto', 'Estado', 'Fecha']
  const lines = payments.map((p) => [
    paymentCode(p.id),
    p.contractId ? contractCode(p.contractId) : '',
    p.projectTitle ?? '',
    p.clientName ?? '',
    p.freelancerName ?? '',
    Number(p.amount).toFixed(2),
    PAYMENT_STATUS[p.status]?.label ?? p.status,
    p.createdAt?.slice(0, 10) ?? '',
  ])
  const csv = [header, ...lines].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n')
  // El BOM al inicio hace que Excel lea bien las tildes
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `pagos-devutec-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

function StatCard({ label, value, hint, loading, dark = false, children }) {
  return (
    <article className={`rounded-2xl p-6 ${dark ? 'bg-ink text-white' : 'border border-line bg-surface'}`}>
      <span className={`text-[10px] font-semibold tracking-[0.13em] ${dark ? 'text-lime' : 'text-muted'}`}>{label}</span>
      {loading ? (
        <Skeleton className="mt-3 h-12 w-32" />
      ) : (
        children ?? <strong className="mt-2 block text-[52px] font-semibold leading-none tabular-nums tracking-[-0.05em]">{value}</strong>
      )}
      <small className={`mt-3 block text-xs ${dark ? 'text-white/60' : 'text-muted'}`}>{loading ? ' ' : hint}</small>
    </article>
  )
}

// Página Admin · Pagos del diseño: totales del dinero en garantía y la tabla de todos los pagos con filtro,
// búsqueda, orden, paginación y exportación. Todo queda en la URL (?estado=&q=&orden=&page=&size=).
export default function AdminPayments() {
  const { data: payments, loading, error, status, reload } = usePayments()
  const list = useListParams({ orden: 'recientes' })

  const all = payments ?? []
  const counts = countBy(all, 'status')
  const totalOf = (status) => sumBy(all, 'amount', (p) => p.status === status)
  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`

  const filtered = all
    .filter((p) => (list.status === 'ALL' || p.status === list.status) && matches(p, list.query))
    .sort((a, b) =>
      list.sort === 'monto' ? Number(b.amount) - Number(a.amount) : String(b.createdAt).localeCompare(String(a.createdAt)),
    )
  const totalPages = Math.max(Math.ceil(filtered.length / list.size), 1)
  const page = Math.min(list.page, totalPages)
  const rows = filtered.slice((page - 1) * list.size, page * list.size)

  return (
    <main className="mx-auto w-full max-w-[1200px] px-5 pb-20 pt-10 lg:px-6 lg:pt-14">
      <header className="mb-9 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.13em]">
            <span className="mr-2 rounded-md bg-ink px-2 py-1 font-mono text-[10px] tracking-[0.1em] text-lime">ADMIN</span>
            ADMINISTRACIÓN
          </p>
          <h1 className="mt-4 text-[46px] leading-none tracking-[-0.045em] lg:text-[60px]">
            Pagos
            <br />
            <em>en la plataforma.</em>
          </h1>
        </div>
        <Button variant="secondary" onClick={() => exportCsv(filtered)} disabled={filtered.length === 0}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
          </svg>
          Exportar CSV
        </Button>
      </header>

      <section aria-label="Totales" className="mb-10 grid gap-3 md:grid-cols-[1fr_1fr_1.4fr]">
        <StatCard
          label="PAGOS RETENIDOS"
          value={String(counts.HELD ?? 0).padStart(2, '0')}
          hint={`${formatBudget(totalOf('HELD'))} en garantía ahora`}
          loading={loading}
        />
        <StatCard
          label="PAGOS LIBERADOS"
          value={String(counts.RELEASED ?? 0).padStart(2, '0')}
          hint={`${formatBudget(totalOf('RELEASED'))} a freelancers`}
          loading={loading}
        />
        <StatCard
          dark
          label="TOTAL PROCESADO"
          loading={loading}
          hint={`${plural(all.length, 'pago')} · ${plural(counts.REFUNDED ?? 0, 'reembolso')} de ${formatBudget(totalOf('REFUNDED'))}`}
        >
          <MoneyAmount value={sumBy(all, 'amount')} className="mt-2 text-[52px] leading-none" />
        </StatCard>
      </section>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <FilterChips
          label="Filtrar por estado"
          value={list.status}
          onChange={list.setStatus}
          options={FILTERS.map((value) => ({
            value,
            label: value === 'ALL' ? 'Todos' : PAYMENT_STATUS[value].label,
            count: payments ? (value === 'ALL' ? all.length : (counts[value] ?? 0)) : undefined,
          }))}
        />
        <div className="flex w-full flex-wrap items-center gap-2.5 sm:w-auto">
          <SearchField
            value={list.query}
            onChange={list.setQuery}
            placeholder="Buscar #CT, #PG o proyecto"
            label="Buscar pagos"
            className="w-full sm:w-60"
          />
          <label className="flex items-center gap-2 text-[11px] text-muted">
            Ordenar
            <select
              value={list.sort}
              onChange={(event) => list.setSort(event.target.value)}
              className="h-10 rounded-[10px] border border-line bg-surface px-2.5 text-xs text-ink"
            >
              {Object.entries(SORTS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {error && <ErrorBox message={error} status={status} onRetry={reload} />}

      {loading && (
        <div className="grid gap-2 rounded-2xl border border-line bg-surface p-5">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-12 w-full" />
          ))}
        </div>
      )}

      {payments && (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <div aria-hidden="true" className={`hidden gap-x-4 px-5 py-3 text-[10px] font-semibold tracking-[0.12em] text-muted lg:grid ${COLUMNS}`}>
            <span>CONTRATO</span>
            <span>PAGO</span>
            <span>CLIENTE → FREELANCER</span>
            <span>MONTO</span>
            <span>ESTADO</span>
            <span>FECHA</span>
          </div>

          {rows.length === 0 ? (
            <div className="border-t border-line px-5 py-12 text-center">
              <strong className="text-sm">{all.length === 0 ? 'Todavía no hay pagos' : 'Ningún pago coincide'}</strong>
              <p className="mt-1.5 text-xs text-muted">
                {all.length === 0
                  ? 'Cada vez que un cliente acepta una postulación se crea un pago en garantía.'
                  : 'Revisa el código o cambia el filtro de estado.'}
              </p>
              {all.length > 0 && (
                <Button variant="secondary" onClick={list.clear} className="mt-5">
                  Ver todos
                </Button>
              )}
            </div>
          ) : (
            <ul aria-label="Pagos">
              {rows.map((payment) => {
                const status = PAYMENT_STATUS[payment.status]
                const title = payment.projectTitle ?? 'Contrato sin datos'
                return (
                  <li
                    key={payment.id}
                    className={`grid grid-cols-2 items-center gap-x-4 gap-y-3 border-t border-line px-5 py-4 text-[13px] transition-colors duration-200 hover:bg-[#faf9f6] lg:gap-y-0 ${COLUMNS}`}
                  >
                    <span className="col-span-2 flex min-w-0 items-center gap-3 lg:col-span-1">
                      <i className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-paper text-[11px] font-semibold not-italic">
                        {projectInitials(title)}
                      </i>
                      <span className="min-w-0">
                        <strong className="block truncate font-semibold">{title}</strong>
                        <small className="font-mono text-[11px] text-muted">
                          {payment.contractId ? contractCode(payment.contractId) : '—'}
                        </small>
                      </span>
                    </span>
                    <span className="font-mono text-[11px]">{paymentCode(payment.id)}</span>
                    <span className="min-w-0 truncate text-muted lg:order-none">
                      {payment.clientName ?? '—'} <span aria-label="a">→</span>{' '}
                      <span className="text-ink">{payment.freelancerName ?? '—'}</span>
                    </span>
                    <strong className="tabular-nums">{formatBudget(payment.amount)}</strong>
                    <span>
                      <Badge color={status?.color}>{status?.label ?? payment.status}</Badge>
                    </span>
                    <span className="text-muted lg:text-ink">{formatDate(payment.createdAt)}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}

      <Pagination
        page={page}
        size={list.size}
        totalPages={totalPages}
        totalElements={filtered.length}
        onPageChange={list.setPage}
        onSizeChange={list.setSize}
      />
    </main>
  )
}
