// Marca que la sesión terminó porque no se pudo renovar (y no porque la persona cerró sesión).
// Así PrivateRoute sabe que tiene que mostrar la página de sesión expirada en lugar del login directo.
let expired = false

export const sessionExpiry = {
  mark: () => {
    expired = true
  },
  clear: () => {
    expired = false
  },
  isExpired: () => expired,
}
