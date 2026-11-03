import { freelancerService } from '../services/freelancerService'
import { useAsync } from './useAsync'

// Perfil del freelancer con sesión iniciada (GET /freelancers/me)
export function useMyFreelancerProfile() {
  return useAsync((options) => freelancerService.getMine(options), [])
}
