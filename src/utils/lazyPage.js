import { lazy } from 'react'

const RELOAD_KEY = 'devutec.recargaPorVersion'

// sessionStorage puede no estar disponible (por ejemplo, con el almacenamiento bloqueado)
const storage = {
  get: () => {
    try {
      return sessionStorage.getItem(RELOAD_KEY)
    } catch {
      return '1'
    }
  },
  set: (value) => {
    try {
      if (value) sessionStorage.setItem(RELOAD_KEY, value)
      else storage.set(null)
    } catch {
      // Sin almacenamiento no se recarga sola, para no entrar en un bucle
    }
  },
}

// Igual que lazy(), pero si el archivo de la página ya no existe porque se publicó una versión nueva de la web
// mientras estaba abierta, recarga una sola vez para traer la versión nueva en vez de mostrar "Algo falló".
export function lazyPage(importer) {
  return lazy(async () => {
    try {
      const page = await importer()
      storage.set(null)
      return page
    } catch (error) {
      // Si ya se recargó y sigue fallando, no es por la versión: se deja que lo muestre el ErrorBoundary
      if (!storage.get()) {
        storage.set('1')
        window.location.reload()
        // La página se va a recargar: mientras tanto sigue mostrándose el cargador
        return new Promise(() => {})
      }
      throw error
    }
  })
}
