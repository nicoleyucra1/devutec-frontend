import api from './api'

// Asistente IA para crear un proyecto conversando (Claude en el backend; la clave nunca llega a la web).
// data: { message, history: [{ role: 'user' | 'assistant', text }] }
// Devuelve { reply, outOfScope, ready, remaining, draft }. draft llega cuando ready es true: título, descripción,
// habilidades (ocultas para el cliente), funcionalidades, precio sugerido, desglose de la comisión y etapas de pago.
export const assistantService = {
  chat: (data) => api.post('/assistant/project-chat', data).then((res) => res.data),
}
