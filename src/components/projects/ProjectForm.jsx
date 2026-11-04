import { useState } from 'react'
import Button from '../ui/Button'
import Card from '../ui/Card'
import Input from '../ui/Input'
import Skeleton from '../ui/Skeleton'
import { fieldClass, labelClass } from './fieldStyles'
import { useSkills } from '../../hooks/useSkills'

const EMPTY = { title: '', description: '', budget: '', deadline: '', location: '', skillIds: [] }

function toFormValues(project) {
  if (!project) return EMPTY
  return {
    title: project.title ?? '',
    description: project.description ?? '',
    budget: project.budget ?? '',
    deadline: project.deadline ?? '',
    location: project.location ?? '',
    skillIds: project.skills?.map((skill) => skill.id) ?? [],
  }
}

function validate(values) {
  const errors = {}
  if (!values.title.trim()) errors.title = 'El título es obligatorio'
  else if (values.title.length > 255) errors.title = 'Máximo 255 caracteres'
  if (values.budget === '') errors.budget = 'El presupuesto es obligatorio'
  else if (Number(values.budget) <= 0) errors.budget = 'El presupuesto debe ser mayor a cero'
  if (values.location.length > 100) errors.location = 'Máximo 100 caracteres'
  return errors
}

// Formulario compartido por "Publicar proyecto" y "Editar proyecto"
export default function ProjectForm({ initialProject, submitLabel, saving, serverError, onSubmit }) {
  const [values, setValues] = useState(() => toFormValues(initialProject))
  const [errors, setErrors] = useState({})
  const skills = useSkills()

  const setField = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const toggleSkill = (id) => {
    setValues((prev) => ({
      ...prev,
      skillIds: prev.skillIds.includes(id) ? prev.skillIds.filter((s) => s !== id) : [...prev.skillIds, id],
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    onSubmit({
      title: values.title.trim(),
      description: values.description.trim() || null,
      budget: Number(values.budget),
      deadline: values.deadline || null,
      location: values.location.trim() || null,
      skillIds: values.skillIds,
    })
  }

  return (
    <Card>
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <Input
          label="Título *"
          value={values.title}
          onChange={(event) => setField('title', event.target.value)}
          error={errors.title}
          maxLength={255}
        />

        <label className="block">
          <span className={labelClass}>Descripción</span>
          <textarea
            rows={5}
            className={fieldClass}
            value={values.description}
            onChange={(event) => setField('description', event.target.value)}
          />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Presupuesto (S/) *"
            type="number"
            min="1"
            step="0.01"
            value={values.budget}
            onChange={(event) => setField('budget', event.target.value)}
            error={errors.budget}
          />
          <Input
            label="Fecha límite"
            type="date"
            value={values.deadline}
            onChange={(event) => setField('deadline', event.target.value)}
          />
        </div>

        <Input
          label="Ubicación (opcional)"
          placeholder="Por ejemplo: Barranco, Lima"
          value={values.location}
          onChange={(event) => setField('location', event.target.value)}
          error={errors.location}
          maxLength={100}
        />

        <fieldset>
          <legend className={labelClass}>Habilidades requeridas</legend>
          {skills.loading && <Skeleton className="mt-2 h-5 w-1/2" />}
          {skills.error && <p className="mt-2 text-sm text-red-600">{skills.error}</p>}
          <div className="mt-2 flex flex-wrap gap-2">
            {skills.data?.map((skill) => {
              const checked = values.skillIds.includes(skill.id)
              return (
                <label
                  key={skill.id}
                  className={`cursor-pointer rounded-full border px-3 py-1 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-indigo-200 ${
                    checked ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleSkill(skill.id)} />
                  {skill.name}
                </label>
              )
            })}
          </div>
        </fieldset>

        {serverError && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {serverError}
          </p>
        )}

        <Button type="submit" loading={saving} className="w-full sm:w-auto">
          {saving ? 'Guardando...' : submitLabel}
        </Button>
      </form>
    </Card>
  )
}
