import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import EmptyState from '../../components/ui/EmptyState'
import Button from '../../components/ui/Button'
import Pagination from '../../components/ui/Pagination'
import ButtonLink from '../../components/projects/ButtonLink'
import ProjectFilters from '../../components/projects/ProjectFilters'
import ProjectGrid from '../../components/projects/ProjectGrid'
import ErrorBox from '../../components/projects/ErrorBox'
import { useProjects } from '../../hooks/useProjects'
import { useSkills } from '../../hooks/useSkills'
import { useDebounce } from '../../hooks/useDebounce'
import { useAuth } from '../../hooks/useAuth'
import { readPageParams } from '../../utils/pageParams'

const FILTER_KEYS = ['status', 'minBudget', 'maxBudget', 'deadlineBefore']

// Habilidades elegidas en la URL: ?skillIds=3,7 (los links viejos con ?skillId=3 también sirven)
const readSkillIds = (params) => (params.get('skillIds') ?? params.get('skillId') ?? '').split(',').filter(Boolean)

// Explorar proyectos: los filtros y la página viven en la URL (?search=&status=&page=2&size=25),
// así se puede compartir el enlace o volver atrás sin perder la búsqueda.
export default function ProjectsExplore() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const { page, size } = readPageParams(searchParams)
  const urlSearch = searchParams.get('search') ?? ''

  const filters = useMemo(
    () => ({ ...Object.fromEntries(FILTER_KEYS.map((key) => [key, searchParams.get(key) ?? ''])), skillIds: readSkillIds(searchParams) }),
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
  const { skillIds, ...otherFilters } = filters
  const skillParams = skillIds.length === 1 ? { skillId: skillIds[0] } : { skillIds: skillIds.join(',') }
  const { data, loading, error, status, reload } = useProjects({ ...otherFilters, ...skillParams, search: urlSearch, page, size })
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
    setSearchParams({})
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Explorar proyectos</h1>
          <p className="mt-1 text-sm text-gray-500">
            {data ? `${data.totalElements} proyecto(s) encontrados` : 'Encuentra un proyecto que encaje contigo'}
          </p>
        </div>
        {user?.rol === 'CLIENT' && (
          <div className="flex gap-2">
            <ButtonLink to="/my-projects" variant="secondary">
              Mis proyectos
            </ButtonLink>
            <ButtonLink to="/projects/new">+ Publicar proyecto</ButtonLink>
          </div>
        )}
      </header>

      <ProjectFilters
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        onFilterChange={handleFilterChange}
        skills={skills.data}
        onClear={handleClear}
      />

      {loading && <ProjectGrid loading />}

      {!loading && error && <ErrorBox message={error} status={status} onRetry={reload} />}

      {!loading && !error && data?.content.length === 0 && (
        <EmptyState
          title="No hay proyectos que coincidan"
          message="Prueba con otras palabras o quita algunos filtros."
          action={
            <Button variant="secondary" onClick={handleClear}>
              Limpiar filtros
            </Button>
          }
        />
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
    </main>
  )
}
