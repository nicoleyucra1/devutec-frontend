import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import ErrorBox from '../../components/projects/ErrorBox'
import ItemList from '../../components/dashboard/ItemList'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import FilterChips from '../../components/ui/FilterChips'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../hooks/useToast'
import { verificationService } from '../../services/verificationService'
import { errorMessage } from '../../utils/errorMessage'
import { formatDate } from '../../utils/format'

const FILTERS = [
  { value: 'PENDING', label: 'Por revisar' },
  { value: 'ALL', label: 'Todos' },
]
const STATUS = {
  PENDING: { label: 'Por revisar', color: 'yellow' },
  APPROVED: { label: 'Aprobado', color: 'green' },
  REJECTED: { label: 'Rechazado', color: 'red' },
}

// Foto del carnet: es privada, así que se pide con el token y se muestra con un URL temporal
function CarnetImage({ userId, name }) {
  const [src, setSrc] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let url = null
    let active = true
    verificationService
      .getCarnetImage(userId)
      .then((objectUrl) => {
        url = objectUrl
        if (active) setSrc(objectUrl)
      })
      .catch(() => active && setFailed(true))
    return () => {
      active = false
      if (url) URL.revokeObjectURL(url)
    }
  }, [userId])

  if (failed) return <p className="text-xs text-muted">No se pudo cargar la foto.</p>
  if (!src) return <div className="h-40 w-full animate-pulse rounded-xl bg-soft" aria-hidden="true" />
  return (
    <a href={src} target="_blank" rel="noreferrer" className="block">
      <img src={src} alt={`Carnet de ${name}`} className="max-h-64 w-full rounded-xl border border-line object-contain" />
    </a>
  )
}

CarnetImage.propTypes = {
  userId: PropTypes.number.isRequired,
  name: PropTypes.string,
}

// Admin: revisa los carnets universitarios que suben los estudiantes (segunda verificación, además del .edu.pe)
export default function AdminCarnets() {
  const toast = useToast()
  const [filter, setFilter] = useState('PENDING')
  const [busyId, setBusyId] = useState(null)
  const [reasons, setReasons] = useState({})
  const { data, loading, error, status, reload } = useAsync(
    (options) => verificationService.list(filter === 'ALL' ? null : filter, options),
    [filter],
  )

  const decide = async (item, approved) => {
    const reason = (reasons[item.userId] ?? '').trim()
    if (!approved && !reason) {
      toast.error('Escribe el motivo del rechazo (por ejemplo, «La foto está borrosa»)')
      return
    }
    setBusyId(item.userId)
    try {
      await verificationService.review(item.userId, { approved, reason })
      toast.success(approved ? `Carnet de ${item.nombre} aprobado` : `Carnet de ${item.nombre} rechazado`)
      reload()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  const items = data ?? []

  return (
    <main className="mx-auto w-full max-w-[1000px] px-5 pb-20 pt-10">
      <header className="mb-6">
        <p className="text-[11px] font-semibold tracking-[0.13em] text-muted">VERIFICACIÓN</p>
        <h1 className="mt-2 text-[32px] font-semibold tracking-[-0.02em]">Carnets universitarios</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Revisa que el carnet sea legible y que el nombre coincida con la cuenta. Así es más difícil crear cuentas duplicadas.
        </p>
      </header>

      <FilterChips options={FILTERS} value={filter} onChange={setFilter} label="Estado de los carnets" />

      <div className="mt-6">
        {loading && <ItemList loading />}
        {error && <ErrorBox message={error} status={status} onRetry={reload} />}
        {!loading && !error && items.length === 0 && (
          <EmptyState title={filter === 'PENDING' ? 'No hay carnets por revisar' : 'Todavía nadie subió su carnet'} />
        )}
        {!loading && !error && items.length > 0 && (
          <ul className="grid gap-4 md:grid-cols-2">
            {items.map((item) => (
              <li key={item.userId} className="rounded-2xl border border-line bg-surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{item.nombre}</p>
                    <p className="truncate text-xs text-muted">{item.email}</p>
                    <p className="mt-1 text-xs text-muted">
                      {item.universidad || 'Universidad sin completar'} · subido el {formatDate(item.submittedAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge color={item.universityEmail ? 'green' : 'gray'}>{item.universityEmail ? 'Correo .edu.pe' : 'Sin correo .edu.pe'}</Badge>
                    <Badge color={STATUS[item.status]?.color ?? 'gray'}>{STATUS[item.status]?.label ?? item.status}</Badge>
                  </div>
                </div>
                <div className="mt-4">
                  <CarnetImage userId={item.userId} name={item.nombre} />
                </div>
                {item.status === 'REJECTED' && item.rejectReason && (
                  <p className="mt-3 text-xs text-muted">Motivo: {item.rejectReason}</p>
                )}
                {item.status === 'PENDING' && (
                  <div className="mt-4 grid gap-2">
                    <label className="text-xs text-muted" htmlFor={`motivo-${item.userId}`}>
                      Motivo si lo rechazas
                    </label>
                    <input
                      id={`motivo-${item.userId}`}
                      value={reasons[item.userId] ?? ''}
                      onChange={(event) => setReasons((prev) => ({ ...prev, [item.userId]: event.target.value }))}
                      maxLength={200}
                      placeholder="Por ejemplo: la foto está borrosa"
                      className="rounded-lg border border-gray-300 bg-surface px-3 py-2 text-sm"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="primary" onClick={() => decide(item, true)} disabled={busyId === item.userId}>
                        Aprobar
                      </Button>
                      <Button variant="secondary" onClick={() => decide(item, false)} disabled={busyId === item.userId}>
                        Rechazar
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
