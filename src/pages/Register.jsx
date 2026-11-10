import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import AuthField from '../components/auth/AuthField'
import PasswordToggle from '../components/auth/PasswordToggle'
import RegisterAside from '../components/auth/RegisterAside'
import PublicHeader from '../components/layout/PublicHeader'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { errorMessage } from '../utils/errorMessage'
import { PASSWORD_RULES, validateRegister } from '../utils/validation'

const briefcase = (
  <>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" />
  </>
)
const code = <path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14" />

// Cada rol cambia el texto de su tarjeta, las etiquetas del formulario y el botón
const ROLES = [
  {
    value: 'CLIENT',
    title: 'Soy cliente',
    description: 'Necesito contratar talento para un proyecto.',
    detail: 'Publica, compara propuestas y paga al aprobar.',
    icon: briefcase,
    nameLabel: 'Nombre del negocio',
    namePlaceholder: 'Pizzería Don Mario',
    emailPlaceholder: 'tu@negocio.pe',
    cta: 'Crear cuenta como cliente',
  },
  {
    value: 'FREELANCER',
    title: 'Soy freelancer',
    description: 'Estudio o egresé de UTEC y busco proyectos.',
    detail: 'Postula, entrega y cobra con seguridad.',
    icon: code,
    nameLabel: 'Nombres y apellidos',
    namePlaceholder: 'Camila Ríos',
    emailPlaceholder: 'tu@utec.edu.pe',
    cta: 'Crear cuenta como freelancer',
  },
]

function Check({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 12 4 4L19 6" />
    </svg>
  )
}

function Step({ number, children, className = '' }) {
  return (
    <p className={`mb-[18px] flex items-center gap-3 text-[10px] font-semibold tracking-[0.12em] ${className}`}>
      <span className="font-serif text-[22px] font-normal italic tracking-normal text-escrow">{number}</span>
      {children}
    </p>
  )
}

function RoleCard({ role, selected, onChange }) {
  return (
    <label
      className={`relative flex min-h-[205px] cursor-pointer flex-col items-start rounded-2xl bg-surface text-left transition duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-progress lg:min-h-[235px] ${
        selected
          ? 'border-2 border-escrow bg-[#f9fcfa] p-[23px]'
          : 'border border-line p-6 hover:-translate-y-0.5 hover:border-[#aaa69d]'
      }`}
    >
      <input type="radio" name="rol" value={role.value} checked={selected} onChange={onChange} className="sr-only" />
      <span
        aria-hidden="true"
        className={`absolute right-5 top-5 grid h-[23px] w-[23px] place-items-center rounded-full border ${
          selected ? 'border-escrow bg-escrow text-white' : 'border-line'
        }`}
      >
        {selected && <Check size={13} />}
      </span>
      <span
        aria-hidden="true"
        className={`mb-[25px] grid h-12 w-12 place-items-center rounded-xl transition-colors ${
          selected ? 'bg-[#e8f2eb] text-escrow' : 'bg-paper'
        }`}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {role.icon}
        </svg>
      </span>
      <strong className="text-lg font-semibold">{role.title}</strong>
      <span className="my-2 text-xs leading-normal">{role.description}</span>
      <small className="text-xs leading-[1.4] text-muted">{role.detail}</small>
    </label>
  )
}

// Las reglas de la contraseña se marcan en verde apenas se cumplen
function PasswordRules({ password }) {
  return (
    <ul aria-label="Requisitos de la contraseña" className="flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:gap-[18px]">
      {PASSWORD_RULES.map((rule) => {
        const valid = rule.test(password)
        return (
          <li key={rule.label} className={`flex items-center gap-1.5 text-[11px] transition-colors ${valid ? 'text-escrow' : 'text-muted'}`}>
            <span
              aria-hidden="true"
              className={`grid h-3.5 w-3.5 place-items-center rounded-full border transition-colors ${
                valid ? 'border-escrow bg-escrow text-white' : 'border-[#aaa69e]'
              }`}
            >
              {valid && <Check size={9} />}
            </span>
            {rule.label}
            <span className="sr-only">{valid ? '(cumplido)' : '(pendiente)'}</span>
          </li>
        )
      })}
    </ul>
  )
}

