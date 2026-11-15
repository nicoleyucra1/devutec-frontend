import PropTypes from 'prop-types'

// Formas de los datos que vienen del backend y que varios componentes reciben como props.
// Sirven para PropTypes: si un componente recibe algo con otra forma, React avisa en la consola (solo en desarrollo).
// Solo se listan los campos que usan los componentes; el backend puede mandar más.

export const idType = PropTypes.oneOfType([PropTypes.number, PropTypes.string])

export const skillShape = PropTypes.shape({
  id: idType.isRequired,
  name: PropTypes.string.isRequired,
})

export const projectShape = PropTypes.shape({
  id: idType.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  status: PropTypes.string,
  budget: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  deadline: PropTypes.string,
  location: PropTypes.string,
  clientId: idType,
  createdAt: PropTypes.string,
  skills: PropTypes.arrayOf(skillShape),
})

export const contractShape = PropTypes.shape({
  id: idType.isRequired,
  projectTitle: PropTypes.string,
  status: PropTypes.string,
  amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  startedAt: PropTypes.string,
  deliveredAt: PropTypes.string,
  deadline: PropTypes.string,
  clientName: PropTypes.string,
  freelancerName: PropTypes.string,
  clientPhone: PropTypes.string,
  freelancerPhone: PropTypes.string,
})

export const userShape = PropTypes.shape({
  id: idType,
  nombre: PropTypes.string,
  email: PropTypes.string,
  rol: PropTypes.oneOf(['CLIENT', 'FREELANCER', 'ADMIN']),
})

export const freelancerProfileShape = PropTypes.shape({
  userId: idType,
  nombre: PropTypes.string,
  universidad: PropTypes.string,
  ciclo: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  egresado: PropTypes.bool,
  tarifaHora: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  calificacionPromedio: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  githubUsername: PropTypes.string,
  portafolioUrl: PropTypes.string,
})

// Una postulación con lo que agrega useApplicants: el perfil del freelancer y cuántas reseñas tiene
export const applicationShape = PropTypes.shape({
  id: idType.isRequired,
  freelancerName: PropTypes.string,
  freelancerUserId: idType,
  message: PropTypes.string,
  proposedPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  status: PropTypes.oneOf(['PENDING', 'ACCEPTED', 'REJECTED']),
  createdAt: PropTypes.string,
  profile: freelancerProfileShape,
  reviewCount: PropTypes.number,
})

// Un link de react-router: un texto ('/projects') o un objeto ({ pathname, search })
export const linkTo = PropTypes.oneOfType([PropTypes.string, PropTypes.object])
