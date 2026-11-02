import axios from 'axios'

// Convierte un error de axios en un texto entendible para mostrar en pantalla.
// Cada código de estado tiene su mensaje; si el backend manda uno más específico, se usa ese.
export function errorMessage(error, fallback = 'Ocurrió un error. Inténtalo otra vez.') {
  if (axios.isCancel(error)) return null

  // Sin respuesta: el servidor no contestó a tiempo o no hay conexión
  if (!error?.response) {
    if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
      return 'El servidor tardó demasiado en responder. Inténtalo otra vez.'
    }
    return 'No hay conexión con el servidor. Revisa tu internet.'
  }

  const status = error.response.status
  const apiMessage = error.response.data?.message

  switch (status) {
    case 400:
      // Errores de validación: el backend dice qué campo está mal
      return apiMessage ?? 'Revisa los datos ingresados.'
    case 401:
      return 'Tu sesión expiró. Vuelve a iniciar sesión.'
    case 403:
      return 'No tienes permiso para hacer esto.'
    case 404:
      return 'No encontramos lo que buscas.'
    case 409:
      // Conflictos de negocio, por ejemplo postular dos veces al mismo proyecto
      return apiMessage ?? 'La operación entra en conflicto con datos existentes.'
    default:
      if (status >= 500) return 'El servidor tuvo un problema. Inténtalo en unos minutos.'
      return apiMessage ?? fallback
  }
}
