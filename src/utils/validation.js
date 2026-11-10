// Reglas de los formularios de autenticación. Son las mismas que valida el backend.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).+$/

// Reglas de la contraseña, para mostrarlas en vivo mientras se escribe en Crear cuenta
export const PASSWORD_RULES = [
  { label: '8 caracteres como mínimo', test: (password) => password.length >= 8 },
  { label: 'Una letra', test: (password) => /[A-Za-z]/.test(password) },
  { label: 'Un número', test: (password) => /\d/.test(password) },
]

export function validateEmail(email) {
  if (!email.trim()) return 'El correo es obligatorio'
  if (!EMAIL_REGEX.test(email.trim())) return 'El correo no tiene un formato válido'
  return null
}

export function validatePassword(password) {
  if (!password) return 'La contraseña es obligatoria'
  if (password.length < 8 || password.length > 100) return 'La contraseña debe tener entre 8 y 100 caracteres'
  if (!PASSWORD_REGEX.test(password)) return 'La contraseña debe tener al menos una letra y un número'
  return null
}

export function validateLogin({ email, password }) {
  const errors = {}
  const emailError = validateEmail(email)
  if (emailError) errors.email = emailError
  if (!password) errors.password = 'La contraseña es obligatoria'
  return errors
}

export function validateRegister({ nombre, email, password, rol }) {
  const errors = {}
  if (!nombre.trim()) errors.nombre = rol === 'CLIENT' ? 'El nombre del negocio es obligatorio' : 'Tu nombre es obligatorio'
  const emailError = validateEmail(email)
  if (emailError) errors.email = emailError
  const passwordError = validatePassword(password)
  if (passwordError) errors.password = passwordError
  if (!rol) errors.rol = 'Elige si quieres contratar o trabajar'
  return errors
}

// Reglas del perfil de freelancer. Son las mismas que valida PUT /freelancers/me.
const GITHUB_USERNAME_REGEX = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/

function isHttpUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

// Todos los campos son opcionales: solo se valida lo que el freelancer llenó.
// Si marca egresado, el ciclo no se valida porque no se envía.
export function validateFreelancerProfile({ universidad, ciclo, egresado, tarifaHora, portafolioUrl, githubUsername }) {
  const errors = {}
  if (universidad.trim().length > 255) errors.universidad = 'La universidad no puede tener más de 255 caracteres'

  if (!egresado && ciclo !== '') {
    const value = Number(ciclo)
    if (!Number.isInteger(value) || value < 1 || value > 10) errors.ciclo = 'El ciclo debe estar entre 1 y 10'
  }

  if (tarifaHora !== '' && !(Number(tarifaHora) > 0)) errors.tarifaHora = 'La tarifa por hora debe ser mayor a cero'

  const url = portafolioUrl.trim()
  if (url && !isHttpUrl(url)) errors.portafolioUrl = 'La URL del portafolio no es válida (debe empezar con http:// o https://)'
  else if (url.length > 255) errors.portafolioUrl = 'La URL del portafolio no puede tener más de 255 caracteres'

  const github = githubUsername.trim()
  if (github && !GITHUB_USERNAME_REGEX.test(github)) {
    errors.githubUsername = 'El usuario de GitHub solo puede tener letras, números y guiones (máx. 39)'
  }
  return errors
}
