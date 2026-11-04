import { applicationService } from '../services/applicationService'
import { useAsync } from './useAsync'

// Postulaciones que recibió un proyecto (GET /applications?projectId=), solo para su dueño
export function useProjectApplications(projectId) {
  return useAsync((options) => applicationService.getByProject(projectId, options), [projectId])
}