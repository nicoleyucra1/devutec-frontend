import api from './api'

// Verificación universitaria: correo .edu.pe (al registrarse) y foto del carnet revisada por el admin
export const verificationService = {
  async getMyStatus({ signal } = {}) {
    const { data } = await api.get('/users/me/carnet', { signal })
    return data
  },

  async uploadCarnet(file) {
    const form = new FormData()
    form.append('file', file)
    const { data } = await api.put('/users/me/carnet', form, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 })
    return data
  },

  // La foto es privada (va con el token): se pide como blob y se muestra con un URL temporal
  async getCarnetImage(userId) {
    const { data } = await api.get(`/users/${userId}/carnet/image`, { responseType: 'blob' })
    return URL.createObjectURL(data)
  },

  async list(status, { signal } = {}) {
    const { data } = await api.get('/admin/carnets', { params: status ? { status } : {}, signal })
    return data
  },

  async review(userId, { approved, reason }) {
    const { data } = await api.patch(`/admin/carnets/${userId}`, { approved, reason: reason || null })
    return data
  },
}
