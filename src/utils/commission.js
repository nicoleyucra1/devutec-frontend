// Comisión de DEVUTEC: la paga el cliente. El presupuesto que escribe el cliente YA la incluye:
// con S/ 880 y 10 %, el estudiante recibe S/ 800 y DEVUTEC S/ 80. Misma cuenta que CommissionCalculator del backend.
export const DEFAULT_COMMISSION_RATE = 0.1

const round = (value) => Math.round(value * 100) / 100

export function splitClientTotal(total, rate = DEFAULT_COMMISSION_RATE) {
  const clientTotal = Number(total) || 0
  const freelancerAmount = round(clientTotal / (1 + rate))
  return { clientTotal: round(clientTotal), freelancerAmount, commission: round(clientTotal - freelancerAmount), rate }
}

// "10 %" para mostrar la tasa
export const formatRate = (rate = DEFAULT_COMMISSION_RATE) => `${Math.round(rate * 100)} %`
