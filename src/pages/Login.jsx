import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import AuthEditorial from '../components/auth/AuthEditorial'
import AuthField from '../components/auth/AuthField'
import Cuyi from '../components/brand/Cuyi'
import PublicHeader from '../components/layout/PublicHeader'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { errorMessage } from '../utils/errorMessage'
import { validateLogin } from '../utils/validation'

function EyeIcon({ open }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.5" />
      {!open && <path d="m4 4 16 16" />}
    </svg>
  )
}

// Página Ingresar del diseño: a la izquierda la cita editorial en negro, a la derecha el formulario con Cuyi.
// Cuyi saluda al llegar, escribe mientras se inicia sesión y se confunde si algo falla.
export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  // Página que se quería abrir antes de que PrivateRoute mandara al login
  const redirectTo = location.state?.from?.pathname ?? '/'

  const [values, setValues] = useState({ email: '', password: '', remember: true })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Si ya hay sesión no tiene sentido mostrar el login
  if (user) return <Navigate to={redirectTo} replace />

  const handleChange = (event) => {
    const { name, type, checked, value } = event.target
    const next = { ...values, [name]: type === 'checkbox' ? checked : value }
    setValues(next)
    // Después del primer intento, los errores se actualizan mientras se escribe
    if (submitted) setErrors(validateLogin(next))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitted(true)
    setSubmitError(null)

    const validationErrors = validateLogin(values)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setSubmitting(true)
    try {
      await login({ email: values.email.trim(), password: values.password, remember: values.remember })
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setSubmitError(error.response?.status === 401 ? 'Correo o contraseña incorrectos.' : errorMessage(error))
      setSubmitting(false)
    }
  }

  const cuyiAnim = submitting ? 'escribe' : submitError ? 'confundido' : 'saluda'

  return (
    <>
      <PublicHeader />
      <main className="grid min-h-[calc(100vh_-_73px)] lg:grid-cols-2">
        <AuthEditorial />

        <section className="flex items-start justify-center bg-paper px-5 pb-[70px] pt-[45px] lg:items-center lg:p-[55px]">
          <div className="w-full max-w-[430px]">
            <span className="mb-5 grid h-[76px] w-[76px] place-items-center rounded-[18px] bg-lime">
              <Cuyi anim={cuyiAnim} px={4} />
            </span>
            <p className="text-[11px] font-semibold tracking-[0.13em]">BIENVENIDO DE VUELTA</p>
            <h1 className="mb-2.5 mt-3.5 text-[37px] tracking-[-0.04em] lg:text-[42px]">Ingresa a tu cuenta.</h1>
            <p className="mb-[35px] text-sm leading-normal text-muted">Revisa tus propuestas, entregas y pagos protegidos.</p>

            <form onSubmit={handleSubmit} noValidate className="grid gap-5">
              <AuthField
                label="Correo electrónico"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="tu@correo.com"
                value={values.email}
                onChange={handleChange}
                error={errors.email}
              />
              <AuthField
                label="Contraseña"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Tu contraseña"
                value={values.password}
                onChange={handleChange}
                error={errors.password}
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowPassword((shown) => !shown)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    aria-pressed={showPassword}
                    className="grid h-full w-12 flex-none place-items-center text-muted transition-colors hover:text-ink"
                  >
                    <EyeIcon open={!showPassword} />
                  </button>
                }
              />

              <label className="flex w-fit items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  name="remember"
                  checked={values.remember}
                  onChange={handleChange}
                  className="h-4 w-4 accent-escrow"
                />
                Recordarme en este navegador
              </label>

              {submitError && (
                <p role="alert" className="rounded-[10px] bg-error-light px-3.5 py-3 text-sm text-error">
                  {submitError}
                </p>
              )}

              <Button type="submit" loading={submitting} className="w-full">
                {submitting ? 'Ingresando...' : 'Ingresar'}
              </Button>
            </form>

            <p className="mt-7 text-center text-xs text-muted">
              ¿Aún no tienes cuenta?{' '}
              <Link to="/register" className="font-semibold text-ink underline underline-offset-2">
                Crea una gratis
              </Link>
            </p>
          </div>
        </section>
      </main>
    </>
  )
}
