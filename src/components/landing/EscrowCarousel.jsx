import { useEffect, useState } from 'react'

const STEPS = ['Retenido', 'Entregado', 'Liberado']

// Ejemplos del hero. step es el paso actual (0 retenido, 1 entregado, 2 liberado); 3 significa que ya terminó
const SLIDES = [
  {
    amount: '600.00',
    title: 'Web para pizzería',
    status: 'Protegido',
    client: { initials: 'DM', name: 'Pizzería Don Mario' },
    freelancer: { initials: 'CR', name: 'Camila Ríos', role: 'Desarrolladora' },
    step: 1,
    note: 'Tu pago no se mueve solo.',
    detail: 'Se libera cuando Don Mario aprueba la entrega.',
  },
  {
    amount: '380.00',
    title: 'Logo e identidad visual',
    status: 'Protegido',
    client: { initials: 'CT', name: 'Café Tostado' },
    freelancer: { initials: 'DQ', name: 'Diego Quispe', role: 'Diseñador' },
    step: 0,
    note: 'Pago asegurado antes de empezar.',
    detail: 'Diego diseña sabiendo que su pago ya está retenido.',
  },
  {
    amount: '450.00',
    title: 'Dashboard de ventas',
    status: 'En revisión',
    client: { initials: 'BL', name: 'Bodega Lucía' },
    freelancer: { initials: 'RS', name: 'Renzo Salas', role: 'Desarrollador' },
    step: 1,
    note: 'Entrega en revisión.',
    detail: 'Bodega Lucía tiene 5 días para aprobar o pedir cambios.',
  },
  {
    amount: '250.00',
    title: 'Landing para gimnasio',
    status: 'Liberado',
    client: { initials: 'GF', name: 'Gimnasio Fuerza' },
    freelancer: { initials: 'AT', name: 'Andrea Torres', role: 'Desarrolladora' },
    step: 3,
    note: 'Pago liberado.',
    detail: 'Andrea recibió su pago apenas Gimnasio Fuerza aprobó.',
  },
  {
    amount: '320.00',
    title: 'Tienda online de cerámica',
    status: 'Protegido',
    client: { initials: 'TB', name: 'Taller Barro' },
    freelancer: { initials: 'LM', name: 'Luis Mendoza', role: 'Desarrollador' },
    step: 1,
    note: 'Entrega recibida.',
    detail: 'Taller Barro revisa la tienda antes de liberar el pago.',
  },
]

const INTERVAL_MS = 5000
const pad = (n) => String(n).padStart(2, '0')

function prefersReducedMotion() {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

function Person({ initials, label, name }) {
  return (
    <div className="flex max-w-[48%] items-center gap-2.5 sm:max-w-none">
      <span className="grid h-[34px] w-[34px] flex-none place-items-center rounded-full bg-ink text-[11px] font-semibold tracking-[0.03em] text-white">
        {initials}
      </span>
      <span className="flex flex-col text-[11px] sm:text-[13px]">
        <small className="mb-[3px] text-[9px] uppercase text-muted">{label}</small>
        {name}
      </span>
    </div>
  )
}

function StepDot({ index, step }) {
  const done = index < step
  const current = index === step
  return (
    <span
      className={`z-[1] flex flex-col items-center gap-[7px] text-[11px] ${current ? 'font-semibold text-ink' : 'text-muted'}`}
    >
      <i
        className={`grid h-6 w-6 place-items-center rounded-full border not-italic ${
          done ? 'border-escrow bg-escrow text-white' : current ? 'border-ink bg-lime text-ink' : 'border-line bg-paper'
        }`}
      >
        {done ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="m5 12 5 5 9-10" />
          </svg>
        ) : (
          index + 1
        )}
      </i>
      {STEPS[index]}
    </span>
  )
}

