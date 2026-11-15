import Skeleton from '../ui/Skeleton'
import PropTypes from 'prop-types'

// Número grande del resumen con su etiqueta arriba y una nota abajo.
// tone="dark" es la tarjeta del dinero: fondo tinta, etiqueta lima y número un poco más chico.
// tone="green" es la del dinero ya liberado (resumen del freelancer): fondo verde y textos verde claro.
const TONES = {
  light: { card: 'border-line bg-surface', label: 'text-muted', note: 'text-muted' },
  dark: { card: 'border-ink bg-ink text-white', label: 'text-lime', note: 'text-white/60' },
  green: { card: 'border-escrow bg-escrow text-white', label: 'text-[#b9d4c4]', note: 'text-[#b9d4c4]' },
}

export default function NumberCard({ label, icon, value, note, loading = false, tone = 'light', className = '' }) {
  const dark = tone !== 'light'
  const colors = TONES[tone] ?? TONES.light
  return (
    <article
      className={`flex min-h-[165px] flex-col justify-between rounded-2xl border p-[18px] md:min-h-[215px] md:p-6 ${colors.card} ${className}`}
    >
      <span className={`flex items-center gap-[7px] text-[9px] font-semibold tracking-[0.11em] ${colors.label}`}>
        {icon}
        {label}
      </span>
      {loading ? (
        <Skeleton className={`h-12 w-32 ${dark ? 'opacity-20' : ''}`} />
      ) : (
        <div
          className={`font-semibold leading-none tabular-nums tracking-[-0.05em] ${
            dark ? 'text-[40px] md:text-[52px]' : 'text-[52px] md:text-[68px]'
          }`}
        >
          {value}
        </div>
      )}
      <small className={`text-[10px] ${colors.note}`}>{loading ? ' ' : note}</small>
    </article>
  )
}

NumberCard.propTypes = {
  label: PropTypes.node.isRequired,
  icon: PropTypes.node,
  value: PropTypes.node,
  note: PropTypes.node,
  loading: PropTypes.bool,
  tone: PropTypes.oneOf(Object.keys(TONES)),
  className: PropTypes.string,
}
