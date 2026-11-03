const colors = {
  gray: 'bg-gray-100 text-gray-700',
  green: 'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  red: 'bg-red-100 text-red-800',
  blue: 'bg-primary-100 text-primary-700',
}

// Etiqueta pequeña para mostrar un estado, por ejemplo "Pendiente" o "Pagado"
export default function Badge({ children, color = 'gray' }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${colors[color]}`}>
      {children}
    </span>
  )
}