import { Link } from 'react-router-dom'
import LoadingNotice from '../../components/ui/LoadingNotice'
import TableSkeleton from '../../components/ui/TableSkeleton'
import Cuyi from '../../components/brand/Cuyi'
import ButtonLink from '../../components/projects/ButtonLink'
import ErrorBox from '../../components/projects/ErrorBox'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import FilterChips from '../../components/ui/FilterChips'
import SearchField from '../../components/ui/SearchField'
import Skeleton from '../../components/ui/Skeleton'
import { useAuth } from '../../hooks/useAuth'
import { useMyContracts } from '../../hooks/useContracts'
import { useListParams } from '../../hooks/useListParams'
import { CONTRACT_STATUS, contractCode, PAYMENT_STATUS, projectInitials } from '../../utils/contractStatus'
import { formatBudget, formatDate } from '../../utils/format'
import { sumBy } from '../../utils/stats'

const FILTERS = ['ALL', 'IN_PROGRESS', 'DELIVERED', 'CONFIRMED', 'CANCELLED']
const COLUMNS = 'lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]'

// Busca por nombre del proyecto o por código, con o sin "#": "pizzería", "CT-0042" o "42"
function matches(contract, query) {
  const q = query.trim().toLowerCase().replace(/^#/, '')
  if (!q) return true
  return contract.projectTitle.toLowerCase().includes(q) || contractCode(contract.id).toLowerCase().includes(q)
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-escrow">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-5" />
    </svg>
  )
}

// Fila de la tabla. En pantallas chicas se ve como tarjeta y en grandes como fila con 6 columnas.
function ContractRow({ contract, counterpart }) {
  const status = CONTRACT_STATUS[contract.status]
  const payment = PAYMENT_STATUS[contract.paymentStatus]
  return (
    <li>
      <Link
        to={`/contracts/${contract.id}`}
        className={`grid grid-cols-2 items-center gap-x-4 gap-y-3 border-t border-line px-5 py-4 text-[13px] transition-colors duration-200 hover:bg-[#faf9f6] focus-visible:bg-[#faf9f6] focus-visible:outline-none lg:gap-y-0 ${COLUMNS}`}
      >
        <span className="col-span-2 flex min-w-0 items-center gap-3 lg:col-span-1">
          <i className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-paper text-[11px] font-semibold not-italic">
            {projectInitials(contract.projectTitle)}
          </i>
          <span className="min-w-0">
            <strong className="block truncate font-semibold">{contract.projectTitle}</strong>
            <small className="font-mono text-[11px] text-muted">{contractCode(contract.id)}</small>
          </span>
        </span>
        <span className="col-span-2 flex min-w-0 items-center gap-2 lg:col-span-1">
          <Avatar name={counterpart} size="sm" />
          <span className="truncate">{counterpart}</span>
        </span>
        <span>
          <Badge color={status?.color}>{status?.label ?? contract.status}</Badge>
        </span>
        <span>
          <Badge color={payment?.color}>{payment?.label ?? contract.paymentStatus}</Badge>
        </span>
        <strong className="tabular-nums">{formatBudget(contract.amount)}</strong>
        <span className="text-muted lg:text-ink">
          <span className="lg:hidden">Vence </span>
          {contract.deadline ? formatDate(contract.deadline) : '—'}
        </span>
      </Link>
    </li>
  )
}

