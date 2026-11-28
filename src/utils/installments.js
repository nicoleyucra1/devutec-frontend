// Pago en dos partes: cuánto pagó ya el cliente y si todavía falta el pago 1.
// Sin cuotas (contratos antiguos con un solo pago) todo sigue como antes.
export const planOf = (contract) => contract?.installments ?? []

export const hasPlan = (contract) => planOf(contract).length > 0

// Suma de lo que el cliente ya pagó (cuotas en garantía, liberadas o devueltas)
export const paidByClient = (contract) =>
  planOf(contract)
    .filter((installment) => installment.status !== 'PENDING')
    .reduce((total, installment) => total + Number(installment.clientAmount ?? 0), 0)

// Con plan: true mientras el cliente todavía no hizo ningún pago
export const nothingPaidYet = (contract) => hasPlan(contract) && paidByClient(contract) === 0

// Pago 2 con plazo: si el cliente no paga hasta esta fecha, el contrato se cierra solo (lo manda el backend)
export const secondPaymentDue = (contract) => contract?.secondPaymentDueAt ?? null

// El contrato se cerró porque el cliente no hizo el pago 2 a tiempo
export const CLOSED_FOR_NON_PAYMENT = 'PAGO_2_NO_REALIZADO'
export const closedForNonPayment = (contract) => contract?.closedReason === CLOSED_FOR_NON_PAYMENT

const sum = (contract, field) =>
  planOf(contract).reduce((total, installment) => total + Number(installment[field] ?? 0), 0)

// Lo que recibió el estudiante (etapas aprobadas + bolsa), lo devuelto al cliente y la bolsa de emergencia
export const studentReceived = (contract) => sum(contract, 'releasedAmount')
export const refundedToClient = (contract) => sum(contract, 'refundedAmount')
export const emergencyFundForStudent = (contract) => sum(contract, 'reserveAmount')

// "antes de hoy a las 18:30", "antes de mañana a las 09:00" o "antes del 5 de diciembre a las 18:30"
export function beforeDue(value) {
  if (!value) return ''
  const date = new Date(value)
  const time = date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false })
  const today = new Date()
  const startOf = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const days = Math.round((startOf(date) - startOf(today)) / 86_400_000)
  if (days === 0) return `antes de hoy a las ${time}`
  if (days === 1) return `antes de mañana a las ${time}`
  const day = date.toLocaleDateString('es-PE', { day: 'numeric', month: 'long' })
  return `antes del ${day} a las ${time}`
}
