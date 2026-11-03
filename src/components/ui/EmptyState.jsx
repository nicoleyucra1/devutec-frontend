// Mensaje para cuando una lista no tiene elementos, con una acción opcional
export default function EmptyState({ title, message, action }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 px-6 py-10 text-center">
      <p className="font-semibold text-gray-900">{title}</p>
      {message && <p className="mt-1 text-sm text-gray-500">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}