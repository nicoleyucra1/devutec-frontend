import { Link } from 'react-router-dom'

// Recordatorio del pago en garantía al lado de las acciones del resumen. En celular no se muestra.
export default function EscrowNote({ active }) {
  return (
    <aside className="hidden rounded-[15px] bg-[#e8f2eb] p-[22px] text-escrow lg:block">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="m9 12 2 2 4-5" />
      </svg>
      <p className="mt-[25px] text-[11px] font-semibold tracking-[0.13em]">{active ? 'GARANTÍA ACTIVA' : 'PAGO EN GARANTÍA'}</p>
      <h3 className="my-2 text-xl font-semibold text-ink">{active ? 'Tu dinero sigue protegido.' : 'Tu dinero siempre está protegido.'}</h3>
      <p className="text-[11px] leading-normal text-[#52705f]">Solo tú puedes liberar un pago después de revisar una entrega.</p>
      <Link to="/contracts" className="mt-2.5 inline-flex items-center gap-[7px] text-[11px] font-semibold hover:underline">
        Ver contratos
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </Link>
    </aside>
  )
}
