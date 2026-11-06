import { paymentService } from '../services/paymentService'
import { useAsync } from './useAsync'

export function usePayments() {
  return useAsync((options) => paymentService.getAll(options), [])
}
