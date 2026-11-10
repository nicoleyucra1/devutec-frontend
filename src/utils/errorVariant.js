// Qué tarjeta de error corresponde a un código HTTP. null significa que el servidor no respondió (así lo deja
// useAsync); si no se pasa ningún status se muestra el error genérico con el mensaje del backend.
const KNOWN = [401, 403, 404, 409]

export function errorVariant(status) {
  if (status === undefined) return 'generic'
  if (status === null || status === 0) return 'offline'
  if (status >= 500) return '500'
  return KNOWN.includes(status) ? String(status) : 'generic'
}
