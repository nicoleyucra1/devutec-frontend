import { useEffect, useState } from 'react'
import { useInView } from '../../hooks/useInView'
import { prefersReducedMotion } from '../../utils/motion'

const defaultFormat = (n) => n.toLocaleString('en-US')

// Número que sube desde 0 una sola vez, cuando entra en pantalla. El lector de pantalla oye solo el valor final.
// Reserva el ancho del número final para que el texto de al lado no salte mientras cuenta.
export default function CountUp({ value, duration = 900, format = defaultFormat, className = '' }) {
  const [ref, inView] = useInView({ threshold: 0.6 })
  const [shown, setShown] = useState(() => (prefersReducedMotion() ? value : 0))
  const final = format(value)

  useEffect(() => {
    if (!inView || prefersReducedMotion()) return undefined
    let frame = 0
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      setShown(Math.round(value * (1 - (1 - t) ** 3)))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, value, duration])

  return (
    <span ref={ref} className={`inline-block tabular-nums ${className}`} style={{ minWidth: `${final.length}ch` }}>
      <span aria-hidden="true">{format(shown)}</span>
      <span className="sr-only">{final}</span>
    </span>
  )
}
