//Texto y color del Badge para los estados del contrato y del pago en garantía, con las palabras del diseño
export const CONTRACT_STATUS = {
  IN_PROGRESS: { label: 'En curso', color: 'blue' },
  DELIVERED: { label: 'Entregado', color: 'yellow' },
  CONFIRMED: { label: 'Confirmado', color: 'green' },
  CANCELLED: { label: 'Cancelado', color: 'red' },
}

export const PAYMENT_STATUS = {
  HELD: { label: 'Retenido', color: 'yellow' },
  RELEASED: { label: 'Liberado', color: 'green' },
  REFUNDED: { label: 'Reembolsado', color: 'gray' },
}

// Códigos cortos para buscar y nombrar: el contrato 42 es #CT-0042, el pago 7 es #PG-0007 y el proyecto 5 es #PR-0005
export const contractCode = (id) => `#CT-${String(id).padStart(4, '0')}`
export const paymentCode = (id) => `#PG-${String(id).padStart(4, '0')}`
export const projectCode = (id) => `#PR-${String(id).padStart(4, '0')}`

// Dos letras del proyecto para el cuadrito de la tabla: "Web para pizzería" → "WP"
export function projectInitials(title) {
  const words = (title ?? '').split(/\s+/).filter((word) => word.length > 2 || /^[A-Z]/.test(word))
  return (words.length ? words : [title ?? '?'])
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}
