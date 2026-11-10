import { useSearchParams } from 'react-router-dom'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import ButtonLink from '../../components/projects/ButtonLink'
import ErrorBox from '../../components/projects/ErrorBox'
import ProjectGrid from '../../components/projects/ProjectGrid'
import { useMyProjects } from '../../hooks/useMyProjects'
import { readPageParams } from '../../utils/pageParams'

export default function MyProjects() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { page, size } = readPageParams(searchParams)
  const { data, loading, error, status, reload } = useMyProjects({ page, size })

  const setPageParams = (nextPage, nextSize) => {
    const params = {}
    if (nextPage > 1) params.page = nextPage
    if (nextSize !== 10) params.size = nextSize
    setSearchParams(params)
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis proyectos</h1>
          <p className="mt-1 text-sm text-gray-500">Los proyectos que publicaste, del más reciente al más antiguo</p>
        </div>
        <ButtonLink to="/projects/new">+ Publicar proyecto</ButtonLink>
      </header>

      {loading && <ProjectGrid loading />}

      {!loading && error && <ErrorBox message={error} status={status} onRetry={reload} />}

      {!loading && !error && data?.content.length === 0 && (
        <EmptyState
          title="Todavía no has publicado proyectos"
          message="Cuenta qué necesitas y recibe propuestas de estudiantes de UTEC."
          action={<ButtonLink to="/projects/new">Publicar mi primer proyecto</ButtonLink>}
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
            onPageChange={(nextPage) => setPageParams(nextPage, size)}
            onSizeChange={(nextSize) => setPageParams(1, nextSize)}
          />
        </>
      )}
    </main>
  )
}
