import api from './api'

// Métricas de la web del cliente: el panel (visitas, personas, pedidos, velocidad) y el código para instalarlas
export const metricsService = {
  async getDashboard(contractId, days = 30, { signal } = {}) {
    const { data } = await api.get(`/contracts/${contractId}/metrics`, { params: { days }, signal })
    return data
  },

  async getSetup(contractId, { signal } = {}) {
    const { data } = await api.get(`/contracts/${contractId}/metrics/setup`, { signal })
    return data
  },
}
