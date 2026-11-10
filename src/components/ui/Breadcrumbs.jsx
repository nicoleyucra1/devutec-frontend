import { Link } from 'react-router-dom'

// Muestra dónde está la persona dentro de la app, por ejemplo Explorar › Web para pizzería › Postulantes.
// Cada paso con "to" es un link; el último es la página actual y queda como texto.
// Si un título todavía está cargando se puede pasar label vacío y aparece "…".
export default function Breadcrumbs({ items, className = '' }) {
  return (
    <nav aria-label="Ruta de navegación" className={`mb-5 ${className}`}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const label = item.label || '…'
          return (
            <li key={`${item.to ?? 'actual'}-${index}`} className="flex min-w-0 items-center gap-2">
              {item.to && !isLast ? (
                <Link
                  to={item.to}
                  className="rounded-sm underline-offset-2 transition-colors hover:text-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-progress"
                >
                  {label}
                </Link>
              ) : (
                <span aria-current={isLast ? 'page' : undefined} className="max-w-[28ch] truncate font-semibold text-ink">
                  {label}
                </span>
              )}
              {!isLast && (
                <span aria-hidden="true" className="text-[#aaa69d]">
                  ›
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
