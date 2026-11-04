import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/auth/AuthLayout'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useAuth } from '../hooks/useAuth'
import { errorMessage } from '../utils/errorMessage'
import { validateRegister } from '../utils/validation'

const ROLES = [
  { value: 'CLIENT', title: 'Quiero contratar', description: 'Publico proyectos y elijo freelancers' },
  { value: 'FREELANCER', title: 'Quiero trabajar', description: 'Postulo a proyectos y armo mi portafolio' },
]

const INITIAL_VALUES = { nombre: '', email: '', password: '', confirmPassword: '', rol: '' }

export default function Register() {
  const { user, register } = useAuth()
  const navigate = useNavigate()

  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to="/" replace />

  const handleChange = (event) => {
    const next = { ...values, [event.target.name]: event.target.value }
    setValues(next)
    if (submitted) setErrors(validateRegister(next))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitted(true)
    setSubmitError(null)

    const validationErrors = validateRegister(values)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setSubmitting(true)
    try {
      // El registro devuelve tokens, así que la usuaria entra directo sin volver a loguearse
      await register({
        nombre: values.nombre.trim(),
        email: values.email.trim(),
        password: values.password,
        rol: values.rol,
      })
      navigate('/', { replace: true })
    } catch (error) {
      setSubmitError(
        error.response?.status === 409 ? 'Ya existe una cuenta con ese correo' : errorMessage(error),
      )
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Crear cuenta" subtitle="Únete a DevUTEC en menos de un minuto">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <fieldset>
          <legend className="text-sm font-medium text-gray-700">¿Qué quieres hacer?</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {ROLES.map((role) => (
              <label
                key={role.value}
                className={`cursor-pointer rounded-lg border p-3 ${
                  values.rol === role.value ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  name="rol"
                  value={role.value}
                  checked={values.rol === role.value}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="block font-semibold text-gray-900">{role.title}</span>
                <span className="block text-sm text-gray-500">{role.description}</span>
              </label>
            ))}
          </div>
          {errors.rol && <span className="mt-1 block text-sm text-red-600">{errors.rol}</span>}
        </fieldset>

        <Input
          label="Nombre completo"
          name="nombre"
          autoComplete="name"
          value={values.nombre}
          onChange={handleChange}
          error={errors.nombre}
        />
        <Input
          label="Correo"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
        />
        <Input
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres, con letras y números"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
        />
        <Input
          label="Repite la contraseña"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />

        {submitError && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {submitError}
          </p>
        )}

        <Button
          type="submit" loading={submitting} className="w-full"
        >
          {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="font-semibold text-indigo-600 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </AuthLayout>
  )
}
