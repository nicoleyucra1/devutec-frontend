import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { errorMessage } from '../../utils/errorMessage'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

// Carga una sola vez el script de Google Identity Services
let scriptPromise
function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve()
  scriptPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.onload = resolve
    script.onerror = () => {
      scriptPromise = undefined
      reject(new Error('No se pudo cargar Google'))
    }
    document.head.appendChild(script)
  })
  return scriptPromise
}

const ROLES = [
  { value: 'CLIENT', title: 'Soy cliente', detail: 'Publico proyectos y contrato developers' },
  { value: 'FREELANCER', title: 'Soy freelancer', detail: 'Estudio o egresé de UTEC y busco proyectos' },
]

// Botón "Continuar con Google". Si la cuenta ya existe, inicia sesión; si es nueva, pregunta el rol y la crea.
// En el registro se pasa el rol ya elegido, así no se vuelve a preguntar (si la cuenta ya existe, el backend lo ignora).
// Sin VITE_GOOGLE_CLIENT_ID no se muestra nada, así la web funciona aunque Google no esté configurado.
export default function GoogleSignIn({ onSuccess, rol: presetRol, text = 'continue_with' }) {
  const { loginWithGoogle } = useAuth()
  const buttonRef = useRef(null)
  const [pendingToken, setPendingToken] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const submit = async (idToken, rol = presetRol) => {
    setError(null)
    setLoading(true)
    try {
      const me = await loginWithGoogle(rol ? { idToken, rol } : { idToken })
      onSuccess?.(me)
    } catch (err) {
      if (err.response?.status === 422) {
        // Cuenta nueva: falta elegir si es cliente o freelancer
        setPendingToken(idToken)
      } else {
        setPendingToken(null)
        setError(err.response?.status === 401 ? err.response.data?.message ?? 'No se pudo validar tu cuenta de Google.' : errorMessage(err))
      }
    } finally {
      setLoading(false)
    }
  }

  // Google llama a este callback más tarde; con la ref siempre usa la versión más reciente de submit
  const submitRef = useRef(submit)
  useEffect(() => {
    submitRef.current = submit
  })

  useEffect(() => {
    if (!CLIENT_ID) return undefined
    let cancelled = false
    loadGoogleScript()
      .then(() => {
        if (cancelled || !buttonRef.current) return
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (response) => submitRef.current(response.credential),
        })
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text,
          locale: 'es',
          width: buttonRef.current.offsetWidth || 320,
        })
      })
      .catch(() => !cancelled && setError('No se pudo cargar el botón de Google. Revisa tu conexión.'))
    return () => {
      cancelled = true
    }
  }, [text])

  if (!CLIENT_ID) return null

  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line" />o<span className="h-px flex-1 bg-line" />
      </div>

      <div ref={buttonRef} className={`flex min-h-[44px] justify-center ${pendingToken ? 'hidden' : ''}`} />

      {pendingToken && (
        <div className="rounded-[14px] border border-line bg-surface p-4">
          <p className="text-sm font-semibold">¿Cómo vas a usar DEVUTEC?</p>
          <p className="mb-3 mt-1 text-xs text-muted">Es tu primera vez con esta cuenta de Google. Elige un rol para terminar.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {ROLES.map((role) => (
              <button
                key={role.value}
                type="button"
                disabled={loading}
                onClick={() => submit(pendingToken, role.value)}
                className="rounded-[12px] border border-line p-3 text-left transition hover:border-ink disabled:opacity-60"
              >
                <strong className="block text-sm">{role.title}</strong>
                <span className="text-xs text-muted">{role.detail}</span>
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setPendingToken(null)} className="mt-3 text-xs text-muted underline underline-offset-2">
            Usar otra cuenta
          </button>
        </div>
      )}

      {loading && !pendingToken && <p className="text-center text-xs text-muted">Entrando con Google...</p>}
      {error && (
        <p role="alert" className="rounded-[10px] bg-error-light px-3.5 py-3 text-sm text-error">
          {error}
        </p>
      )}
    </div>
  )
}
