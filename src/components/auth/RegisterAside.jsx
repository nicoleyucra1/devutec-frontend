// Tarjeta negra de Crear cuenta: cambia su mensaje según el rol elegido. En pantallas chicas va arriba del formulario.
const CONTENT = {
  CLIENT: {
    label: 'COMO CLIENTE',
    title: 'Tu dinero siempre tiene una regla.',
    money: 'S/ 600.00',
    perks: ['Publica sin costo', 'Revisa perfiles verificados', 'Libera el pago al aprobar'],
  },
  FREELANCER: {
    label: 'COMO FREELANCER',
    title: 'Tu trabajo siempre tiene respaldo.',
    money: 'S/ 35.00/h',
    perks: ['Accede a proyectos reales', 'Define tu propia tarifa', 'Cobra sin perseguir pagos'],
  },
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-none text-lime">
      <path d="m5 12 4 4L19 6" />
    </svg>
  )
}

export default function RegisterAside({ role }) {
  const content = CONTENT[role] ?? CONTENT.CLIENT
  return (
    <aside className="relative order-first overflow-hidden rounded-[20px] bg-ink p-[35px] text-white lg:sticky lg:top-[110px] lg:order-none">
      <span aria-hidden="true" className="pointer-events-none absolute -right-[30px] -top-10 h-40 w-40 rounded-full bg-lime/[0.12] blur-[45px]" />

      <div className="relative" aria-live="polite">
        <p className="text-[11px] font-semibold tracking-[0.13em] text-lime">{content.label}</p>
        <h2 className="mb-10 mt-[18px] text-[29px] leading-[1.12] tracking-[-0.03em]">{content.title}</h2>
        <p className="border-b border-[#3c3c38] pb-[25px] text-5xl font-semibold tracking-[-0.05em] tabular-nums">{content.money}</p>
        <ul className="grid gap-[13px] py-5 text-xs text-[#bbb8b0]">
          {content.perks.map((perk) => (
            <li key={perk} className="flex items-center gap-[9px]">
              <CheckIcon />
              {perk}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative flex items-center gap-2.5 rounded-[10px] bg-[#242420] p-3.5 text-lime">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
          <path d="m9 12 2 2 4-5" />
        </svg>
        <p className="flex flex-col">
          <strong className="text-[11px] font-semibold text-white">Pago protegido</strong>
          <small className="mt-[3px] text-[10px] text-[#77756f]">por las reglas de DevUTEC</small>
        </p>
      </div>
    </aside>
  )
}
