import { useContext } from 'react'
import { ToastContext } from '../contexts/toastContext'

// Uso: const toast = useToast(); toast.success('Proyecto creado'); toast.error('No se pudo guardar')
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast debe usarse dentro de ToastProvider')
  }
  return context
}
