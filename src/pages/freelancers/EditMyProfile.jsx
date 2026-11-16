import { useState } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import ButtonLink from '../../components/projects/ButtonLink'
import ErrorBox from '../../components/projects/ErrorBox'
import AvatarUploader from '../../components/profile/AvatarUploader'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import LoadingNotice from '../../components/ui/LoadingNotice'
import Skeleton from '../../components/ui/Skeleton'
import { useAuth } from '../../hooks/useAuth'
import { useMyFreelancerProfile } from '../../hooks/useMyFreelancerProfile'
import { useToast } from '../../hooks/useToast'
import { useUserReviews } from '../../hooks/useUserReviews'
import { freelancerService } from '../../services/freelancerService'
import { errorMessage } from '../../utils/errorMessage'
import { freelancerProfileShape } from '../../utils/propShapes'
import { MAX_PRESENTACION, validateFreelancerProfile } from '../../utils/validation'

// Los ciclos de pregrado en UTEC van del 1 al 10
const CICLOS = Array.from({ length: 10 }, (_, index) => index + 1)

const inputClass = (error) =>
  `w-full rounded-[10px] border bg-white px-3.5 text-sm text-ink outline-none transition placeholder:text-muted focus:border-ink focus:ring-[3px] focus:ring-ink/5 disabled:cursor-not-allowed disabled:opacity-45 ${
    error ? 'border-error' : 'border-[#cbc7be]'
  }`

// Caja con prefijo ("S/" o "github.com/") y el campo al lado
const prefixedClass = (error) =>
  `flex min-h-12 items-center overflow-hidden rounded-[10px] border bg-white transition focus-within:border-ink focus-within:ring-[3px] focus-within:ring-ink/5 ${
    error ? 'border-error' : 'border-[#cbc7be]'
  }`

function toFormValues(profile) {
  return {
    universidad: profile.universidad ?? '',
    ciclo: profile.ciclo ?? '',
    egresado: Boolean(profile.egresado),
    tarifaHora: profile.tarifaHora ?? '',
    portafolioUrl: profile.portafolioUrl ?? '',
    githubUsername: profile.githubUsername ?? '',
    presentacion: profile.presentacion ?? '',
  }
}

// La API hace una actualización parcial: los campos que no se envían se mantienen.
// Un egresado no tiene ciclo, así que el ciclo solo se envía si no marcó egresado.
// La presentación se manda siempre: vacía, el backend la borra.
function toPayload(values) {
  const payload = { egresado: values.egresado, presentacion: values.presentacion.trim() }
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

// Lo mismo que mira "Perfil completo" en el Resumen, más la presentación
function completion(values, hasPhoto) {
  const items = [
    Boolean(values.universidad.trim() && (values.ciclo !== '' || values.egresado)),
    Number(values.tarifaHora) > 0,
    Boolean(values.githubUsername.trim()),
    Boolean(values.portafolioUrl.trim()),
    hasPhoto,
    Boolean(values.presentacion.trim()),
  ]
  return Math.round((items.filter(Boolean).length / items.length) * 100)
}

function stageLabel(values) {
  if (values.egresado) return 'Egresado'
  if (values.ciclo !== '') return `Ciclo ${values.ciclo}`
  return null
}

function Section({ number, title, help, children }) {
  return (
    <div className="border-b border-line p-[22px] md:p-8">
      <div className="mb-6 flex gap-3.5">
        <span className="font-serif text-[22px] italic leading-none text-escrow">{number}</span>
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="mt-1 text-xs text-muted">{help}</p>
        </div>
      </div>
      <div className="grid gap-5">{children}</div>
    </div>
  )
}

// Etiqueta, campo, ayuda y error de cada dato
function Field({ id, label, error, hint, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-xs font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-error">
          {error}
        </p>
      ) : (
        hint
      )}
    </div>
  )
}

