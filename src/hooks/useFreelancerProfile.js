import { freelancerService } from '../services/freelancerService'
import { useAsync } from './useAsync'

// Perfil público de un freelancer (GET /freelancers/{userId})
export function useFreelancerProfile(userId) {
  return useAsync((options) => freelancerService.getByUserId(userId, options), [userId])
}
