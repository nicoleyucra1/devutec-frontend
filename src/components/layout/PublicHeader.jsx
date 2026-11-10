import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../brand/Logo'
import ButtonLink from '../projects/ButtonLink'

// Secciones de la landing; se enlazan por su id
const SECTIONS = [
  { href: '/#como-funciona', label: 'Cómo funciona' },
  { href: '/#negocios', label: 'Para negocios' },
  { href: '/#estudiantes', label: 'Para estudiantes' },
]

// Barra superior para quien no inició sesión: logo, secciones de la landing, Ingresar y Crear cuenta
export default function PublicHeader() {
  // Apenas se baja un poco, la barra toma una sombra suave para separarse del contenido
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-md transition-shadow duration-300 ${
        scrolled ? 'shadow-[0_6px_24px_rgba(14,14,12,0.06)]' : ''
      }`}
    >
      <div className="mx-auto grid h-[72px] max-w-[1200px] grid-cols-[1fr_auto] items-center gap-6 px-6 md:grid-cols-[1fr_auto_1fr]">
        <Link to="/" aria-label="DevUTEC, ir al inicio" className="justify-self-start">
          <Logo />
        </Link>
        <nav aria-label="Secciones" className="hidden items-center gap-8 md:flex">
          {SECTIONS.map((section) => (
            <a key={section.href} href={section.href} className="text-sm text-muted transition-colors hover:text-ink">
              {section.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3 justify-self-end">
          <Link to="/login" className="hidden p-2.5 text-[13px] font-semibold sm:block">
            Ingresar
          </Link>
          <ButtonLink to="/register" className="min-h-10 px-4">
            Crear cuenta
          </ButtonLink>
        </div>
      </div>
    </header>
  )
}
