import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Pagination from '../../components/ui/Pagination'
import ProjectFilters from '../../components/projects/ProjectFilters'
import ProjectGrid from '../../components/projects/ProjectGrid'
import ErrorBox from '../../components/projects/ErrorBox'
import { useProjects } from '../../hooks/useProjects'
import { useSkills } from '../../hooks/useSkills'
import { useDebounce } from '../../hooks/useDebounce'
import { formatBudget, formatDate, STATUS_LABELS } from '../../utils/format'
import { readPageParams } from '../../utils/pageParams'
import PropTypes from 'prop-types'

const FILTER_KEYS = ['minBudget', 'maxBudget', 'deadlineBefore']

// "Ordenar por" en la URL: ?orden=presupuesto. Sin nada, la API ya ordena por los más nuevos.
const SORTS = [
  { value: '', label: 'Nuevos', sort: undefined },
  { value: 'presupuesto', label: 'Mayor presupuesto', sort: 'budget,desc' },
]

// Habilidades elegidas en la URL: ?skillIds=3,7 (los links viejos con ?skillId=3 también sirven)
const readSkillIds = (params) => (params.get('skillIds') ?? params.get('skillId') ?? '').split(',').filter(Boolean)

function Icon({ children, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  )
}

// Píldora de un filtro activo con su × para quitarlo
function Chip({ label, onRemove }) {
  return (
    <span className="flex shrink-0 items-center gap-2 rounded-full bg-[#e8e5dd] px-[11px] py-[7px] text-[11px]">
      {label}
      <button type="button" onClick={onRemove} aria-label={`Quitar filtro ${label}`} className="cursor-pointer leading-none">
        ×
      </button>
    </span>
  )
}

