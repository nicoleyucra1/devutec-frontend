import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Logo from '../brand/Logo'
import AvatarUploader from '../profile/AvatarUploader'
import PhoneEditor from '../profile/PhoneEditor'
import ThemePicker from '../profile/ThemePicker'
import ButtonLink from '../projects/ButtonLink'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import { linksForRole, ROLE_LABELS } from './navLinks'
import PropTypes from 'prop-types'
import { userShape } from '../../utils/propShapes'

const desktopLinkClass = ({ isActive }) =>
  `relative flex h-full items-center text-sm transition-colors after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 ${
    isActive ? 'text-ink after:bg-ink' : 'text-muted hover:text-ink after:bg-transparent'
  }`

const mobileLinkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-surface text-ink' : 'text-muted hover:text-ink'}`

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

const menuIcon = (children) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-muted">
    {children}
  </svg>
)

const ICONS = {
  account: menuIcon(
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="10" r="3" />
      <path d="M6.2 18.4a7 7 0 0 1 11.6 0" />
    </>,
  ),
  profile: menuIcon(
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>,
  ),
  edit: menuIcon(
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </>,
  ),
  contracts: menuIcon(
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </>,
  ),
  logout: menuIcon(
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5M21 12H9" />
    </>,
  ),
}

// Opciones del menú del avatar (diseño "Tema · menú"): Mi cuenta (foto y celular), Mi perfil y Editar perfil
// (solo el freelancer tiene perfil público), Mis contratos, el tema y cerrar sesión
function UserMenuItems({ user, onNavigate, onLogout, onPhoto }) {
  const itemClass = 'flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left text-sm hover:bg-soft'
  return (
    <>
      <div className="border-b border-line py-1.5">
        {user.rol !== 'ADMIN' && (
          <button type="button" onClick={onPhoto} className={itemClass}>
            {ICONS.account}
            Mi cuenta
          </button>
        )}
        {user.rol === 'FREELANCER' && user.id && (
          <Link to={`/freelancers/${user.id}`} onClick={onNavigate} className={itemClass}>
            {ICONS.profile}
            Mi perfil
          </Link>
        )}
        {user.rol === 'FREELANCER' && (
          <Link to="/profile/edit" onClick={onNavigate} className={itemClass}>
            {ICONS.edit}
            Editar perfil
          </Link>
        )}
        {user.rol !== 'ADMIN' && (
          <Link to="/contracts" onClick={onNavigate} className={itemClass}>
            {ICONS.contracts}
            Mis contratos
          </Link>
        )}
      </div>
      <div className="border-b border-line px-1.5 py-3">
        <ThemePicker />
      </div>
      <div className="pt-1.5">
        <button type="button" onClick={onLogout} className={itemClass}>
          {ICONS.logout}
          Cerrar sesión
        </button>
      </div>
    </>
  )
}

// Barra superior para usuarios con sesión, como en el diseño: logo, links según el rol y menú del avatar.
// En pantallas chicas los links pasan a un menú desplegable.
export default function Navbar() {
  const { user, logout } = useAuth()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [photoOpen, setPhotoOpen] = useState(false)
  const userMenuRef = useCloseOnOutside(userMenuOpen, setUserMenuOpen)

  if (!user) return null

  const links = linksForRole(user.rol)
  const name = user.nombre ?? user.email
  const closeAll = () => {
    setUserMenuOpen(false)
    setMobileOpen(false)
  }
  const openPhoto = () => {
    closeAll()
    setPhotoOpen(true)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-[1200px] items-center gap-8 px-6">
        <Link to="/" onClick={closeAll} aria-label="DEVUTEC, ir al inicio">
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
              aria-controls="menu-usuario"
              className="flex items-center gap-2 rounded-full border border-line py-1 pl-1 pr-3 text-sm font-medium transition-colors hover:border-gray-400"
            >
              <Avatar name={name} src={user.avatarUrl} size="nav" />
              <span>{name.split(' ')[0]}</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d={userMenuOpen ? 'm6 15 6-6 6 6' : 'm6 9 6 6 6-6'} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {userMenuOpen && (
              <div
                id="menu-usuario"
                className="absolute right-0 top-[52px] w-[280px] rounded-2xl border border-line bg-raised p-2 shadow-[0_16px_45px_rgba(0,0,0,0.14)]"
              >
                <div className="flex items-center gap-3 border-b border-line px-2.5 pb-3.5 pt-2.5">
                  <Avatar name={name} src={user.avatarUrl} size="md" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{name}</span>
                    <span className="block truncate text-xs text-muted">{user.email ?? ROLE_LABELS[user.rol]}</span>
                  </span>
                </div>
                <UserMenuItems user={user} onNavigate={closeAll} onLogout={logout} onPhoto={openPhoto} />
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
              <Avatar name={name} src={user.avatarUrl} size="nav" />
              <span>
                <span className="block text-sm font-semibold">{name}</span>
                <span className="block text-xs text-muted">{ROLE_LABELS[user.rol] ?? user.rol}</span>
              </span>
            </div>
            <UserMenuItems user={user} onNavigate={closeAll} onLogout={logout} onPhoto={openPhoto} />
          </div>
        </div>
      )}

      <Modal open={photoOpen} title="Mi cuenta" kicker={name.toUpperCase()} onClose={() => setPhotoOpen(false)}>
        {photoOpen && (
          <div className="mt-2 grid gap-6">
            <AvatarUploader />
            <div className="border-t border-line pt-6">
              <PhoneEditor help="Solo lo ve la otra persona cuando tienen un contrato, para escribirte por WhatsApp." />
            </div>
          </div>
        )}
        <div className="mt-7 flex justify-end">
          <Button variant="secondary" onClick={() => setPhotoOpen(false)}>
            Listo
          </Button>
        </div>
      </Modal>
    </header>
  )
}

UserMenuItems.propTypes = {
  user: userShape.isRequired,
  onNavigate: PropTypes.func,
  onLogout: PropTypes.func.isRequired,
  onPhoto: PropTypes.func.isRequired,
}
