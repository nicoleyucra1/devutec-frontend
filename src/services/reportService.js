import api from './api'

// Reportes: el cliente o el estudiante reporta a la otra parte de su contrato o postulación.
// El admin ve todos (también los que deja el filtro automático cuando bloquea un texto).
export const reportService = {
  async create({ contractId, applicationId, reason, detail }) {
    const { data } = await api.post('/reports', { contractId, applicationId, reason, detail })
    return data
  },

  async getAll({ signal } = {}) {
    const { data } = await api.get('/reports', { signal })
    return data
  },

  async markReviewed(id) {
    const { data } = await api.patch(`/reports/${id}/reviewed`)
    return data
  },
}

export const REPORT_REASONS = {
  PAGO_POR_FUERA: 'Me pidió pagar o cobrar por fuera de DEVUTEC',
  CONTACTO_POR_FUERA: 'Me pidió hablar o trabajar por fuera de DEVUTEC',
  OTRO: 'Otro motivo',
}

// Etiquetas cortas para la lista del admin
export const REPORT_REASON_LABELS = {
  PAGO_POR_FUERA: 'Pago por fuera',
  CONTACTO_POR_FUERA: 'Contacto por fuera',
  FILTRO_AUTOMATICO: 'Filtro automático',
  OTRO: 'Otro',
}
