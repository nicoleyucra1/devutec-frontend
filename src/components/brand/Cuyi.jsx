import { useEffect, useState } from 'react'
import { CUYI_ANIMS, CUYI_PALETTE } from './cuyiFrames'

function prefersReducedMotion() {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

// Cuyi, la mascota de DevUTEC, en pixel art 16 × 16. anim: saluda, escribe, celebra, duerme o confundido.
// px es el tamaño de cada píxel. Con "reducir movimiento" activado se queda quieto en el primer cuadro.
export default function Cuyi({ anim = 'saluda', px = 8, className = '' }) {
  const animation = CUYI_ANIMS[anim] ?? CUYI_ANIMS.saluda
  const [step, setStep] = useState({ anim, index: 0 })

  useEffect(() => {
    if (prefersReducedMotion()) return undefined
    const timer = setInterval(() => {
      setStep((current) => ({ anim, index: current.anim === anim ? (current.index + 1) % animation.seq.length : 0 }))
    }, animation.ms)
    return () => clearInterval(timer)
  }, [anim, animation])

  // Si cambió la animación, se empieza desde su primer cuadro
  const index = step.anim === anim ? step.index : 0
  const frame = animation.frames[animation.seq[index]]
  const size = 16 * px

  return (
    <div
      role="img"
      aria-label={animation.label}
      className={`grid shrink-0 ${className}`}
      style={{ width: size, height: size, gridTemplateColumns: 'repeat(16, 1fr)', gridTemplateRows: 'repeat(16, 1fr)' }}
    >
      {frame.flatMap((row, r) =>
        row.map((color, c) => <i key={`${r}-${c}`} className="block" style={{ background: CUYI_PALETTE[color] }} />),
      )}
    </div>
  )
}
