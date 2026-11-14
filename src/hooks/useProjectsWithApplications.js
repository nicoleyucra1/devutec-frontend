import { applicationService } from '../services/applicationService'
import { projectService } from '../services/projectService'
import { useAsync } from './useAsync'

// Proyectos del cliente, cada uno con sus postulaciones. El backend no manda cuántas postulaciones tiene
// un proyecto, así que se piden las de cada proyecto al mismo tiempo. Un cliente tiene pocos proyectos.
// Si fallan las postulaciones de un proyecto, ese proyecto queda con applications: null y la página sigue.
export function useProjectsWithApplications({ size = 50 } = {}) {
  return useAsync(
    async (options) => {
      const page = await projectService.getMine({ page: 1, size }, options)
      const applications = await Promise.all(
        page.content.map((project) => applicationService.getByProject(project.id, options).catch(() => null)),
      )
      return page.content.map((project, index) => ({ ...project, applications: applications[index] }))
    },
    [size],
  )
}
