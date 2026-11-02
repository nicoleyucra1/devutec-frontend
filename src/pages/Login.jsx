import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/auth/AuthLayout'
import FormField from '../components/auth/FormField'
import { useAuth } from '../hooks/useAuth'
import { errorMessage } from '../utils/errorMessage'
import { validateLogin } from '../utils/validation'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  // Página que se quería abrir antes de que PrivateRoute mandara al login
  const redirectTo = location.state?.from?.pathname ?? '/'

  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Si ya hay sesión no tiene sentido mostrar el login
  if (user) return <Navigate to={redirectTo} replace />

  const handleChange = (event) => {
    const next = { ...values, [event.target.name]: event.target.value }
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
      await login({ email: values.email.trim(), password: values.password })
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setSubmitError(
        error.response?.status === 401 ? 'Correo o contraseña incorrectos' : errorMessage(error),
      )
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Iniciar sesión" subtitle="Entra para ver proyectos y postulaciones">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField
          label="Correo"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
        />
        <FormField
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
        />

        {submitError && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        ¿No tienes cuenta?{' '}
        <Link to="/register" className="font-semibold text-indigo-600 hover:underline">
          Regístrate
        </Link>
      </p>
    </AuthLayout>
  )
}
