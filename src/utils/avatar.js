import { API_URL } from '../services/api'

// El backend manda la foto como ruta (/api/v1/users/5/avatar?v=...). Se completa con el dominio de la API,
// que puede ser otro distinto al de la web (localhost:8080 en desarrollo, devutec.duckdns.org en producción).
export function avatarSrc(path) {
  if (!path) return null
  try {
    return new URL(path, API_URL).href
  } catch {
    return null
  }
}

export const AVATAR_TYPES = ['image/jpeg', 'image/png']
// La foto original puede ser pesada: antes de subirla se achica en el navegador (ver prepareAvatar)
export const AVATAR_MAX_MB = 10
const OUTPUT_SIZE = 800

// Revisa la foto elegida y la deja lista para subir: cuadrada desde el centro, de 800 × 800 y en JPEG.
// createImageBitmap respeta la orientación de las fotos del celular, así no quedan de costado.
// El backend vuelve a validar todo y la guarda a 400 × 400.
export async function prepareAvatar(file) {
  if (!AVATAR_TYPES.includes(file.type)) {
    throw new Error('La foto tiene que ser JPG o PNG.')
  }
  if (file.size > AVATAR_MAX_MB * 1024 * 1024) {
    throw new Error(`La foto puede pesar como máximo ${AVATAR_MAX_MB} MB.`)
  }

  let bitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new Error('No pudimos abrir esa imagen. Prueba con otra foto JPG o PNG.')
  }

  const side = Math.min(bitmap.width, bitmap.height)
  const size = Math.min(OUTPUT_SIZE, side)
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  // Fondo blanco para lo transparente de un PNG, como hace el backend
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, size, size)
  context.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, size, size)
  bitmap.close?.()

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9))
  if (!blob) throw new Error('No pudimos preparar la foto. Prueba de nuevo.')
  return new File([blob], 'foto-perfil.jpg', { type: 'image/jpeg' })
}