// Explorar proyectos del diseño: buscador, filtros a la izquierda y tarjetas a la derecha.
// Los filtros, el orden y la página viven en la URL (?search=&status=&skillIds=&orden=&page=),
// así se puede compartir el enlace o volver atrás sin perder la búsqueda.
// Si la URL no trae estado se muestran los abiertos, que son a los que se puede postular; ?status=ALL muestra todos.
export default function ProjectsExplore() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { page, size } = readPageParams(searchParams)
  const urlSearch = searchParams.get('search') ?? ''
  const order = SORTS.find((option) => option.value === (searchParams.get('orden') ?? '')) ?? SORTS[0]
  const [showFilters, setShowFilters] = useState(false)

  const filters = useMemo(
    () => ({
      ...Object.fromEntries(FILTER_KEYS.map((key) => [key, searchParams.get(key) ?? ''])),
      status: searchParams.get('status') ?? 'OPEN',
      skillIds: readSkillIds(searchParams),
    }),
    [searchParams],
  )

  // El texto se escribe en un estado local y pasa a la URL 400 ms después de dejar de escribir
  const [search, setSearch] = useState(urlSearch)
  const debouncedSearch = useDebounce(search, 400)

  // Si la URL cambia desde fuera (botón atrás, limpiar filtros), el input se sincroniza
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch)
  if (urlSearch !== prevUrlSearch) {
    setPrevUrlSearch(urlSearch)
    setSearch(urlSearch)
  }

  const updateParams = (changes) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      Object.entries(changes).forEach(([key, value]) => {
        if (value === '' || value === null || value === undefined) next.delete(key)
        else next.set(key, value)
      })
      return next
    })
  }

  useEffect(() => {
    if (debouncedSearch !== urlSearch) {
      updateParams({ search: debouncedSearch, page: null })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  // Con una habilidad se manda skillId, que entiende cualquier versión del backend; con varias, skillIds
  const { skillIds, status, ...otherFilters } = filters
  const skillParams = skillIds.length === 1 ? { skillId: skillIds[0] } : { skillIds: skillIds.join(',') }
  const { data, loading, error, status: httpStatus, reload } = useProjects({
    ...otherFilters,
    ...skillParams,
    status: status === 'ALL' ? '' : status,
    search: urlSearch,
    sort: order.sort,
    page,
    size,
  })
  // Para el titular "36 PROYECTOS ABIERTOS": solo se pide el total
  const openCount = useProjects({ status: 'OPEN', size: 1 })
  const skills = useSkills()

  const handleFilterChange = (key, value) =>
    updateParams({ [key]: value, page: null, ...(key === 'skillIds' ? { skillId: null } : {}) })
  const handlePageChange = (nextPage) => {
    updateParams({ page: nextPage > 1 ? nextPage : null })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const handleSizeChange = (nextSize) => updateParams({ size: nextSize, page: null })
  const handleClear = () => {
    setSearch('')
    setSearchParams({ status: 'ALL' })
  }

  // Filtros activos como píldoras, en el orden de la columna de filtros
  const skillName = (id) => skills.data?.find((skill) => String(skill.id) === id)?.name
  const chips = [
    status !== 'ALL' && { key: 'status', label: STATUS_LABELS[status] ?? status, onRemove: () => handleFilterChange('status', 'ALL') },
    ...skillIds.map((id) => ({
      key: `skill-${id}`,
      label: skillName(id) ?? 'Habilidad',
      onRemove: () => handleFilterChange('skillIds', skillIds.filter((other) => other !== id).join(',')),
    })),
    filters.minBudget && { key: 'min', label: `Desde ${formatBudget(filters.minBudget)}`, onRemove: () => handleFilterChange('minBudget', '') },
    filters.maxBudget && { key: 'max', label: `Hasta ${formatBudget(filters.maxBudget)}`, onRemove: () => handleFilterChange('maxBudget', '') },
    filters.deadlineBefore && {
      key: 'date',
      label: `Entrega antes del ${formatDate(filters.deadlineBefore)}`,
      onRemove: () => handleFilterChange('deadlineBefore', ''),
    },
  ].filter(Boolean)

  const total = openCount.data?.totalElements
  const searching = search !== urlSearch

  return (
    <main className="mx-auto w-full max-w-[1248px] px-4 pb-20 pt-[45px] md:px-6 md:pb-[120px] md:pt-[70px]">
      <header className="mb-[35px] md:mb-[55px] md:flex md:items-end md:justify-between md:gap-10">
        <div>
          <p className="h-4 text-[11px] font-semibold tracking-[0.13em]">
            {total !== undefined && `${total} ${total === 1 ? 'PROYECTO ABIERTO' : 'PROYECTOS ABIERTOS'}`}
          </p>
          <h1 className="mt-5 text-[49px] font-semibold leading-[0.95] tracking-[-0.045em] md:text-[62px]">
            Trabajo real,
            <br />
            <em className="text-escrow">cerca de ti.</em>
          </h1>
        </div>
        <p className="mt-[25px] max-w-[390px] text-sm leading-relaxed text-muted md:mt-0 md:text-base">
          Proyectos publicados por negocios de Lima. Postula con una propuesta concreta.
        </p>
      </header>

      <form role="search" onSubmit={(event) => event.preventDefault()} className="flex gap-2.5 border-b border-line pb-4">
        <label className="flex min-h-12 flex-1 items-center gap-2.5 rounded-[11px] border border-line bg-white px-3.5 transition focus-within:border-ink focus-within:shadow-[0_0_0_3px_rgba(14,14,12,0.06)]">
          <Icon>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </Icon>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Busca por título del proyecto"
            aria-label="Buscar proyectos"
            className="w-full min-w-0 bg-transparent text-sm [&::-webkit-search-cancel-button]:hidden"
            // El foco se marca en el recuadro de afuera; la regla global de :focus-visible le ganaría a una clase
            style={{ outline: 'none' }}
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} aria-label="Limpiar búsqueda" className="grid cursor-pointer p-1">
              <Icon size={16}>
                <path d="m6 6 12 12M18 6 6 18" />
              </Icon>
            </button>
          )}
        </label>
        {/* En celular los filtros se esconden detrás de este botón; en escritorio siempre están a la izquierda */}
        <button
          type="button"
          onClick={() => setShowFilters((open) => !open)}
          aria-expanded={showFilters}
          aria-controls="filtros-explorar"
          aria-label={`Filtros${chips.length ? `, ${chips.length} activos` : ''}`}
          className="relative grid h-12 w-12 shrink-0 cursor-pointer place-items-center rounded-[11px] border border-[#bab7b0] transition hover:border-ink hover:bg-white md:hidden"
        >
          <Icon>
            <path d="M4 6h16M7 12h10M10 18h4" />
          </Icon>
          {chips.length > 0 && (
            <span className="absolute -right-1.5 -top-1.5 grid h-[18px] w-[18px] place-items-center rounded-full bg-ink text-[10px] text-white">
              {chips.length}
            </span>
          )}
        </button>
      </form>

      <div className="mb-[34px] mt-4 flex min-h-[30px] items-center gap-[7px] overflow-x-auto">
        {chips.map(({ key, ...chip }) => (
          <Chip key={key} {...chip} />
        ))}
        {(chips.length > 0 || urlSearch) && (
          <button type="button" onClick={handleClear} className="shrink-0 cursor-pointer text-[11px] underline">
            Limpiar todo
          </button>
        )}
      </div>

      <div className="md:grid md:grid-cols-[210px_minmax(0,1fr)] md:gap-[50px]">
        <aside
          id="filtros-explorar"
          aria-label="Filtros"
          className={`${showFilters ? 'mb-8 block rounded-2xl border border-line bg-surface p-5' : 'hidden'} md:mb-0 md:block md:border-0 md:bg-transparent md:p-0`}
        >
          <ProjectFilters filters={filters} onFilterChange={handleFilterChange} skills={skills.data} />
        </aside>

        <section aria-label="Resultados">
          <div className="mb-4 flex items-center justify-between text-xs text-muted">
            <p aria-live="polite">
              {data && (
                <>
                  Mostrando{' '}
                  <strong className="text-ink">
                    {data.totalElements} {data.totalElements === 1 ? 'resultado' : 'resultados'}
                  </strong>
                </>
              )}
              {searching && <span className="ml-2 text-[9px] text-escrow">Buscando…</span>}
            </p>
            <label className="hidden items-center md:flex">
              Ordenar por
              <select
                value={order.value}
                onChange={(event) => updateParams({ orden: event.target.value, page: null })}
                className="ml-[7px] cursor-pointer bg-transparent font-semibold text-ink"
              >
                {SORTS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {loading && <ProjectGrid loading />}

          {!loading && error && <ErrorBox message={error} status={httpStatus} onRetry={reload} />}

          {!loading && !error && data?.content.length === 0 && (
            <div className="flex min-h-[430px] flex-col items-center justify-center rounded-2xl border border-line bg-white p-6 text-center">
              <span className="grid h-[55px] w-[55px] place-items-center rounded-full bg-paper text-muted">
                <Icon size={26}>
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-4-4" />
                </Icon>
              </span>
              <h2 className="mb-1.5 mt-[18px] font-semibold">No hay proyectos con estos filtros</h2>
              <p className="mb-5 text-[11px] text-muted">Prueba cambiando el presupuesto, las habilidades o la fecha de entrega.</p>
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex min-h-[46px] cursor-pointer items-center rounded-[11px] border border-[#bab7b0] px-5 text-sm font-semibold transition hover:border-ink hover:bg-white"
              >
                Limpiar filtros
              </button>
            </div>
          )}

          {!loading && !error && data?.content.length > 0 && (
            <>
              <ProjectGrid projects={data.content} />
              <Pagination
                page={page}
                size={size}
                totalPages={data.totalPages}
                totalElements={data.totalElements}
                onPageChange={handlePageChange}
                onSizeChange={handleSizeChange}
              />
            </>
          )}
        </section>
      </div>
    </main>
  )
}

Icon.propTypes = {
  children: PropTypes.node,
  size: PropTypes.number,
}

Chip.propTypes = {
  label: PropTypes.string.isRequired,
  onRemove: PropTypes.func.isRequired,
}
