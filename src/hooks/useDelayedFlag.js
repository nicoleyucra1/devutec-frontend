import { useEffect, useState } from 'react'

// Devuelve true solo si "active" lleva más de "ms" milisegundos en true. Sirve para mostrar un aviso de carga
// únicamente cuando la espera se nota, y no hacer parpadear la pantalla en cargas rápidas.
export function useDelayedFlag(active, ms = 1000) {
  const [elapsed, setElapsed] = useState(false)

  useEffect(() => {
    if (!active) return undefined
    const timer = setTimeout(() => setElapsed(true), ms)
    return () => {
      clearTimeout(timer)
      setElapsed(false)
    }
  }, [active, ms])

  return active && elapsed
}
