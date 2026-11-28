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
