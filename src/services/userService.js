import api from './api'

export const userService = {
  // Devuelve { id, nombre, email, rol, avatarUrl } del usuario con sesión
  getMe: ({ signal } = {}) => api.get('/users/me', { signal }).then((res) => res.data),

  // Sube o reemplaza la foto de perfil (campo "file"). Devuelve el usuario con la nueva avatarUrl.
  // Sin Content-Type a mano: con FormData el navegador lo arma con el boundary correcto.
  uploadAvatar: (file) => {
    const form = new FormData()
    form.append('file', file)
    return api.put('/users/me/avatar', form).then((res) => res.data)
  },

  // Quita la foto de perfil. Devuelve el usuario con avatarUrl en null.
  deleteAvatar: () => api.delete('/users/me/avatar').then((res) => res.data),
}
