import { Link } from 'react-router-dom'

// Bloque del dashboard con título y un link opcional a la página completa
export default function DashboardSection({ title, linkTo, linkLabel, children }) {
  return (
    <section className="mt-8">
      <header className="mb-3 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {linkTo && (
          <Link to={linkTo} className="text-sm font-semibold text-primary-600 hover:underline">
            {linkLabel}
          </Link>
        )}
      </header>
      {children}
    </section>
  )
}
