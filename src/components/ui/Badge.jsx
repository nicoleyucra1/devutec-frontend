// Tonos del lenguaje de estado: verde = abierto o liberado, azul = en curso, ámbar = pendiente o retenido,
// rojo = rechazado o cancelado, gris = finalizado o reembolsado
const colors = {
  gray: 'bg-[#efede8] text-[#686660]',
  green: 'bg-escrow-light text-escrow',
  yellow: 'bg-pending-light text-pending',
  red: 'bg-error-light text-error',
  blue: 'bg-progress-light text-progress',
}

// Etiqueta pequeña con un punto de color para mostrar un estado, por ejemplo "Pendiente" o "Pagado"
export default function Badge({ children, color = 'gray' }) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ${colors[color] ?? colors.gray}`}
    >
      <span aria-hidden="true" className="h-[5px] w-[5px] rounded-full bg-current" />
      {children}
    </span>
  )
}
