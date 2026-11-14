// Título de un bloque del resumen: texto chico arriba, título y algo opcional a la derecha (un link o un contador)
export default function BlockHeading({ kicker, title, children }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.13em]">{kicker}</p>
        <h2 className="mt-2 text-[27px] font-semibold leading-tight tracking-[-0.025em]">{title}</h2>
      </div>
      {children}
    </div>
  )
}
