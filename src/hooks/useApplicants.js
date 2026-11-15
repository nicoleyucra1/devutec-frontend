import { applicationService } from '../services/applicationService'
import { freelancerService } from '../services/freelancerService'
import { reviewService } from '../services/reviewService'
import { useAsync } from './useAsync'

// Postulaciones de un proyecto, cada una con el perfil del freelancer (ciclo, egresado, calificación) y cuántas
// reseñas tiene, para compararlas lado a lado. El perfil y las reseñas se piden al mismo tiempo para cada postulante;
// si alguno falla, esa tarjeta se muestra sin esos datos y el resto de la página sigue.
export function useApplicants(projectId) {
  return useAsync(
    async (options) => {
      const applications = await applicationService.getByProject(projectId, options)
      return Promise.all(
        applications.map(async (application) => {
          const [profile, reviews] = await Promise.all([
            freelancerService.getByUserId(application.freelancerUserId, options).catch(() => null),
            reviewService.getByUser(application.freelancerUserId, { size: 1 }, options).catch(() => null),
          ])
          return { ...application, profile, reviewCount: reviews?.totalElements ?? null }
        }),
      )
    },
    [projectId],
  )
}
