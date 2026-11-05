import api from './api'

export const freelancerService = {
  // Perfil del freelancer con sesión iniciada
  async getMine({ signal } = {}) {
    const { data } = await api.get('/freelancers/me', { signal })
    return data
  },

  // Actualización parcial: solo se cambian los campos enviados
  async updateMine(profile) {
    const { data } = await api.put('/freelancers/me', profile)
    return data
  },

  // Perfil público, buscado por el id de usuario del freelancer
  async getByUserId(userId, { signal } = {}) {
    const { data } = await api.get(`/freelancers/${userId}`, { signal })
    return data
  },
}
