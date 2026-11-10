import { useState } from 'react'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Skeleton from '../../components/ui/Skeleton'
import { fieldClass, labelClass } from '../../components/projects/fieldStyles'
import { useAuth } from '../../hooks/useAuth'
import { useMyFreelancerProfile } from '../../hooks/useMyFreelancerProfile'
import { freelancerService } from '../../services/freelancerService'
import { errorMessage } from '../../utils/errorMessage'
import { validateFreelancerProfile } from '../../utils/validation'

// Los ciclos de pregrado en UTEC van del 1 al 10
const CICLOS = Array.from({ length: 10 }, (_, index) => index + 1)

function toFormValues(profile) {
  return {
    universidad: profile.universidad ?? '',
    ciclo: profile.ciclo ?? '',
    egresado: Boolean(profile.egresado),
    tarifaHora: profile.tarifaHora ?? '',
    portafolioUrl: profile.portafolioUrl ?? '',
    githubUsername: profile.githubUsername ?? '',
  }
}

// La API hace una actualización parcial: los campos que no se envían se mantienen.
// Un egresado no tiene ciclo, así que el ciclo solo se envía si no marcó egresado.
function toPayload(values) {
  const payload = { egresado: values.egresado }
  const universidad = values.universidad.trim()
  const portafolioUrl = values.portafolioUrl.trim()
  const githubUsername = values.githubUsername.trim()
  if (universidad) payload.universidad = universidad
  if (!values.egresado && values.ciclo !== '') payload.ciclo = Number(values.ciclo)
  if (values.tarifaHora !== '') payload.tarifaHora = Number(values.tarifaHora)
  if (portafolioUrl) payload.portafolioUrl = portafolioUrl
  if (githubUsername) payload.githubUsername = githubUsername
  return payload
}

function ProfileForm({ profile, onSaved }) {
  const [values, setValues] = useState(() => toFormValues(profile))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [saved, setSaved] = useState(false)

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setValues((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
    setSaved(false)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const found = validateFreelancerProfile(values)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSaving(true)
    setSubmitError(null)
    try {
      const updated = await freelancerService.updateMine(toPayload(values))
      setValues(toFormValues(updated))
      setSaved(true)
      onSaved(updated)
    } catch (error) {
      setSubmitError(errorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Input
        label="Universidad"
        name="universidad"
        placeholder="UTEC"
        value={values.universidad}
        onChange={handleChange}
        error={errors.universidad}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>Ciclo</span>
          <select
            name="ciclo"
            value={values.egresado ? '' : values.ciclo}
            onChange={handleChange}
            disabled={values.egresado}
            className={`${fieldClass} disabled:bg-gray-100 disabled:text-gray-500`}
          >
            <option value="">{values.egresado ? 'No aplica' : 'Elige tu ciclo'}</option>
            {CICLOS.map((ciclo) => (
              <option key={ciclo} value={ciclo}>
                Ciclo {ciclo}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 self-start text-sm font-medium sm:mt-9 text-gray-700">
          <input
            type="checkbox"
            name="egresado"
            checked={values.egresado}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300"
          />
          Ya soy egresado
        </label>
      </div>

      <Input
        label="Tarifa por hora (S/)"
        name="tarifaHora"
        type="number"
        min="0"
        step="0.01"
        placeholder="35.00"
        value={values.tarifaHora}
        onChange={handleChange}
        error={errors.tarifaHora}
      />
      <Input
        label="Portafolio"
        name="portafolioUrl"
        type="url"
        placeholder="https://tu-portafolio.dev"
        value={values.portafolioUrl}
        onChange={handleChange}
        error={errors.portafolioUrl}
      />
      <Input
        label="Usuario de GitHub"
        name="githubUsername"
        placeholder="tu-usuario"
        autoComplete="off"
        value={values.githubUsername}
        onChange={handleChange}
        error={errors.githubUsername}
      />

      {submitError && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {submitError}
        </p>
      )}
      {saved && (
        <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
          Tus cambios se guardaron.
        </p>
      )}

      <Button type="submit" loading={saving} className="w-full sm:w-auto">
        {saving ? 'Guardando...' : 'Guardar cambios'}
      </Button>
    </form>
  )
}

export default function EditMyProfile() {
  const { user } = useAuth()
  const { data: profile, loading, error, reload } = useMyFreelancerProfile()
  const [current, setCurrent] = useState(null)
  const shown = current ?? profile

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Breadcrumbs
        items={[
          { label: 'Resumen', to: '/' },
          { label: 'Mi perfil', to: `/freelancers/${user?.id}` },
          { label: 'Editar' },
        ]}
      />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi perfil de freelancer</h1>
          <p className="mt-1 text-sm text-gray-500">Esto es lo que verán los clientes cuando revisen tu postulación.</p>
        </div>
        {user?.id && (
          <Link to={`/freelancers/${user.id}`} className="text-sm font-semibold text-primary-600 hover:underline">
            Ver mi perfil público →
          </Link>
        )}
      </div>

      <Card className="mt-6">
        {loading && (
          <div className="space-y-5">
            {[1, 2, 3, 4].map((n) => (
              <Skeleton key={n} className="h-10 w-full" />
            ))}
          </div>
        )}
        {error && (
          <div className="text-center">
            <p className="text-sm text-red-700">{error}</p>
            <Button variant="secondary" className="mt-4" onClick={reload}>
              Reintentar
            </Button>
          </div>
        )}
        {shown && !loading && <ProfileForm key={shown.userId} profile={shown} onSaved={setCurrent} />}
      </Card>
    </main>
  )
}
