import { Link } from 'react-router-dom'
import Logo from '../brand/Logo'

const titleClass = 'mb-2 text-[10px] font-semibold tracking-[0.12em] text-[#87857f]'
const linkClass = 'text-xs text-white hover:underline'

// Pie de la landing: marca, enlaces de la plataforma, confianza y contacto
export default function SiteFooter() {
  return (
    <footer className="bg-ink pb-[25px] pt-[55px] text-white lg:pt-[70px]">
      <div className="mx-auto w-full max-w-[1200px] px-6">
        <div className="grid grid-cols-2 gap-x-[25px] gap-y-[45px] pb-[70px] lg:grid-cols-[2fr_1fr_1fr_1fr] lg:gap-[60px]">
          <div className="col-span-2 flex flex-col items-start gap-3 lg:col-span-1">
            <Logo tone="night" className="text-base" />
            <p className="font-serif text-xl italic text-[#8f8d86]">Trabajo junior con reglas de adulto.</p>
          </div>

          <nav aria-label="Plataforma" className="flex flex-col items-start gap-3">
            <p className={titleClass}>Plataforma</p>
            <Link to="/register?rol=CLIENT" className={linkClass}>
              Publicar proyecto
            </Link>
            <Link to="/projects" className={linkClass}>
              Buscar proyectos
            </Link>
          </nav>

          <nav aria-label="Confianza" className="flex flex-col items-start gap-3">
            <p className={titleClass}>Confianza</p>
            <a href="#como-funciona" className={linkClass}>
              Cómo funciona el escrow
            </a>
            <span className="text-xs text-white">Términos y condiciones</span>
          </nav>

          <div className="flex flex-col items-start gap-3">
            <p className={titleClass}>Contacto</p>
            <span className="text-xs text-white">hola@devutec.pe</span>
            <span className="text-xs text-white">Lima, Perú</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-[#343430] pt-6 text-[10px] text-[#77756f] sm:flex-row sm:justify-between">
          <p>© 2026 DevUTEC</p>
          <p>Hecho para el talento que recién empieza.</p>
        </div>
      </div>
    </footer>
  )
}
