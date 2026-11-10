import Cuyi from '../brand/Cuyi'
import { useDelayedFlag } from '../../hooks/useDelayedFlag'

// Lo que se ve mientras se descarga una página (lazy loading). Espera un momento antes de aparecer para que
// las cargas rápidas no hagan parpadear la pantalla.
export default function PageLoader() {
  const visible = useDelayedFlag(true, 300)

  return (
    <div role="status" className="grid min-h-[60vh] place-items-center px-5">
      <span className="sr-only">Cargando la página…</span>
      {visible && (
        <span aria-hidden="true" className="flex flex-col items-center gap-4 text-sm text-muted">
          <span className="grid h-[76px] w-[76px] place-items-center rounded-[18px] bg-lime">
            <Cuyi anim="escribe" px={4} />
          </span>
          Cargando…
        </span>
      )}
    </div>
  )
}
