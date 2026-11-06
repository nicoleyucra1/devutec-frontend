// Fila de StatCard que pasa a 2 columnas en tablet y a 4 en escritorio
export default function StatGrid({ children }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
}
