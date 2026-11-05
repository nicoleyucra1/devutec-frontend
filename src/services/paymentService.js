import api from './api'

export const paymentService = {
  // Todos los pagos de la plataforma; solo para ADMIN (GET /payments)
  async getAll({ signal } = {}) {
    const { data } = await api.get('/payments', { signal })
    return data
  },
}
