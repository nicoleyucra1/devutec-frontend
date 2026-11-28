import { reportService } from '../services/reportService'
import { useAsync } from './useAsync'

export function useReports() {
  return useAsync((options) => reportService.getAll(options), [])
}
