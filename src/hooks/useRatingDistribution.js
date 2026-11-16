import { reviewService } from '../services/reviewService'
import { useAsync } from './useAsync'

// Cuántas reseñas de 5, 4, 3, 2 y 1 estrellas tiene un usuario, para las barras del perfil.
// La API no da el conteo por estrella, pero sí filtra por calificación mínima: se pide el total con
// mínimo 1, 2, 3, 4 y 5 (una reseña por página, solo importa el total) y se restan.
export function useRatingDistribution(userId) {
  return useAsync(
    async (options) => {
      const totals = await Promise.all(
        [1, 2, 3, 4, 5].map((minRating) =>
          reviewService.getByUser(userId, { size: 1, minRating }, options).then((page) => page.totalElements),
        ),
      )
      // totals[0] = con 1★ o más (todas), totals[4] = solo 5★
      const counts = { 5: totals[4] }
      for (let stars = 4; stars >= 1; stars--) counts[stars] = totals[stars - 1] - totals[stars]
      return { total: totals[0], counts }
    },
    [userId],
  )
}