// Tarjeta oscura de la derecha: cómo te verá un cliente, con lo que vas escribiendo
function ProfilePreview({ values, user, rating, reviews }) {
  const stage = [values.universidad.trim() || null, stageLabel(values)].filter(Boolean).join(' · ')
  return (
    <aside className="rounded-[17px] bg-ink p-7 text-white lg:sticky lg:top-24" aria-label="Vista previa de tu perfil">
      <p className="text-[11px] font-semibold tracking-[0.13em] text-lime">VISTA PREVIA</p>
      <div className="my-7 flex items-center gap-3">
        <Avatar name={user.nombre} src={user.avatarUrl} size="lg" className="bg-lime! text-ink!" />
        <span className="flex min-w-0 flex-col gap-1">
          <strong className="truncate">{user.nombre}</strong>
          <small className="text-[11px] text-[#aaa8a0]">{stage || 'Tu universidad y ciclo'}</small>
        </span>
      </div>
      <div className="flex items-end justify-between border-y border-[#3c3c38] py-[19px]">
        <span className="text-[9px] tracking-[0.1em] text-[#8f8d86]">TARIFA</span>
        <strong className="text-[25px] font-semibold tabular-nums">
          {Number(values.tarifaHora) > 0 ? `S/ ${Number(values.tarifaHora).toFixed(2)}` : '—'}
          <small className="text-[11px] font-normal text-[#8f8d86]">/h</small>
        </strong>
      </div>
      <p className="my-[18px] flex items-center gap-1.5 text-[13px]">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="text-lime">
          <path d="m12 2 3 6 6.5 1-4.7 4.6 1.1 6.4-5.9-3-5.9 3 1.1-6.4L2.5 9 9 8Z" />
        </svg>
        {rating ? (
          <>
            <strong>{Number(rating).toFixed(1)}</strong>
            <span className="text-[#aaa8a0]">
              {reviews} {reviews === 1 ? 'reseña' : 'reseñas'}
            </span>
          </>
        ) : (
          <span className="text-[#aaa8a0]">Aún sin reseñas</span>
        )}
      </p>
      <p className="whitespace-pre-line text-xs leading-relaxed text-[#aaa8a0]">
        {values.presentacion.trim() || 'Tu presentación aparecerá aquí.'}
      </p>
      <div className="mt-5 grid gap-2 text-[11px] text-lime">
        <span className="flex items-center gap-1.5 [overflow-wrap:anywhere]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
            <path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14" />
          </svg>
          github.com/{values.githubUsername.trim() || 'usuario'}
        </span>
        <span className="flex items-center gap-1.5 [overflow-wrap:anywhere]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
          {values.portafolioUrl.trim().replace(/^https?:\/\//, '') || 'tuportafolio.dev'}
        </span>
      </div>
    </aside>
  )
}

function ProfileForm({ profile, user }) {
  const toast = useToast()
  const reviews = useUserReviews(user.id, { size: 1 })
  const [values, setValues] = useState(() => toFormValues(profile))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const github = values.githubUsername.trim()
  const githubLooksOk = github && !validateFreelancerProfile({ ...values }).githubUsername
  const percent = completion(values, Boolean(user.avatarUrl))

  const setField = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }
  const handleChange = (event) => setField(event.target.name, event.target.value)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const found = validateFreelancerProfile(values)
    setErrors(found)
    const first = Object.keys(found)[0]
    if (first) {
      document.getElementById(`perfil-${first}`)?.focus()
      return
    }

    setSaving(true)
    setSubmitError(null)
    try {
      const updated = await freelancerService.updateMine(toPayload(values))
      setValues(toFormValues(updated))
      toast.success('Perfil actualizado: tus cambios ya los ven los clientes')
    } catch (error) {
      setSubmitError(errorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <header className="mb-[35px] mt-8 flex flex-col items-start gap-6 md:mb-[50px] md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.13em]">MI PERFIL</p>
          <h1 className="my-3.5 max-w-[690px] text-[39px] font-semibold leading-[1.02] tracking-[-0.04em] md:text-[48px]">
            Edita cómo te presentas <em className="font-serif font-normal text-escrow">al mundo.</em>
          </h1>
          <p className="text-muted">Esto es lo que verán los clientes cuando revisen tu postulación.</p>
        </div>
        <div className="grid w-full grid-cols-[1fr_auto] items-center gap-2 md:w-[180px]">
          <span className="text-[9px] font-semibold tracking-[0.1em] text-muted">PERFIL COMPLETO</span>
          <strong className="text-[13px] text-escrow tabular-nums">{percent}%</strong>
          <span
            className="col-span-2 h-[5px] overflow-hidden rounded-full bg-line"
            role="progressbar"
            aria-label="Perfil completo"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span className="block h-full bg-escrow transition-[width] duration-300" style={{ width: `${percent}%` }} />
          </span>
        </div>
      </header>

      <div className="grid items-start gap-[25px] lg:grid-cols-[1.4fr_0.6fr]">
        <form onSubmit={handleSubmit} noValidate className="overflow-hidden rounded-[17px] border border-line bg-surface">
          <div className="bg-[#efede7] p-[18px] md:px-[30px] md:py-6">
            <AvatarUploader />
          </div>

          <Section number="01" title="Información académica" help="Ayuda a los clientes a entender tu etapa profesional.">
            <div className="grid gap-5 md:grid-cols-2">
              <Field id="perfil-universidad" label="Universidad" error={errors.universidad}>
                <input
                  id="perfil-universidad"
                  name="universidad"
                  value={values.universidad}
                  onChange={handleChange}
                  placeholder="UTEC"
                  maxLength={255}
                  aria-invalid={Boolean(errors.universidad)}
                  className={`${inputClass(errors.universidad)} min-h-12`}
                />
              </Field>
              <Field id="perfil-ciclo" label="Ciclo actual" error={errors.ciclo}>
                <select
                  id="perfil-ciclo"
                  name="ciclo"
                  value={values.egresado ? '' : values.ciclo}
                  onChange={handleChange}
                  disabled={values.egresado}
                  className={`${inputClass(errors.ciclo)} min-h-12`}
                >
                  <option value="">{values.egresado ? 'No aplica' : 'Elige tu ciclo'}</option>
                  {CICLOS.map((ciclo) => (
                    <option key={ciclo} value={ciclo}>
                      Ciclo {ciclo}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={values.egresado}
              onClick={() => setField('egresado', !values.egresado)}
              className="flex w-fit cursor-pointer items-center gap-[11px] text-left"
            >
              <span className={`h-[23px] w-10 rounded-full p-[3px] transition-colors ${values.egresado ? 'bg-escrow' : 'bg-[#aaa79f]'}`}>
                <span className={`block h-[17px] w-[17px] rounded-full bg-white transition-transform ${values.egresado ? 'translate-x-[17px]' : ''}`} />
              </span>
              <span className="flex flex-col gap-[3px]">
                <strong className="text-xs font-semibold">Ya soy egresado</strong>
                <small className="text-[11px] text-muted">Al activarlo, el ciclo deja de mostrarse.</small>
              </span>
            </button>
          </Section>

          <Section number="02" title="Trabajo y presencia digital" help="Define tu tarifa y conecta tu trabajo público.">
            <div className="grid gap-5 md:grid-cols-2">
              <Field
                id="perfil-tarifaHora"
                label="Tarifa por hora"
                error={errors.tarifaHora}
                hint={<p className="text-[11px] text-muted">Es una referencia: en cada postulación propones tu precio.</p>}
              >
                <div className={prefixedClass(errors.tarifaHora)}>
                  <span className="border-r border-line px-3 text-muted">S/</span>
                  <input
                    id="perfil-tarifaHora"
                    name="tarifaHora"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    placeholder="35.00"
                    value={values.tarifaHora}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.tarifaHora)}
                    className="w-full min-w-0 bg-transparent px-3 text-sm tabular-nums"
                    style={{ outline: 'none' }}
                  />
                </div>
              </Field>
              <Field id="perfil-portafolioUrl" label="Portafolio" error={errors.portafolioUrl}>
                <input
                  id="perfil-portafolioUrl"
                  name="portafolioUrl"
                  type="url"
                  placeholder="https://tuportafolio.dev"
                  value={values.portafolioUrl}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.portafolioUrl)}
                  className={`${inputClass(errors.portafolioUrl)} min-h-12`}
                />
              </Field>
            </div>
            <Field
              id="perfil-githubUsername"
              label="Usuario de GitHub"
              error={errors.githubUsername}
              hint={
                githubLooksOk && (
                  <p className="flex items-center gap-1.5 text-[11px] text-escrow">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m5 12 4 4L19 6" />
                    </svg>
                    Formato válido
                  </p>
                )
              }
            >
              <div className={prefixedClass(errors.githubUsername)}>
                <span className="self-stretch border-r border-line bg-paper px-2.5 py-3.5 font-mono text-[11px] text-muted">github.com/</span>
                <input
                  id="perfil-githubUsername"
                  name="githubUsername"
                  autoComplete="off"
                  placeholder="tu-usuario"
                  value={values.githubUsername}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.githubUsername)}
                  className="w-full min-w-0 bg-transparent px-2.5 text-sm"
                  style={{ outline: 'none' }}
                />
              </div>
            </Field>
          </Section>

          <Section number="03" title="Presentación" help="Cuenta qué haces bien y cómo trabajas.">
            <Field id="perfil-presentacion" label="Sobre mí" error={errors.presentacion}>
              <div className="relative">
                <textarea
                  id="perfil-presentacion"
                  name="presentacion"
                  value={values.presentacion}
                  onChange={handleChange}
                  maxLength={MAX_PRESENTACION}
                  placeholder="Desarrollo productos web con React y Spring Boot. Me gusta convertir necesidades concretas en interfaces simples…"
                  aria-invalid={Boolean(errors.presentacion)}
                  className={`${inputClass(errors.presentacion)} h-[145px] resize-none pb-7 pt-3 leading-normal`}
                />
                <small aria-hidden="true" className="pointer-events-none absolute bottom-2.5 right-3 text-[10px] tabular-nums text-muted">
                  {values.presentacion.length}/{MAX_PRESENTACION}
                </small>
              </div>
            </Field>
          </Section>

          {submitError && (
            <p role="alert" className="mx-[22px] mt-5 rounded-[10px] bg-error-light px-3.5 py-3 text-sm text-error md:mx-8">
              {submitError}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 px-[22px] py-5 md:flex-row md:justify-end md:px-8 md:py-[22px]">
            <ButtonLink to={`/freelancers/${user.id}`} variant="ghost" className="w-full md:w-auto">
              Cancelar
            </ButtonLink>
            <Button type="submit" loading={saving} className="w-full md:w-auto">
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </div>
        </form>

        <div className="order-first lg:order-none">
          <ProfilePreview values={values} user={user} rating={profile.calificacionPromedio} reviews={reviews.data?.totalElements ?? 0} />
        </div>
      </div>
    </>
  )
}

// Editar perfil del freelancer (mockup EditarPerfil): foto, estudios, tarifa, enlaces y presentación,
// con una vista previa a la derecha de cómo lo verán los clientes
export default function EditMyProfile() {
  const { user } = useAuth()
  const { data: profile, loading, error, status, reload } = useMyFreelancerProfile()

  return (
    <main className="mx-auto w-full max-w-[1248px] px-4 pb-20 pt-[45px] md:px-6 md:pb-[120px] md:pt-[70px]">
      <LoadingNotice loading={loading} what="tu perfil" />
      <Link to={`/freelancers/${user.id}`} className="inline-flex items-center gap-2 text-xs text-muted hover:text-ink hover:underline">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="rotate-180">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
        Ver perfil público
      </Link>

      {error && (
        <div className="mt-8">
          <ErrorBox message={error} status={status} onRetry={reload} />
        </div>
      )}

      {loading && (
        <div aria-busy="true" className="mt-8 grid gap-6">
          <Skeleton className="h-28 w-2/3" />
          <div className="grid gap-[25px] lg:grid-cols-[1.4fr_0.6fr]">
            <Skeleton className="h-[640px] w-full rounded-[17px]" />
            <Skeleton className="h-80 w-full rounded-[17px]" />
          </div>
        </div>
      )}

      {profile && <ProfileForm key={profile.userId} profile={profile} user={user} />}
    </main>
  )
}

Section.propTypes = {
  number: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  help: PropTypes.string.isRequired,
  children: PropTypes.node,
}

Field.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  error: PropTypes.string,
  hint: PropTypes.node,
  children: PropTypes.node,
}

ProfilePreview.propTypes = {
  values: PropTypes.shape({
    universidad: PropTypes.string,
    ciclo: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    egresado: PropTypes.bool,
    tarifaHora: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    portafolioUrl: PropTypes.string,
    githubUsername: PropTypes.string,
    presentacion: PropTypes.string,
  }).isRequired,
  user: PropTypes.shape({ nombre: PropTypes.string, avatarUrl: PropTypes.string }).isRequired,
  rating: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  reviews: PropTypes.number,
}

ProfileForm.propTypes = {
  profile: freelancerProfileShape.isRequired,
  user: PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), nombre: PropTypes.string, avatarUrl: PropTypes.string })
    .isRequired,
}
