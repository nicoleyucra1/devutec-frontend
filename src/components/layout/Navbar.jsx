import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { linksForRole, ROLE_LABELS } from './navLinks'

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
  }`

// Barra superior para usuarios con sesión: links según el rol, datos del usuario y cerrar sesión.
// En pantallas chicas los links pasan a un menú desplegable.
export default function Navbar() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  if (!user) return null

  const links = linksForRole(user.rol)
  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
        <Link to="/" onClick={closeMenu} className="text-lg font-bold text-primary-600">
          DevUTEC
        </Link>

        <nav aria-label="Principal" className="hidden flex-1 items-center gap-1 lg:flex">
          {/* "end" evita que Explorar proyectos quede marcado al estar en /projects/new */}
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-4 lg:flex">
          <UserInfo user={user} />
          <LogoutButton onClick={logout} />
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="menu-movil"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          className="ml-auto rounded-lg p-2 text-gray-600 hover:bg-gray-50 lg:hidden"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            {menuOpen ? (
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div id="menu-movil" className="border-t border-gray-200 px-4 py-3 lg:hidden">
          <nav aria-label="Principal" className="flex flex-col gap-1">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end onClick={closeMenu} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
            <UserInfo user={user} />
            <LogoutButton onClick={logout} />
          </div>
        </div>
      )}
    </header>
  )
}

function UserInfo({ user }) {
  return (
    <div className="text-sm leading-tight lg:text-right">
      <p className="font-medium text-gray-900">{user.nombre ?? user.email}</p>
      <p className="text-gray-500">{ROLE_LABELS[user.rol] ?? user.rol}</p>
    </div>
  )
}

function LogoutButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
    >
      Cerrar sesión
    </button>
  )
}
