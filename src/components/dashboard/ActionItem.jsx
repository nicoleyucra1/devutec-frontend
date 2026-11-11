import { Link } from 'react-router-dom'

const ICONS = {
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6" />
    </>
  ),
}

// Algo que el cliente tiene que hacer, como revisar una entrega. Toda la tarjeta es un link.
// meta es el texto chico en ámbar de abajo ("Recibido hoy, 16:20").
export default function ActionItem({ to, icon = 'clock', title, text, meta }) {
  return (
    <Link
      to={to}
      className="group flex w-full items-start gap-[15px] rounded-[15px] border border-escrow bg-surface p-[17px] transition-shadow duration-200 hover:shadow-[0_10px_30px_rgba(14,14,12,0.06)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-progress md:items-center md:p-[22px]"
    >
      <span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-escrow-light text-escrow">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {ICONS[icon]}
        </svg>
      </span>
      <div className="flex min-w-0 flex-col gap-[5px]">
        <p className="text-sm font-semibold">{title}</p>
        <small className="text-[13px] text-muted">{text}</small>
        {meta && <span className="mt-[5px] text-[9px] uppercase tracking-[0.08em] text-pending">{meta}</span>}
      </div>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="ml-auto hidden shrink-0 transition-transform duration-200 group-hover:translate-x-1 md:block">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </Link>
  )
}
