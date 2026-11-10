import { useSearchParams } from 'react-router-dom'
import { readPageParams } from '../utils/pageParams'

// Filtro de estado, búsqueda y página de una lista guardados en la URL (?estado=&q=&page=&size=), así se
// pueden compartir o recargar sin perderlos. Cambiar el filtro o la búsqueda vuelve a la página 1.
export function useListParams(defaults = {}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const { page, size } = readPageParams(searchParams)

  const update = (changes, { resetPage = true } = {}) => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)
        Object.entries(changes).forEach(([key, value]) => {
          if (value === '' || value === null || value === undefined || value === defaults[key]) next.delete(key)
          else next.set(key, String(value))
        })
        if (resetPage && !('page' in changes)) next.delete('page')
        return next
      },
      { replace: true },
    )
  }

  return {
    status: searchParams.get('estado') ?? 'ALL',
    query: searchParams.get('q') ?? '',
    sort: searchParams.get('orden') ?? defaults.orden ?? '',
    page,
    size,
    setStatus: (status) => update({ estado: status === 'ALL' ? '' : status }),
    setQuery: (query) => update({ q: query }),
    setSort: (sort) => update({ orden: sort }),
    setPage: (nextPage) => update({ page: nextPage === 1 ? '' : nextPage }, { resetPage: false }),
    setSize: (nextSize) => update({ size: nextSize === 10 ? '' : nextSize }),
    clear: () => update({ estado: '', q: '' }),
  }
}
