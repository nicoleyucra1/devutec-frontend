import { useCallback, useMemo, useRef, useState } from 'react'
import { ToastContext } from './toastContext'

const DURATION_MS = 4000

const STYLES = {
  success: 'border-green-200 bg-green-50 text-green-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  info: 'border-gray-200 bg-white text-gray-800',
}

// Muestra avisos cortos en la esquina de la pantalla que se cierran solos
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const show = useCallback(
    (type, message) => {
      if (!message) return
      const id = nextId.current++
      setToasts((current) => [...current, { id, type, message }])
      setTimeout(() => dismiss(id), DURATION_MS)
    },
    [dismiss],
  )

  // Se memoriza para que los componentes que usan useToast no se vuelvan a renderizar
  const toast = useMemo(
    () => ({
      success: (message) => show('success', message),
      error: (message) => show('error', message),
      info: (message) => show('info', message),
    }),
    [show],
  )

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div aria-live="polite" className="fixed right-4 bottom-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
        {toasts.map((item) => (
          <div
            key={item.id}
            role={item.type === 'error' ? 'alert' : 'status'}
            className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm shadow-md ${STYLES[item.type]}`}
          >
            <span>{item.message}</span>
            <button onClick={() => dismiss(item.id)} aria-label="Cerrar aviso" className="opacity-60 hover:opacity-100">
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
