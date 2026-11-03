const SIZES = [10, 25, 50]

//Números a mostrar: la primera, la última y las cercanas a la actual. Los huecos se marcan con '...'
function pageNumbers(page, totalPages) {
  const pages = []
  for (let n = 1; n <= totalPages; n++) {
    if (n === 1 || n === totalPages || Math.abs(n - page) <= 1) {
      pages.push(n)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }
  return pages
}

//page empieza en 1
export default function Pagination({ page, size, totalPages, totalElements, onPageChange, onSizeChange }) {
  if (!totalElements) return null

  const from = (page - 1) * size + 1
  const to = Math.min(page * size, totalElements)
  const buttonClass = 'min-w-9 rounded-lg border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <nav aria-label="Paginación" className="mt-6 flex flex-wrap items-center justify-between gap-4">
      <p className="text-sm text-gray-600">
        Mostrando {from}–{to} de {totalElements}
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          className={`${buttonClass} border-gray-300 hover:bg-gray-50`}
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          Anterior
        </button>
        {pageNumbers(page, totalPages).map((n, index) =>
          n === '...' ? (
            <span key={`dots-${index}`} className="px-2 text-gray-400">
              ...
            </span>
          ) : (
            <button
              key={n}
              type="button"
              aria-current={n === page ? 'page' : undefined}
              className={`${buttonClass} ${n === page ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-300 hover:bg-gray-50'}`}
              onClick={() => onPageChange(n)}
            >
              {n}
            </button>
          ),
        )}
        <button
          type="button"
          className={`${buttonClass} border-gray-300 hover:bg-gray-50`}
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Siguiente
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-600">
        Por página
        <select
          value={size}
          onChange={(event) => onSizeChange(Number(event.target.value))}
          className="rounded-lg border border-gray-300 px-2 py-1.5"
        >
          {SIZES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    </nav>
  )
}