import PublicHeader from '../components/layout/PublicHeader'
import Cuyi from '../components/brand/Cuyi'
import ButtonLink from '../components/projects/ButtonLink'
import { useAuth } from '../hooks/useAuth'

const iconProps = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

// Página 404 del diseño (v2): un "404" gigante con Cuyi confundido dentro del 0, el aviso de que los pagos
// en garantía siguen intactos y dos caminos para volver. Con sesión se ve la navbar; sin sesión, la barra pública.
export default function NotFound() {
  const { user } = useAuth()

  return (
    <>
      {!user && <PublicHeader />}
      <main className="mx-auto flex min-h-[calc(100vh_-_73px)] w-full max-w-[1200px] flex-col items-center justify-center px-6 pb-[72px] pt-14 text-center">
        <div
          role="img"
          aria-label="Error 404"
          className="flex items-center justify-center gap-1.5 text-[clamp(132px,18vw,248px)] font-semibold leading-[0.8] tracking-[-0.07em] tabular-nums sm:gap-3.5"
        >
          <span aria-hidden="true" className="tracking-normal">
            4
          </span>
          <span aria-hidden="true" className="grid h-[0.8em] w-[0.8em] flex-none place-items-center rounded-full bg-lime">
            <span className="-m-6 grid h-32 w-32 scale-[0.62] place-items-center sm:m-0 sm:scale-100">
              <Cuyi anim="confundido" px={8} />
            </span>
          </span>
          <span aria-hidden="true" className="tracking-normal">
            4
          </span>
        </div>

        <h1 className="mb-3.5 mt-11 text-[clamp(34px,4.2vw,56px)] font-semibold leading-[1.02] tracking-[-0.04em]">
          Esta página nunca <em className="text-[1.1em] tracking-[-0.01em] text-escrow">se entregó.</em>
        </h1>
        <p className="m-0 max-w-[460px] text-base leading-relaxed text-muted">
          Puede que el enlace esté roto o que el proyecto ya no exista.
        </p>

        <p className="mt-[22px] inline-flex items-center gap-2.5 rounded-full bg-[#e7efe9] py-2 pl-2 pr-4 text-left text-sm leading-[1.3] text-escrow">
          <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-escrow text-paper">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6L12 3Z" />
              <path d="m8.8 12 2.2 2.2 4.2-4.4" />
            </svg>
          </span>
          <span>
            <strong className="font-semibold">Tus pagos en garantía están intactos.</strong> Nada se movió.
          </span>
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-2.5">
          <ButtonLink to="/">
            <svg {...iconProps}>
              <path d="m3 11 9-8 9 8" />
              <path d="M5 10v10h14V10M9 20v-6h6v6" />
            </svg>
            Volver al inicio
          </ButtonLink>
          <ButtonLink to="/projects" variant="secondary">
            <svg {...iconProps}>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
            Explorar proyectos
          </ButtonLink>
        </div>
      </main>
    </>
  )
}
