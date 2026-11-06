import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import EscrowCarousel from '../components/landing/EscrowCarousel'
import HowItWorks from '../components/landing/HowItWorks'
import SiteFooter from '../components/landing/SiteFooter'
import PublicHeader from '../components/layout/PublicHeader'
import ButtonLink from '../components/projects/ButtonLink'
import Badge from '../components/ui/Badge'

const shell = 'mx-auto w-full max-w-[1200px] px-6'
const kicker = 'text-[11px] font-semibold tracking-[0.13em]'

const PROOF = [
  { value: '100%', label: 'estudiantes verificados' },
  { value: '0%', label: 'pago por adelantado' },
  { value: '48 h', label: 'para recibir propuestas' },
]

const IMPACT = [
  { value: '42', label: 'proyectos publicados' },
  { value: '31', label: 'pagos liberados' },
  { value: '4.8/5', label: 'satisfacción promedio' },
]

function Avatar({ children, className = 'bg-ink text-white' }) {
  return (
    <span
      className={`grid h-[34px] w-[34px] flex-none place-items-center rounded-full text-[11px] font-semibold tracking-[0.03em] ${className}`}
    >
      {children}
    </span>
  )
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M5 12h14m-5-5 5 5-5 5" />
    </svg>
  )
}

function Hero() {
  return (
    <section className={`${shell} grid items-center gap-[52px] py-[55px] lg:min-h-[650px] lg:grid-cols-[1.05fr_.95fr] lg:gap-24 lg:py-[70px]`}>
      <div>
        <p className={kicker}>TALENTO UTEC · PAGOS PROTEGIDOS</p>
        <h1 className="my-[22px] max-w-[360px] text-[53px] font-semibold leading-[0.94] tracking-[-0.052em] sm:max-w-[650px] lg:mb-[30px] lg:mt-7 lg:text-[clamp(58px,5.25vw,72px)]">
          Contrata talento junior de UTEC.{' '}
          <em className="block text-escrow">
            Paga solo cuando{' '}
            {/* Trazo lima a mano que se dibuja una vez al cargar, como un resaltador */}
            <span className="relative isolate inline-block">
              apruebes.
              <svg
                aria-hidden="true"
                viewBox="0 0 200 16"
                preserveAspectRatio="none"
                className="absolute bottom-[0.02em] left-[-3%] -z-10 h-[0.3em] w-[106%]"
              >
                <path
                  d="M4 11C46 5 112 3 196 8"
                  pathLength="1"
                  fill="none"
                  stroke="#d7f25c"
                  strokeWidth="9"
                  strokeLinecap="round"
                  style={{ strokeDasharray: 1, strokeDashoffset: 1, animation: 'draw-stroke .8s var(--ease-brand) .5s forwards' }}
                />
              </svg>
            </span>
          </em>
        </h1>
        <p className="max-w-[530px] text-base leading-normal text-[#4c4b47] lg:text-lg lg:leading-[1.55]">
          Publica lo que necesitas, recibe propuestas de estudiantes verificados y mantén tu dinero protegido hasta revisar
          la entrega.
        </p>

        <div className="mt-8 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <ButtonLink to="/register?rol=CLIENT">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="7" width="18" height="13" rx="2" />
              <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 12h18" />
            </svg>
            Publicar un proyecto
          </ButtonLink>
          <a
            href="#como-funciona"
            className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-[11px] px-3 text-sm font-semibold transition hover:bg-soft"
          >
            <ArrowIcon />
            Ver cómo funciona
          </a>
        </div>

        <dl className="mt-[38px] flex justify-between gap-[15px] sm:mt-[54px] sm:justify-start sm:gap-10">
          {PROOF.map((item) => (
            <div key={item.label} className="flex flex-col-reverse gap-[5px]">
              <dt className="text-[9px] text-muted sm:text-xs">{item.label}</dt>
              <dd className="text-[19px] font-semibold tabular-nums sm:text-[22px]">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <EscrowCarousel />
    </section>
  )
}

function ForBusinesses() {
  return (
    <section
      id="negocios"
      className={`${shell} grid scroll-mt-[72px] items-center gap-[55px] py-[75px] lg:grid-cols-[.85fr_1.15fr] lg:gap-[120px] lg:py-[110px]`}
    >
      <div>
        <p className={kicker}>PARA NEGOCIOS</p>
        <h2 className="mb-[25px] mt-5 text-[38px] leading-[1.02] tracking-[-0.04em] lg:text-[46px]">
          Una web nueva sin poner tu dinero <em>en riesgo.</em>
        </h2>
        <p className="mb-[30px] max-w-[480px] text-base leading-[1.65] text-muted">
          Trabaja con talento local para resolver tareas digitales específicas. El alcance queda por escrito y el pago solo
          se mueve con tu aprobación.
        </p>
        <ButtonLink to="/register?rol=CLIENT">
          <ArrowIcon />
          Publicar como cliente
        </ButtonLink>
      </div>

      {/* Tarjeta de ejemplo de un proyecto publicado, con un contorno desplazado detrás */}
      <div className="relative isolate">
        <div
          aria-hidden="true"
          className="absolute inset-[15px_-8px_-15px_15px] -z-10 rounded-[20px] border border-line lg:inset-[28px_-28px_-28px_28px]"
        />
        <article className="rounded-[20px] border border-line bg-surface p-[21px] shadow-[0_24px_60px_rgba(14,14,12,0.06)] lg:p-[30px]">
          <div className="flex items-center gap-3 border-b border-line pb-7">
            <span className="grid h-[52px] w-[52px] flex-none place-items-center rounded-full bg-escrow text-sm font-semibold text-white">
              DM
            </span>
            <span className="flex flex-col gap-[3px]">
              <small className="text-[9px] tracking-[0.05em] text-muted">PUBLICADO POR</small>
              <strong className="text-[13px] font-semibold">Pizzería Don Mario</strong>
              <small className="text-[9px] text-muted">Barranco · Negocio verificado</small>
            </span>
            <span className="ml-auto">
              <Badge color="green">Abierto</Badge>
            </span>
          </div>

          <p className={`${kicker} mt-[35px] text-muted`}>PROYECTO</p>
          <h3 className="mb-7 mt-2.5 text-[27px] tracking-[-0.03em] lg:text-[32px]">Web para pizzería</h3>

          <dl className="grid grid-cols-2 border-y border-line">
            <div className="flex flex-col-reverse gap-1.5 py-[18px]">
              <dt className="text-[10px] text-muted">Presupuesto</dt>
              <dd className="text-lg font-semibold tabular-nums">S/ 600.00</dd>
            </div>
            <div className="flex flex-col-reverse gap-1.5 border-l border-line py-[18px] pl-[25px]">
              <dt className="text-[10px] text-muted">Entrega</dt>
              <dd className="text-lg font-semibold tabular-nums">15 dic 2026</dd>
            </div>
          </dl>

          <div className="mt-5 flex flex-wrap gap-1.5">
            {['React', 'Spring Boot'].map((skill) => (
              <span key={skill} className="rounded-[7px] border border-line bg-paper px-[9px] py-1.5 text-[11px]">
                {skill}
              </span>
            ))}
          </div>

          <div className="mt-9 flex items-center gap-3 border-t border-line pt-5 text-[11px] text-muted">
            <span className="flex items-center">
              {['CR', 'DQ', '+4'].map((label, i) => (
                <Avatar key={label} className={`bg-lime text-ink ${i > 0 ? '-ml-[9px] border-2 border-white' : ''}`}>
                  {label}
                </Avatar>
              ))}
            </span>
            6 propuestas recibidas
          </div>
        </article>
      </div>
    </section>
  )
}

function ForStudents() {
  return (
    <section id="estudiantes" className="scroll-mt-[72px] bg-[#ece9e1] py-[75px] lg:py-[105px]">
      <div className={`${shell} flex flex-col-reverse gap-[50px] lg:grid lg:grid-cols-[.8fr_1.2fr] lg:items-center lg:gap-[130px]`}>
        {/* Perfil de ejemplo de una freelancer */}
        <article className="rounded-[18px] border border-line bg-surface p-6 shadow-[0_24px_60px_rgba(14,14,12,0.06)] lg:-rotate-1">
          <div className="flex items-center gap-3">
            <span className="grid h-[52px] w-[52px] flex-none place-items-center rounded-full bg-escrow text-sm font-semibold text-white">
              CR
            </span>
            <div>
              <h3 className="mb-1 text-lg">Camila Ríos</h3>
              <p className="text-[11px] text-muted">UTEC · Ciencia de la Computación · Ciclo 6</p>
            </div>
            <span className="ml-auto self-start">
              <Badge color="green">Aceptada</Badge>
            </span>
          </div>

          <p className="my-[22px] flex items-center gap-1.5 text-[13px]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#d7f25c" stroke="#0e0e0c" strokeWidth="1.4" strokeLinejoin="round" aria-hidden="true">
              <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3l-5.5 2.9 1-6.2L3 9.6l6.2-.9L12 3Z" />
            </svg>
            <strong className="font-semibold">4.8</strong>
            <span className="text-muted">12 reseñas</span>
          </p>

          <dl className="grid grid-cols-[2fr_1fr] border-y border-line">
            <div className="flex flex-col-reverse gap-[7px] py-[18px]">
              <dt className="text-[9px] tracking-[0.1em] text-muted">TARIFA</dt>
              <dd className="text-[22px] font-semibold tabular-nums">
                S/ 35.00<span className="text-[11px] font-normal">/h</span>
              </dd>
            </div>
            <div className="flex flex-col-reverse gap-[7px] border-l border-line py-[18px] pl-[18px]">
              <dt className="text-[9px] tracking-[0.1em] text-muted">PROYECTOS</dt>
              <dd className="text-[22px] font-semibold tabular-nums">08</dd>
            </div>
          </dl>

          <p className="flex flex-col gap-2 pt-[18px] text-[11px] underline sm:flex-row sm:justify-between">
            <span>github.com/camila-rios</span>
            <span>camilarios.dev</span>
          </p>
        </article>

        <div>
          <p className={kicker}>PARA ESTUDIANTES</p>
          <h2 className="mb-[25px] mt-5 max-w-[620px] text-[38px] leading-[1.02] tracking-[-0.04em] lg:text-[46px]">
            Portafolio real. Clientes reales. <em className="block">Pago seguro.</em>
          </h2>
          <p className="mb-[30px] max-w-[480px] text-base leading-[1.65] text-muted">
            No necesitas fingir que tienes cinco años de experiencia. Tu perfil muestra tu ciclo, habilidades y proyectos;
            cada pago queda protegido antes de empezar.
          </p>
          <ButtonLink to="/register?rol=FREELANCER" variant="secondary">
            <ArrowIcon />
            Crear perfil freelancer
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}

function Impact() {
  return (
    <section className={`${shell} py-20 lg:py-[130px]`}>
      <p className={kicker}>CONFIANZA EN NÚMEROS</p>
      <p className="mb-[50px] mt-[25px] text-[46px] font-semibold leading-[1.05] tracking-[-0.055em] tabular-nums lg:mb-[70px] lg:mt-[34px] lg:text-[71px] lg:leading-none">
        <span className="mr-2 inline-grid h-[42px] w-[42px] place-items-center rounded-full bg-lime align-middle text-base tracking-normal lg:h-[55px] lg:w-[55px] lg:text-[22px]">
          S/
        </span>
        12,400 <em className="mt-2 block text-escrow lg:mt-0 lg:inline">protegidos en garantía.</em>
      </p>

      <dl className="grid border-t border-line lg:ml-[40%] lg:grid-cols-3">
        {IMPACT.map((item) => (
          <div
            key={item.label}
            className="flex flex-row-reverse items-baseline justify-between border-b border-line py-[18px] lg:flex-col-reverse lg:items-start lg:justify-start lg:gap-1.5 lg:border-b-0 lg:pb-0 lg:pr-[15px] lg:pt-[22px]"
          >
            <dt className="text-[11px] text-muted">{item.label}</dt>
            <dd className="text-2xl font-semibold tabular-nums">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

// Página de inicio para quien no inició sesión (mockup "Inicio"): hero con el pago en garantía, cómo funciona con
// Cuyi, una sección para negocios, otra para estudiantes, cifras y el pie.
export default function Landing() {
  const { hash } = useLocation()

  // Al llegar desde otra página con /#seccion, la sección todavía no existía; se baja a ella al montar
  useEffect(() => {
    if (!hash) return
    document.getElementById(hash.slice(1))?.scrollIntoView()
  }, [hash])

  return (
    <>
      <PublicHeader />
      <main>
        <Hero />
        <HowItWorks />
        <ForBusinesses />
        <ForStudents />
        <Impact />
      </main>
      <SiteFooter />
    </>
  )
}