// Página Contratos del diseño: resumen del dinero, filtros por estado, buscador y la tabla de contratos.
// El filtro y la búsqueda quedan en la URL (?estado=&q=).
export default function MyContracts() {
  const { user } = useAuth()
  const { data: contracts, loading, error, status, reload } = useMyContracts()
  const list = useListParams()
  const isClient = user?.rol === 'CLIENT'

  const all = contracts ?? []
  const countOf = (status) => (status === 'ALL' ? all.length : all.filter((c) => c.status === status).length)
  const rows = all.filter((c) => (list.status === 'ALL' || c.status === list.status) && matches(c, list.query))
  const active = all.filter((c) => c.status === 'IN_PROGRESS' || c.status === 'DELIVERED').length

  const summary = [
    ['ACTIVOS', String(active).padStart(2, '0')],
    ['EN GARANTÍA', formatBudget(sumBy(all, 'amount', (c) => c.paymentStatus === 'HELD'))],
    ['LIBERADO', formatBudget(sumBy(all, 'amount', (c) => c.paymentStatus === 'RELEASED'))],
  ]

  return (
    <main className="mx-auto w-full max-w-[1200px] px-5 pb-20 pt-10 lg:px-6 lg:pt-14">
      <LoadingNotice loading={loading} what="tus contratos" />
      <header className="mb-8">
        <p className="text-[11px] font-semibold tracking-[0.13em]">{isClient ? 'ESPACIO DE CLIENTE' : 'ESPACIO FREELANCER'}</p>
        <h1 className="my-3 text-[46px] leading-none tracking-[-0.045em] lg:text-[60px]">Contratos</h1>
        <p className="text-muted">Sigue el estado de cada trabajo y dónde está el dinero en todo momento.</p>
      </header>

      <section aria-label="Resumen de tus contratos" className="mb-8 grid overflow-hidden rounded-2xl border border-line bg-surface lg:grid-cols-[1fr_1fr_1fr_1.6fr]">
        {summary.map(([label, value]) => (
          <div key={label} className="border-b border-line px-6 py-5 lg:border-b-0 lg:border-r">
            <span className="text-[10px] font-semibold tracking-[0.13em] text-muted">{label}</span>
            {loading ? (
              <Skeleton className="mt-2 h-8 w-28" />
            ) : (
              <strong className="mt-1.5 block text-[28px] font-semibold tabular-nums tracking-[-0.03em]">{value}</strong>
            )}
          </div>
        ))}
        <p className="flex items-center gap-3 bg-escrow-light px-6 py-5 text-xs leading-relaxed text-escrow">
          <ShieldIcon />
          {isClient
            ? 'Tu dinero solo se libera cuando confirmas una entrega. Si cancelas antes, se reembolsa.'
            : 'El pago ya está retenido antes de que empieces. Se libera cuando el cliente confirma tu entrega.'}
        </p>
      </section>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <FilterChips
          label="Filtrar por estado"
          value={list.status}
          onChange={list.setStatus}
          options={FILTERS.map((value) => ({
            value,
            label: value === 'ALL' ? 'Todos' : CONTRACT_STATUS[value].label,
            count: contracts ? countOf(value) : undefined,
          }))}
        />
        <SearchField
          value={list.query}
          onChange={list.setQuery}
          placeholder="Buscar por proyecto o #CT"
          label="Buscar contratos"
          className="w-full sm:w-64"
        />
      </div>

      {error && <ErrorBox message={error} status={status} onRetry={reload} />}

      {loading && (
        <TableSkeleton
          columns={COLUMNS}
          cells={['project', 'person', 'pill', 'pill', 'line', 'line']}
          label="Cargando contratos…"
        />
      )}

      {contracts?.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-line bg-surface px-6 py-14 text-center">
          <Cuyi anim="duerme" px={5} />
          <h2 className="mt-5 text-lg font-semibold">Todavía no tienes contratos</h2>
          <p className="mt-1 max-w-md text-sm text-muted">
            {isClient
              ? 'Cuando aceptes una postulación en uno de tus proyectos, el contrato aparecerá aquí.'
              : 'Cuando un cliente acepte una de tus postulaciones, el contrato aparecerá aquí.'}
          </p>
          <ButtonLink to={isClient ? '/my-projects' : '/projects'} variant="secondary" className="mt-6">
            {isClient ? 'Ver mis proyectos' : 'Explorar proyectos'}
          </ButtonLink>
        </div>
      )}

      {contracts?.length > 0 && rows.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-line bg-surface px-6 py-14 text-center">
          <Cuyi anim="confundido" px={4} />
          <h2 className="mt-5 text-lg font-semibold">No hay contratos que coincidan</h2>
          <p className="mt-1 text-sm text-muted">Prueba con otro filtro o revisa lo que escribiste.</p>
          <Button variant="secondary" onClick={list.clear} className="mt-6">
            Ver todos
          </Button>
        </div>
      )}

      {rows.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <div
            aria-hidden="true"
            className={`hidden gap-x-4 px-5 py-3 text-[10px] font-semibold tracking-[0.12em] text-muted lg:grid ${COLUMNS}`}
          >
            <span>CONTRATO</span>
            <span>{isClient ? 'FREELANCER' : 'CLIENTE'}</span>
            <span>ESTADO</span>
            <span>PAGO</span>
            <span>MONTO</span>
            <span>FECHA LÍMITE</span>
          </div>
          <ul aria-label="Contratos">
            {rows.map((contract) => (
              <ContractRow
                key={contract.id}
                contract={contract}
                counterpart={isClient ? contract.freelancerName : (contract.clientName ?? 'Cliente')}
              />
            ))}
          </ul>
        </div>
      )}
    </main>
  )
}
