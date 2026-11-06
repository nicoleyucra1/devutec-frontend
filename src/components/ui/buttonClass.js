// Botones del sistema de diseño: primario (tinta), secundario (con borde), ghost (gris suave) y eliminar (rojo)
const variants = {
  primary: 'border-transparent bg-ink text-white hover:-translate-y-px hover:bg-[#292925]',
  secondary: 'border-[#bab7b0] bg-transparent text-ink hover:border-ink hover:bg-white',
  ghost: 'border-transparent bg-soft text-ink hover:bg-line',
  danger: 'border-transparent bg-error text-white hover:bg-[#9a1d14]',
}

// Clases compartidas con ButtonLink, para que un link se vea igual que un botón.
// group permite que el ícono de adentro reaccione al pasar el mouse por el botón.
export function buttonClass(variant = 'primary', className = '') {
  return `group inline-flex min-h-[46px] items-center justify-center gap-2 whitespace-nowrap rounded-[11px] border px-5 text-sm font-semibold transition duration-200 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant] ?? variants.primary} ${className}`
}
