import api from './api'

export const reviewService = {
  // Reseñas recibidas por un usuario. En pantalla las páginas empiezan en 1; en la API, en 0.
  async getByUser(userId, { page = 1, size = 5, minRating } = {}, { signal } = {}) {
    const params = { page: Math.max(Number(page) || 1, 1) - 1, size }
    if (minRating) params.minRating = minRating
    const { data } = await api.get(`/users/${userId}/reviews`, { params, signal })
    return { ...data, page: data.page + 1 }
  },
}
