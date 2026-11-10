//Contenedor blanco con borde fino y esquinas redondeadas
export default function Card({ children, className = '' }) {
  return <div className={`rounded-2xl border border-line bg-surface p-6 ${className}`}>{children}</div>
}
