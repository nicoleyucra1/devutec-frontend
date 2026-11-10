import { initials } from '../layout/navLinks'

const SIZES = {
  sm: 'h-[26px] w-[26px] text-[8px]',
  md: 'h-9 w-9 text-[10px]',
  lg: 'h-12 w-12 text-xs',
}

// Círculo con las iniciales de una persona, como el del menú de la barra
export default function Avatar({ name, size = 'md', className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full bg-ink font-semibold tracking-wide text-white ${SIZES[size] ?? SIZES.md} ${className}`}
    >
      {initials(name)}
    </span>
  )
}
