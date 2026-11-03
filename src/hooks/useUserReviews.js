import { reviewService } from '../services/reviewService'
import { useAsync } from './useAsync'

// Reseñas recibidas por un usuario, paginadas y con filtro opcional de calificación mínima
export function useUserReviews(userId, params) {
  const key = JSON.stringify(params)
  return useAsync((options) => reviewService.getByUser(userId, params, options), [userId, key])
}
