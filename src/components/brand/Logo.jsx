import { useId } from 'react'
import PropTypes from 'prop-types'

// Logo de DEVUTEC (eslabón con degradado): la D y la U en lima, con verde oscuro donde se entrelazan.
// "day" va sobre el fondo de la página: Ink y verde en modo claro, y en modo oscuro la versión "night"
// (Paper y lima) gracias a las variables logo-dev y logo-utec. "night" es para fondos siempre oscuros, como el footer.
const TONES = {
  day: { dev: 'var(--color-logo-dev)', utec: 'var(--color-logo-utec)', text: 'text-logo-dev', accent: 'text-logo-utec' },
  // Colores fijos: text-paper se vuelve oscuro en modo oscuro y el "DEV" del footer no se veía
  night: { dev: '#f5f3ee', utec: '#d7f25c', text: 'text-[#f5f3ee]', accent: 'text-[#d7f25c]' },
}

// Lima de la marca y el verde oscuro del degradado (donde las dos piezas se entrelazan), iguales en claro y oscuro
const LIME = '#c9f15f'
const DEEP = '#1f6f4a'

export function LogoMark({ width = 34 }) {
  // Cada logo necesita ids propios para sus degradados (puede haber varios en la página)
  const id = useId().replace(/:/g, '')
  return (
    <svg width={width} height={(width * 432) / 664} viewBox="-8 -8 664 432" aria-hidden="true">
      <defs>
        {/* La D se oscurece hacia abajo en su brazo derecho, donde entra la U */}
        <linearGradient id={`${id}-d`} gradientUnits="userSpaceOnUse" x1="330" y1="70" x2="470" y2="250">
          <stop offset="0" stopColor={LIME} />
          <stop offset="1" stopColor={DEEP} />
        </linearGradient>
        {/* La U nace oscura arriba a la izquierda, debajo de la D, y se aclara hacia la curva */}
        <linearGradient id={`${id}-u`} gradientUnits="userSpaceOnUse" x1="180" y1="170" x2="340" y2="340">
          <stop offset="0" stopColor={DEEP} />
          <stop offset="1" stopColor={LIME} />
        </linearGradient>
      </defs>
      <path d="M0 0H376L472 96V240H352V120H120V360H0Z" fill={`url(#${id}-d)`} stroke={`url(#${id}-d)`} strokeWidth="8" strokeLinejoin="round" />
      <path
        d="M176 176H296V280A16 16 0 0 0 312 296H456A72 72 0 0 0 528 224V120H648V296A120 120 0 0 1 528 416H296A120 120 0 0 1 176 296Z"
        fill={`url(#${id}-u)`}
        stroke={`url(#${id}-u)`}
        strokeWidth="8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// compact: un poco más chico en celular (para que entren los botones de la barra) y normal desde sm
export default function Logo({ tone = 'day', className = '', compact = false }) {
  const { text, accent } = TONES[tone] ?? TONES.day
  const size = compact ? 'gap-2 text-[17px] sm:gap-2.5 sm:text-xl' : 'gap-2.5 text-xl'
  return (
    // El nombre va en mayúsculas (DEVUTEC), como en la app, con un poco más de aire entre letras
    <span className={`inline-flex items-center ${size} font-bold tracking-[-0.01em] ${text} ${className}`}>
      <LogoMark width={compact ? 28 : 34} />
      {/* En pantallas muy angostas (menos de 345 px) queda solo el ícono, y el nombre sigue para lectores de pantalla */}
      <span className={compact ? 'max-[344px]:sr-only' : ''}>
        DEV<span className={accent}>UTEC</span>
      </span>
    </span>
  )
}

LogoMark.propTypes = {
  width: PropTypes.number,
}

Logo.propTypes = {
  tone: PropTypes.oneOf(Object.keys(TONES)),
  className: PropTypes.string,
  compact: PropTypes.bool,
}
