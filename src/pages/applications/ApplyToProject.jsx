import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Skeleton from '../../components/ui/Skeleton'
import { useProject } from '../../hooks/useProject'
import { applicationService } from '../../services/applicationService'
import { errorMessage } from '../../utils/errorMessage'
import { formatBudget } from '../../utils/format'

//Mismas reglas que ApplicationRequestDTO en el backend
function validate({ message, proposedPrice }) {
  const errors = {}
  const length = message.trim().length
  if (length < 20) errors.message = 'Cuéntale al cliente un poco más (mínimo 20 caracteres)'
  if (length > 2000) errors.message = 'El mensaje no puede pasar de 2000 caracteres'
  if (!proposedPrice || Number(proposedPrice) <= 0) errors.proposedPrice = 'Ingresa un precio mayor que 0'
  return errors
}

export default function ApplyToProject() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: project, loading, error } = useProject(id)

  const [values, setValues] = useState({ message: '', proposedPrice: '' })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError(null)

    const validationErrors = validate(values)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setSubmitting(true)
    try {
      await applicationService.apply({
        projectId: Number(id),
        message: values.message.trim(),
        proposedPrice: Number(values.proposedPrice),
      })
      navigate('/my-applications', { state: { message: 'Postulación enviada' } })
    } catch (err) {
      setSubmitError(errorMessage(err))
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl space-y-3 px-4 py-10">
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-40 w-full" />
      </main>
    )
  }

  if (error) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-red-700">{error}</p>
        <Link to="/projects" className="mt-4 inline-block text-primary-600 hover:underline">
          Volver a proyectos
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link to={`/projects/${id}`} className="text-sm text-primary-600 hover:underline">
        ← Volver al proyecto
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-gray-900">Postular a “{project.title}”</h1>
      <p className="mt-1 text-gray-500">Presupuesto del cliente: {formatBudget(project.budget)}</p>

      <Card className="mt-6">
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Tu propuesta</span>
            <textarea
              name="message"
              rows={6}
              value={values.message}
              onChange={handleChange}
              placeholder="Explica cómo harías el proyecto y por qué eres buena opción"
              aria-invalid={Boolean(errors.message)}
              className={`mt-1 block w-full rounded-lg border px-3 py-2 text-gray-900 outline-none focus:ring-2 ${
                errors.message ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-primary-100'
              }`}
            />
            <span className="mt-1 flex justify-between text-sm">
              <span className="text-red-600">{errors.message}</span>
              <span className="text-gray-400">{values.message.trim().length}/2000</span>
            </span>
          </label>

          <Input
            label="Tu precio (S/)"
            name="proposedPrice"
            type="number"
            min="1"
            step="0.01"
            value={values.proposedPrice}
            onChange={handleChange}
            error={errors.proposedPrice}
          />

          {submitError && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {submitError}
            </p>
          )}

          <Button type="submit" loading={submitting} className="w-full">
            {submitting ? 'Enviando...' : 'Enviar postulación'}
          </Button>
        </form>
      </Card>
    </main>
  )
}