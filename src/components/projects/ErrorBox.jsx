import Button from '../ui/Button'

// Mensaje de error con botón para volver a intentar
export default function ErrorBox({ message, onRetry, children }) {
  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center">
      <p className="text-red-700">{message}</p>
      <div className="mt-4 flex justify-center gap-2">
        {onRetry && (
          <Button variant="secondary" onClick={onRetry}>
            Reintentar
          </Button>
        )}
        {children}
      </div>
    </div>
  )
}
