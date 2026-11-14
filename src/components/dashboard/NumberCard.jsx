import Skeleton from '../ui/Skeleton'

// Número grande del resumen con su etiqueta arriba y una nota abajo.
// tone="dark" es la tarjeta del dinero: fondo tinta, etiqueta lima y número un poco más chico.
export default function NumberCard({ label, icon, value, note, loading = false, tone = 'light', className = '' }) {
  const dark = tone === 'dark'
  return (
    <article
      className={`flex min-h-[165px] flex-col justify-between rounded-2xl border p-[18px] md:min-h-[215px] md:p-6 ${
        dark ? 'border-ink bg-ink text-white' : 'border-line bg-surface'
      } ${className}`}
    >
      <span className={`flex items-center gap-[7px] text-[9px] font-semibold tracking-[0.11em] ${dark ? 'text-lime' : 'text-muted'}`}>
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
      <small className={`text-[10px] ${dark ? 'text-white/60' : 'text-muted'}`}>{loading ? ' ' : note}</small>
    </article>
  )
}
