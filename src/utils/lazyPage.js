import { lazy } from 'react'

const RELOAD_KEY = 'devutec.recargaPorVersion'

// Marca de "ya recargué por una versión nueva", guardada solo en esta pestaña.
// sessionStorage puede no estar disponible (por ejemplo, con el almacenamiento bloqueado)
const reloadMark = {
  exists: () => {
    try {
      return sessionStorage.getItem(RELOAD_KEY) !== null
    } catch {
      // Sin almacenamiento se responde que ya se recargó, para no entrar en un bucle de recargas
      return true
    }
  },
  save: () => {
    try {
      sessionStorage.setItem(RELOAD_KEY, '1')
    } catch {
      // Sin almacenamiento no se guarda nada
    }
  },
  clear: () => {
    try {
      sessionStorage.removeItem(RELOAD_KEY)
    } catch {
      // Sin almacenamiento no hay nada que borrar
    }
  },
}

// Igual que lazy(), pero si el archivo de la página ya no existe porque se publicó una versión nueva de la web
// mientras estaba abierta, recarga una sola vez para traer la versión nueva en vez de mostrar "Algo falló".
export function lazyPage(importer) {
  return lazy(async () => {
    try {
      const page = await importer()
      reloadMark.clear()
      return page
    } catch (error) {
      // Si ya se recargó y sigue fallando, no es por la versión: se deja que lo muestre el ErrorBoundary
      if (!reloadMark.exists()) {
        reloadMark.save()
        window.location.reload()
        // La página se va a recargar: mientras tanto sigue mostrándose el cargador
        return new Promise(() => {})
      }
      throw error
    }
  })
}