// Tarjeta del hero con un pago en garantía de ejemplo. Rota sola cada 5 s, se pausa al pasar el mouse o con el
// foco, y se queda quieta si el usuario pidió reducir el movimiento.
export default function EscrowCarousel() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const slide = SLIDES[index]

  useEffect(() => {
    if (paused || prefersReducedMotion()) return undefined
    const timer = setInterval(() => setIndex((current) => (current + 1) % SLIDES.length), INTERVAL_MS)
    return () => clearInterval(timer)
  }, [paused])

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Proyectos en garantía de ejemplo"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="w-full"
    >
      <div className="relative">
        {/* Las otras tarjetas asoman detrás, como una pila */}
        <div
          aria-hidden="true"
          className="absolute inset-0 hidden translate-x-3 -translate-y-5 rotate-[3deg] rounded-[20px] border border-line bg-surface/60 sm:block"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 hidden translate-x-1.5 -translate-y-2.5 rotate-2 rounded-[20px] border border-line bg-surface sm:block"
        />

        <article
          key={index}
          aria-roledescription="diapositiva"
          aria-label={`${index + 1} de ${SLIDES.length}: ${slide.title}`}
          className="relative rounded-[20px] border border-line bg-surface p-5 shadow-[0_24px_60px_rgba(14,14,12,0.07)] sm:p-7 lg:rotate-1"
        >
          <div className="flex items-center justify-between motion-safe:animate-[ledger-in_.45s_ease-out]">
            <p className="text-[10px] font-semibold tracking-[0.13em] text-muted">PAGO EN GARANTÍA</p>
            <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-escrow">
              <span className="h-1.5 w-1.5 rounded-full bg-lime shadow-[0_0_0_3px_rgba(215,242,92,0.25)]" />
              {slide.status}
            </span>
          </div>

          <div className="motion-safe:animate-[ledger-in_.45s_ease-out]">
            <p className="mb-[5px] mt-[30px] text-[47px] font-semibold tracking-[-0.055em] tabular-nums sm:mt-10 sm:text-[58px]">
              S/ <span className="text-[#9e9b94]">{slide.amount}</span>
            </p>
            <p className="text-muted">{slide.title}</p>

            <div className="my-7 border-t border-line" />

            <div className="flex items-start justify-between sm:items-center">
              <Person initials={slide.client.initials} label="Cliente" name={slide.client.name} />
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="hidden text-[#aaa79f] sm:block">
                <path d="M5 12h14m-5-5 5 5-5 5" />
              </svg>
              <Person initials={slide.freelancer.initials} label={slide.freelancer.role} name={slide.freelancer.name} />
            </div>

            <div className="relative mb-[26px] mt-[34px] grid grid-cols-3 before:absolute before:left-[14%] before:right-[14%] before:top-3 before:h-px before:bg-line">
              {STEPS.map((label, i) => (
                <StepDot key={label} index={i} step={slide.step} />
              ))}
            </div>

            <div className="flex gap-3 rounded-xl bg-[#f0f5f1] p-[15px] text-xs leading-normal text-escrow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-none">
                <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6L12 3Z" />
                <path d="m8.8 12 2.2 2.2 4.2-4.4" />
              </svg>
              <p>
                <strong className="block font-semibold">{slide.note}</strong>
                <span className="text-[#365242]">{slide.detail}</span>
              </p>
            </div>
          </div>
        </article>
      </div>

      <div className="mt-5 flex items-center justify-between text-[11px] text-muted">
        <p>
          <strong className="font-semibold text-ink">{pad(index + 1)}</strong> / {pad(SLIDES.length)} · Proyectos en garantía
        </p>
        <div className="flex items-center gap-1.5">
          {SLIDES.map((item, i) => (
            <button
              key={item.title}
              type="button"
              aria-label={`Ver ejemplo ${i + 1}: ${item.title}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className="grid h-5 place-items-center"
            >
              <span className={`block h-[3px] rounded-full transition-all ${i === index ? 'w-8 bg-ink' : 'w-4 bg-line hover:bg-[#cbc7be]'}`} />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
