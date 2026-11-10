// Mitad negra de Ingresar: una cita de una estudiante, quién la dijo y cuánto dinero hay protegido.
// Un "S/" gigante en lima casi transparente queda de fondo. En pantallas chicas no se muestra.
export default function AuthEditorial() {
  return (
    <section
      aria-label="Lo que dicen en DevUTEC"
      className="relative hidden flex-col justify-between overflow-hidden bg-ink px-[max(7vw,50px)] py-[70px] text-white lg:flex"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-[30px] top-[12%] select-none text-[320px] font-bold leading-none tracking-[-0.08em] text-lime/[0.055]"
      >
        S/
      </span>

      <div className="relative">
        <p className="text-[11px] font-semibold tracking-[0.13em] text-[#a6a39c]">DEVUTEC · LIMA</p>
        <blockquote className="my-[45px] max-w-[560px] text-[44px] leading-[1.12] tracking-[-0.035em]">
          “El trabajo estaba claro y el pago ya estaba protegido. Solo tuve que concentrarme en{' '}
          <em className="text-lime">entregar bien.</em>”
        </blockquote>
        <figure className="flex items-center gap-3">
          <span className="grid h-[52px] w-[52px] flex-none place-items-center rounded-full bg-escrow text-sm font-semibold">
            CR
          </span>
          <figcaption className="flex flex-col gap-1">
            <strong className="font-semibold">Camila Ríos</strong>
            <small className="text-[11px] text-[#8f8d86]">UTEC · Ciclo 6</small>
          </figcaption>
        </figure>
      </div>

      <div className="relative flex items-center gap-3.5 border-t border-[#3c3c38] pt-7 text-lime">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
          <path d="m9 12 2 2 4-5" />
        </svg>
        <p className="flex flex-col">
          <strong className="text-xl font-semibold tabular-nums text-white">S/ 12,400</strong>
          <small className="text-sm text-[#8f8d86]">protegidos en garantía</small>
        </p>
      </div>
    </section>
  )
}
