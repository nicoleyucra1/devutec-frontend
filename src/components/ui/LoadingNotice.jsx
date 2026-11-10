import Cuyi from '../brand/Cuyi'
import { useDelayedFlag } from '../../hooks/useDelayedFlag'

// Aviso con Cuyi escribiendo para cargas lentas. Antes de 1 segundo basta con el esqueleto, así que no aparece.
export default function LoadingNotice({ loading, what }) {
  const slow = useDelayedFlag(loading, 1000)
  if (!slow) return null

  return (
    <div
      role="status"
      className="mb-6 flex items-center gap-4 rounded-[18px] border border-line bg-surface px-5 py-4"
    >
      <span className="grid h-[76px] w-[76px] shrink-0 place-items-center rounded-[18px] bg-lime">
        <Cuyi anim="escribe" px={4} />
      </span>
      <div>
        <p className="text-[15px] font-semibold">Cuyi está trayendo {what}…</p>
        <p className="mt-1 text-[13px] text-muted">Ya casi está. Si tarda mucho, revisa tu conexión.</p>
      </div>
    </div>
  )
}
