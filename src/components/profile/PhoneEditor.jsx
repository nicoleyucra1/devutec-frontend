import { useId, useState } from 'react'
import Button from '../ui/Button'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { userService } from '../../services/userService'
import { errorMessage } from '../../utils/errorMessage'
import { formatPhone, normalizePhone } from '../../utils/phone'
import PropTypes from 'prop-types'

// Agregar, cambiar o quitar el celular para WhatsApp de la persona con sesión.
// label y help cambian según dónde se use (en "Mi cuenta" o en el contrato, cuando todavía no lo agregó).
export default function PhoneEditor({ label = 'Celular para WhatsApp', help }) {
  const { user, updateUser } = useAuth()
  const toast = useToast()
  const id = useId()
  const current = user.celular
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(null) // 'save' | 'delete' | null

  const showForm = editing || !current

  const startEditing = () => {
    setValue(formatPhone(current))
    setError(null)
    setEditing(true)
  }

  const save = async (event) => {
    event.preventDefault()
    const phone = normalizePhone(value)
    if (!phone) {
      setError('Tiene que tener 9 dígitos y empezar con 9, por ejemplo 987 654 321.')
      return
    }
    setBusy('save')
    setError(null)
    try {
      updateUser(await userService.updatePhone(phone))
      setEditing(false)
      setValue('')
      toast.success('Guardamos tu celular')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(null)
    }
  }

  const remove = async () => {
    setBusy('delete')
    setError(null)
    try {
      updateUser(await userService.deletePhone())
      toast.success('Quitaste tu celular')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(null)
    }
  }

  return (
    <div>
      <p className="text-sm font-semibold">{label}</p>
      {help && <p className="mt-1 text-sm text-muted">{help}</p>}

      {showForm ? (
        <form onSubmit={save} noValidate className="mt-3">
          <label htmlFor={`${id}-phone`} className="sr-only">
            Número de celular
          </label>
          <div className="flex flex-wrap gap-2">
            <div
              className={`flex min-h-11 min-w-0 flex-1 items-center overflow-hidden rounded-[10px] border bg-surface focus-within:border-ink focus-within:ring-[3px] focus-within:ring-ink/5 ${
                error ? 'border-error' : 'border-gray-300'
              }`}
            >
              <span className="flex h-full items-center border-r border-line bg-paper px-3 text-sm text-muted">+51</span>
              <input
                id={`${id}-phone`}
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="987 654 321"
                value={value}
                onChange={(event) => {
                  setValue(event.target.value)
                  setError(null)
                }}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${id}-error` : undefined}
                className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm tabular-nums outline-none"
                style={{ outline: 'none' }}
              />
            </div>
            <Button type="submit" loading={busy === 'save'} className="min-h-11">
              {busy === 'save' ? 'Guardando…' : 'Guardar'}
            </Button>
            {current && (
              <Button variant="ghost" onClick={() => setEditing(false)} disabled={busy !== null} className="min-h-11">
                Cancelar
              </Button>
            )}
          </div>
        </form>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="mr-2 text-[15px] font-semibold tabular-nums">+51 {formatPhone(current)}</span>
          <Button variant="secondary" onClick={startEditing} disabled={busy !== null} className="min-h-10 px-4">
            Cambiar
          </Button>
          <Button variant="ghost" onClick={remove} loading={busy === 'delete'} disabled={busy !== null} className="min-h-10 px-4">
            {busy === 'delete' ? 'Quitando…' : 'Quitar'}
          </Button>
        </div>
      )}

      {error && (
        <p id={`${id}-error`} role="alert" className="mt-2 text-sm text-error">
          {error}
        </p>
      )}
    </div>
  )
}

PhoneEditor.propTypes = {
  label: PropTypes.string,
  help: PropTypes.node,
}
