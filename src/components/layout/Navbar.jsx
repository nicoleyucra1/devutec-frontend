import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Logo from '../brand/Logo'
import ButtonLink from '../projects/ButtonLink'
import { initials, linksForRole, ROLE_LABELS } from './navLinks'

const desktopLinkClass = ({ isActive }) =>
  `relative flex h-full items-center text-sm transition-colors after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 ${
    isActive ? 'text-ink after:bg-ink' : 'text-muted hover:text-ink after:bg-transparent'
  }`

const mobileLinkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-white text-ink' : 'text-muted hover:text-ink'}`

// Se cierra al hacer clic fuera del menú o al apretar Esc
function useCloseOnOutside(open, setOpen) {
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const onPointer = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false)
    }
    const onKey = (event) => event.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, setOpen])
  return ref
}

// Opciones del menú del avatar: el perfil del freelancer y cerrar sesión
function UserMenuItems({ user, onNavigate, onLogout }) {
  const itemClass = 'block w-full rounded-md px-2.5 py-2.5 text-left text-xs hover:bg-paper'
  return (
    <>
      {user.rol === 'FREELANCER' && user.id && (
        <Link to={`/freelancers/${user.id}`} onClick={onNavigate} className={itemClass}>
          Ver mi perfil público
        </Link>
      )}
      {user.rol === 'FREELANCER' && (
        <Link to="/profile/edit" onClick={onNavigate} className={itemClass}>
          Editar mi perfil
        </Link>
      )}
      <button type="button" onClick={onLogout} className={itemClass}>
        Cerrar sesión
      </button>
    </>
  )
}

// Barra superior para usuarios con sesión, como en el diseño: logo, links según el rol y menú del avatar.
// En pantallas chicas los links pasan a un menú desplegable.
export default function Navbar() {
  const { user, logout } = useAuth()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const userMenuRef = useCloseOnOutside(userMenuOpen, setUserMenuOpen)

  if (!user) return null

  const links = linksForRole(user.rol)
  const name = user.nombre ?? user.email
  const closeAll = () => {
    setUserMenuOpen(false)
    setMobileOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-[1200px] items-center gap-8 px-6">
        <Link to="/" onClick={closeAll} aria-label="DevUTEC, ir al inicio">
          <Logo />
        </Link>

        <nav aria-label="Principal" className="hidden h-full flex-1 items-center justify-center gap-8 lg:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={desktopLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-4 lg:flex">
          {user.rol === 'CLIENT' && (
            <ButtonLink to="/projects/new" className="min-h-10 px-4">
              Publicar proyecto
            </ButtonLink>
          )}
          <div ref={userMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen((open) => !open)}
              aria-expanded={userMenuOpen}
              aria-haspopup="menu"
              className="flex items-center gap-2 text-sm"
            >
              <span className="grid h-[34px] w-[34px] place-items-center rounded-full bg-ink text-[11px] font-semibold tracking-wide text-white">
                {initials(name)}
              </span>
              <span>{name.split(' ')[0]}</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d={userMenuOpen ? 'm6 15 6-6 6 6' : 'm6 9 6 6 6-6'} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {userMenuOpen && (
              <div role="menu" className="absolute right-0 top-12 w-[230px] rounded-xl border border-line bg-white p-2 shadow-[0_16px_45px_rgba(0,0,0,0.12)]">
                <div className="mb-1 border-b border-line px-2.5 pb-3.5 pt-2.5">
                  <p className="text-xs font-semibold">{name}</p>
                  <p className="mt-0.5 text-[11px] text-muted">{ROLE_LABELS[user.rol] ?? user.rol}</p>
                </div>
                <UserMenuItems user={user} onNavigate={closeAll} onLogout={logout} />
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-expanded={mobileOpen}
          aria-controls="menu-movil"
          aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
          className="ml-auto rounded-lg p-2 text-ink hover:bg-soft lg:hidden"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            {mobileOpen ? (
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div id="menu-movil" className="border-t border-line px-4 py-3 lg:hidden">
          <nav aria-label="Principal" className="flex flex-col gap-1">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} onClick={closeAll} className={mobileLinkClass}>
                {link.label}
              </NavLink>
            ))}
            {user.rol === 'CLIENT' && (
              <NavLink to="/projects/new" onClick={closeAll} className={mobileLinkClass}>
                Publicar proyecto
              </NavLink>
            )}
          </nav>
          <div className="mt-3 border-t border-line pt-3">
            <div className="mb-2 flex items-center gap-2.5 px-2.5">
              <span className="grid h-[34px] w-[34px] place-items-center rounded-full bg-ink text-[11px] font-semibold text-white">
                {initials(name)}
              </span>
              <span>
                <span className="block text-sm font-semibold">{name}</span>
                <span className="block text-xs text-muted">{ROLE_LABELS[user.rol] ?? user.rol}</span>
              </span>
            </div>
            <UserMenuItems user={user} onNavigate={closeAll} onLogout={logout} />
          </div>
        </div>
      )}
    </header>
  )
}
