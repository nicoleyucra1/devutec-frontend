//Texto y color del Badge para los estados del contrato y del pago en garantía
export const CONTRACT_STATUS = {
  IN_PROGRESS: { label: 'En progreso', color: 'blue' },
  DELIVERED: { label: 'Entregado', color: 'yellow' },
  CONFIRMED: { label: 'Completado', color: 'green' },
  CANCELLED: { label: 'Cancelado', color: 'red' },
}

export const PAYMENT_STATUS = {
  HELD: { label: 'Pago retenido', color: 'yellow' },
  RELEASED: { label: 'Pago liberado', color: 'green' },
  REFUNDED: { label: 'Pago reembolsado', color: 'gray' },
}