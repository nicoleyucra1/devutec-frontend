import api from './api'

// Métricas DEVUTEC de la web (o app) del cliente. Todas devuelven el panel completo del contrato:
// { enabled, requested, canManage, consentText, publicKey, integrated, lastEventAt, onlyTestData, access, summary, integration }
export const metricsService = {
  get: (contractId, { signal } = {}) => api.get(`/contracts/${contractId}/metrics`, { signal }).then((res) => res.data),

  // El cliente activa las métricas marcando el consentimiento (se crea la llave de su web)
  enable: (contractId) => api.post(`/contracts/${contractId}/metrics`, { consent: true }).then((res) => res.data),

  // El cliente retira su consentimiento: se borran la llave y los datos del panel
  disable: (contractId) => api.delete(`/contracts/${contractId}/metrics`).then((res) => res.data),

  // Membresía: abre Stripe para suscribirse ("BASIC" o "PRO"). Devuelve { sessionId, checkoutUrl }
  subscribe: (contractId, plan) => api.post(`/contracts/${contractId}/metrics/subscription`, { plan }).then((res) => res.data),

  // Al volver de Stripe (?suscripcion=ok&session_id=...)
  confirmSubscription: (contractId, sessionId) =>
    api.post(`/contracts/${contractId}/metrics/subscription/confirm`, { sessionId }).then((res) => res.data),

  // Reporte Pro (sale de Amplitude): { available, message, topPages, sources, devices, contactsByMonth }
  advanced: (contractId, { signal } = {}) => api.get(`/contracts/${contractId}/metrics/advanced`, { signal }).then((res) => res.data),
}
