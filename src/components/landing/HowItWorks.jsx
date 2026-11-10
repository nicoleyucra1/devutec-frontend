import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../../utils/motion'
import Cuyi from '../brand/Cuyi'

const STEPS = [
  { title: 'Publica', text: 'Describe el trabajo, presupuesto y fecha de entrega.' },
  { title: 'Postulan', text: 'Recibe propuestas de estudiantes y egresados UTEC.' },
  { title: 'Contratas', text: 'Eliges a quién contratar y dejas el pago en garantía.' },
  { title: 'Apruebas', text: 'Revisas la entrega y recién entonces se libera el pago.' },
]

const shell = 'mx-auto w-full max-w-[1200px] px-6'
const ease = 'ease-[var(--ease-brand)]'

// Avance de la lista en pantalla, de 0 a 1: empieza cuando su borde de arriba pasa el 85 % de la ventana y
// termina cuando su borde de abajo llega al 65 %. Con "reducir movimiento" queda en 1 desde el inicio.
function useScrollProgress(ref) {
  const [progress, setProgress] = useState(() => (prefersReducedMotion() ? 1 : 0))

  useEffect(() => {
    if (prefersReducedMotion()) return undefined
    let frame = 0
    const update = () => {
      frame = 0
      const node = ref.current
      if (!node) return
      const rect = node.getBoundingClientRect()
      const vh = window.innerHeight
      const value = (vh * 0.85 - rect.top) / (vh * 0.2 + rect.height)
      setProgress(Math.round(Math.min(1, Math.max(0, value)) * 100) / 100)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [ref])

  return progress
}

// Banda "Así funciona": la línea de arriba de los pasos se llena con el scroll, cada número se enciende en lima al
// llegar, y cuando se alcanza "Apruebas" Cuyi deja de escribir y celebra.
export default function HowItWorks() {
  const listRef = useRef(null)
  const progress = useScrollProgress(listRef)
  const reached = (i) => progress >= i / 4 + 0.08
  const approved = progress >= 0.9

  return (
    <section id="como-funciona" className="scroll-mt-[72px] bg-ink py-[70px] text-white lg:py-[100px]">
      <div className={`${shell} grid lg:grid-cols-[1fr_2fr] lg:gap-x-[72px]`}>
        <p className="text-[11px] font-semibold tracking-[0.13em] text-[#a6a39c]">ASÍ FUNCIONA</p>
        <h2 className="mb-[50px] mt-[25px] text-[39px] font-medium leading-[1.02] tracking-[-0.035em] lg:-mt-2.5 lg:mb-[70px] lg:text-[50px]">
          De una necesidad concreta <br className="hidden sm:block" />a un trabajo <em className="text-lime">bien pagado.</em>
        </h2>

        <ol ref={listRef} className="relative grid border-t border-[#3c3c38] lg:col-start-2 lg:grid-cols-4">
          {/* Progreso: horizontal sobre los pasos en escritorio, vertical a su izquierda en celular */}
          <span
            aria-hidden="true"
            className={`absolute -top-px left-0 hidden h-px w-full origin-left bg-lime transition-transform duration-150 lg:block ${ease}`}
            style={{ transform: `scaleX(${progress})` }}
          />
          <span
            aria-hidden="true"
            className={`absolute -left-3 top-0 h-full w-px origin-top bg-lime transition-transform duration-150 lg:hidden ${ease}`}
            style={{ transform: `scaleY(${progress})` }}
          />

          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="grid grid-cols-[35px_1fr] border-b border-[#3c3c38] py-[22px] lg:block lg:border-b-0 lg:pb-0 lg:pr-6 lg:pt-[25px]"
            >
              <span className={`text-xs transition-colors duration-500 ${reached(i) ? 'text-lime' : 'text-[#55534e]'}`}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3
                className={`text-[17px] font-medium transition-colors duration-500 lg:mb-2.5 lg:mt-[30px] ${reached(i) ? 'text-white' : 'text-[#8f8d86]'}`}
              >
                {step.title}
              </h3>
              <p className="col-start-2 mt-1.5 text-sm leading-normal text-[#a9a7a0] lg:mt-0">{step.text}</p>
            </li>
          ))}
        </ol>

        <figure className="mt-12 flex items-center gap-4 lg:col-start-1 lg:row-start-2 lg:mt-0 lg:block lg:self-end">
          <div
            className={`grid h-[108px] w-[108px] flex-none place-items-center rounded-[22px] bg-lime transition-transform duration-500 ${ease} ${
              approved ? '-rotate-3 scale-105' : ''
            }`}
          >
            <Cuyi anim={approved ? 'celebra' : 'escribe'} px={5} />
          </div>
          <figcaption aria-live="polite" className="max-w-[170px] text-[11px] leading-normal text-[#a9a7a0] lg:mt-3.5">
            {approved
              ? '¡Entrega aprobada! Cuyi celebra tu pago liberado.'
              : 'Mientras tanto, Cuyi ya está trabajando en tu proyecto.'}
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
