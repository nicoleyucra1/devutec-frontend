import PropTypes from 'prop-types'

// Logo de DevUTEC (logo 04 · eslabón): la D es Dev y la U es UTEC, cada pieza con el color de su palabra.
// "day" va sobre el fondo de la página: Ink y verde en modo claro, y en modo oscuro la versión "night"
// (Paper y lima) gracias a las variables logo-dev y logo-utec. "night" es para fondos siempre oscuros, como el footer.
const TONES = {
  day: { dev: 'var(--color-logo-dev)', utec: 'var(--color-logo-utec)', text: 'text-logo-dev', accent: 'text-logo-utec' },
  night: { dev: '#f5f3ee', utec: '#d7f25c', text: 'text-paper', accent: 'text-lime' },
}

export function LogoMark({ tone = 'day', width = 34 }) {
  const { dev, utec } = TONES[tone] ?? TONES.day
  return (
    <svg width={width} height={(width * 432) / 664} viewBox="-8 -8 664 432" aria-hidden="true">
      <path d="M0 0H376L472 96V240H352V120H120V360H0Z" style={{ fill: dev, stroke: dev }} strokeWidth="8" strokeLinejoin="round" />
      <path
        d="M176 176H296V280A16 16 0 0 0 312 296H456A72 72 0 0 0 528 224V120H648V296A120 120 0 0 1 528 416H296A120 120 0 0 1 176 296Z"
        style={{ fill: utec, stroke: utec }}
        strokeWidth="8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Logo({ tone = 'day', className = '' }) {
  const { text, accent } = TONES[tone] ?? TONES.day
  return (
    <span className={`inline-flex items-center gap-2.5 text-xl font-bold tracking-[-0.045em] ${text} ${className}`}>
      <LogoMark tone={tone} />
      <span>
        Dev<span className={accent}>UTEC</span>
      </span>
    </span>
  )
}

LogoMark.propTypes = {
  tone: PropTypes.oneOf(Object.keys(TONES)),
  width: PropTypes.number,
}

Logo.propTypes = {
  tone: PropTypes.oneOf(Object.keys(TONES)),
  className: PropTypes.string,
}
