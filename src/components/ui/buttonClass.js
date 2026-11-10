// Botones del sistema de diseño: primario (tinta), secundario (con borde), ghost (gris suave) y eliminar (rojo).
// lime e inverse son para fondos oscuros, como el recuadro negro del contrato.
const variants = {
  primary: 'border-transparent bg-ink text-white hover:-translate-y-px hover:bg-[#292925]',
  secondary: 'border-[#bab7b0] bg-transparent text-ink hover:border-ink hover:bg-white',
  ghost: 'border-transparent bg-soft text-ink hover:bg-line',
  danger: 'border-transparent bg-error text-white hover:bg-[#9a1d14]',
  lime: 'border-transparent bg-lime text-ink hover:-translate-y-px hover:bg-[#cbe64f]',
  inverse: 'border-white/30 bg-transparent text-white hover:border-white hover:bg-white/10',
}

// Clases compartidas con ButtonLink, para que un link se vea igual que un botón
export function buttonClass(variant = 'primary', className = '') {
  return `inline-flex min-h-[46px] items-center justify-center gap-2 whitespace-nowrap rounded-[11px] border px-5 text-sm font-semibold transition duration-200 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant] ?? variants.primary} ${className}`
}
