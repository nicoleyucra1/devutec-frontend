import { useEffect, useRef, useState } from 'react'

// Avisa una sola vez cuando el elemento entra en pantalla, para arrancar su animación recién ahí.
// Devuelve [ref, inView]: el ref va en el elemento que se quiere observar.
export function useInView({ threshold = 0.35 } = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const node = ref.current
    if (!node || inView) return undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [inView, threshold])

  return [ref, inView]
}
