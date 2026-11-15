import { useEffect, useRef, useState } from 'react'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { userService } from '../../services/userService'
import { AVATAR_MAX_MB, AVATAR_TYPES, prepareAvatar } from '../../utils/avatar'
import { errorMessage } from '../../utils/errorMessage'

// Subir, cambiar o quitar la foto de perfil de la persona con sesión. Mientras sube se ve la foto nueva
// (ya recortada) para que no haya que esperar a la respuesta. El administrador tiene la foto fija de DevUTEC.
// showTitle=false cuando ya hay un título afuera (por ejemplo, en la ventana del menú)
export default function AvatarUploader({ showTitle = true }) {
  const { user, updateUser } = useAuth()
  const toast = useToast()
  const inputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [busy, setBusy] = useState(null) // 'upload' | 'delete' | null
  const [error, setError] = useState(null)

  // La vista previa es una URL temporal del navegador: se libera cuando ya no se usa
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview])

  const name = user.nombre ?? user.email
  const isAdmin = user.rol === 'ADMIN'
  const hasPhoto = Boolean(user.avatarUrl)

  const handleFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = '' // así se puede volver a elegir la misma foto
    if (!file) return

    setError(null)
    setBusy('upload')
    try {
      const prepared = await prepareAvatar(file)
      setPreview(URL.createObjectURL(prepared))
      updateUser(await userService.uploadAvatar(prepared))
      toast.success('Tu foto de perfil se actualizó')
    } catch (err) {
      // Los errores de prepareAvatar ya vienen escritos para la persona; los del backend, con errorMessage
      setError(err?.response ? errorMessage(err) : err.message)
    } finally {
      setPreview(null)
      setBusy(null)
    }
  }

  const handleDelete = async () => {
    setError(null)
    setBusy('delete')
    try {
      updateUser(await userService.deleteAvatar())
      toast.success('Quitaste tu foto de perfil')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
      <div className="relative shrink-0">
        <Avatar name={name} src={preview ?? user.avatarUrl} size="xl" />
        {busy && (
          <span aria-hidden="true" className="absolute inset-0 grid place-items-center rounded-full bg-ink/45">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </span>
        )}
      </div>

      <div className="min-w-0">
        {showTitle && <p className="font-semibold">Foto de perfil</p>}
        {isAdmin ? (
          <p className="text-sm text-muted">La cuenta de administrador usa la foto de DevUTEC y no se puede cambiar.</p>
        ) : (
          <>
            <p className="text-sm text-muted">
              JPG o PNG de hasta {AVATAR_MAX_MB} MB. Se recorta cuadrada desde el centro.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <input
                ref={inputRef}
                type="file"
                accept={AVATAR_TYPES.join(',')}
                onChange={handleFile}
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
              />
              <Button variant="secondary" onClick={() => inputRef.current?.click()} loading={busy === 'upload'} disabled={busy !== null}>
                {busy === 'upload' ? 'Subiendo…' : hasPhoto ? 'Cambiar foto' : 'Subir foto'}
              </Button>
              {hasPhoto && (
                <Button variant="ghost" onClick={handleDelete} loading={busy === 'delete'} disabled={busy !== null}>
                  {busy === 'delete' ? 'Quitando…' : 'Quitar'}
                </Button>
              )}
            </div>
          </>
        )}
        {error && (
          <p role="alert" className="mt-3 text-sm text-error">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