// Página Crear cuenta del diseño: primero se elige el rol, después los datos. La tarjeta negra de la derecha
// cambia según el rol. Si se llega desde la landing con ?rol=, ese rol ya viene marcado.
export default function Register() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [searchParams] = useSearchParams()
  const presetRole = ROLES.some((role) => role.value === searchParams.get('rol')) ? searchParams.get('rol') : 'CLIENT'

  const [values, setValues] = useState({ nombre: '', email: '', password: '', rol: presetRole })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to="/" replace />

  const role = ROLES.find((item) => item.value === values.rol) ?? ROLES[0]

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
      // El registro devuelve tokens, así que la persona entra directo sin volver a iniciar sesión
      await register({
        nombre: values.nombre.trim(),
        email: values.email.trim(),
        password: values.password,
        rol: values.rol,
      })
      toast.success('Tu cuenta se creó correctamente')
      navigate('/', { replace: true })
    } catch (error) {
      setSubmitError(error.response?.status === 409 ? 'Ya existe una cuenta con ese correo.' : errorMessage(error))
      setSubmitting(false)
    }
  }

  return (
    <>
      <PublicHeader />
      <main className="mx-auto w-full max-w-[1200px] px-6 pb-[75px] pt-[50px] lg:pb-[90px] lg:pt-[75px]">
        <header className="mb-10 max-w-[690px] lg:mb-[60px]">
          <p className="text-[11px] font-semibold tracking-[0.13em]">CREA TU CUENTA</p>
          <h1 className="my-[18px] text-[46px] leading-none tracking-[-0.045em] lg:text-[60px]">
            ¿Cómo usarás <em>DevUTEC?</em>
          </h1>
          <p className="text-muted">Elige un rol para personalizar tu experiencia. Podrás cambiarlo después.</p>
        </header>

        <div className="grid items-start gap-[45px] lg:grid-cols-[1.3fr_.7fr] lg:gap-[70px]">
          <section>
            <form onSubmit={handleSubmit} noValidate>
              <fieldset>
                <legend>
                  <Step number="01">ELIGE TU ROL</Step>
                </legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {ROLES.map((item) => (
                    <RoleCard key={item.value} role={item} selected={values.rol === item.value} onChange={handleChange} />
                  ))}
                </div>
              </fieldset>

              <Step number="02" className="mt-[50px] border-t border-line pt-[35px]">
                TUS DATOS
              </Step>
              <div className="grid gap-5 sm:grid-cols-2">
                <AuthField
                  label={role.nameLabel}
                  name="nombre"
                  autoComplete={values.rol === 'CLIENT' ? 'organization' : 'name'}
                  placeholder={role.namePlaceholder}
                  value={values.nombre}
                  onChange={handleChange}
                  error={errors.nombre}
                />
                <AuthField
                  label="Correo electrónico"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder={role.emailPlaceholder}
                  value={values.email}
                  onChange={handleChange}
                  error={errors.email}
                />
                <AuthField
                  label="Contraseña"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Crea una contraseña segura"
                  value={values.password}
                  onChange={handleChange}
                  error={errors.password}
                  trailing={<PasswordToggle shown={showPassword} onToggle={() => setShowPassword((shown) => !shown)} />}
                />
                <PasswordRules password={values.password} />

                {submitError && (
                  <p role="alert" className="rounded-[10px] bg-error-light px-3.5 py-3 text-sm text-error sm:col-span-2">
                    {submitError}
                  </p>
                )}

                <Button type="submit" loading={submitting} className="w-full sm:col-span-2">
                  {submitting ? 'Creando tu cuenta...' : role.cta}
                </Button>
              </div>
            </form>

            <p className="mt-7 text-center text-xs text-muted lg:text-left">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="font-semibold text-ink underline underline-offset-2">
                Ingresa aquí
              </Link>
            </p>
          </section>

          <RegisterAside role={values.rol} />
        </div>
      </main>
    </>
  )
}
