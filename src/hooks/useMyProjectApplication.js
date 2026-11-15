import { applicationService } from '../services/applicationService'
import { contractService } from '../services/contractService'
import { useAsync } from './useAsync'

// La postulación del freelancer con sesión a un proyecto (o null si no postuló) y su contrato si la aceptaron.
// Solo se pide si enabled: un cliente o un admin no tiene postulaciones y la API le respondería 403.
export function useMyProjectApplication(projectId, enabled) {
  return useAsync(
    async (options) => {
      if (!enabled || !projectId) return { application: null, contract: null }
      const applications = await applicationService.getMine(options)
      const application = applications.find((item) => String(item.projectId) === String(projectId)) ?? null
      let contract = null
      if (application?.status === 'ACCEPTED') {
        const contracts = await contractService.getMine(options).catch(() => [])
        contract = contracts.find((item) => String(item.projectId) === String(projectId)) ?? null
      }
      return { application, contract }
    },
    [projectId, enabled],
  )
}
