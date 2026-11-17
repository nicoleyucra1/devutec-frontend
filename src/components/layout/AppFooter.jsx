import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const linkClass = 'transition hover:text-ink hover:underline'

// Pie mínimo de la app con sesión iniciada: deja a mano los términos y la privacidad.
// Sin sesión no se muestra, porque la landing tiene su propio footer grande.
export default function AppFooter() {
  const { user } = useAuth()
  if (!user) return null

  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex w-full max-w-[1248px] flex-wrap items-center gap-x-5 gap-y-2 px-4 py-6 text-xs text-muted md:px-6">
        <span>© 2026 DEVUTEC</span>
        <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2">
          <Link to="/terminos" className={linkClass}>
            Términos y condiciones
          </Link>
          <Link to="/privacidad" className={linkClass}>
            Política de privacidad
          </Link>
          <a href="mailto:hola@devutec.pe" className={linkClass}>
            hola@devutec.pe
          </a>
        </nav>
      </div>
    </footer>
  )
}
