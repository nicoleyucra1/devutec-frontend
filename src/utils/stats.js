// Cálculos para los resúmenes del dashboard.
// Los contratos, postulaciones y pagos llegan como listas completas, así que se cuentan aquí.

// Cuántos elementos hay de cada valor: countBy(contratos, 'status') → { IN_PROGRESS: 2, DELIVERED: 1 }
export function countBy(items = [], field) {
  return items.reduce((counts, item) => {
    counts[item[field]] = (counts[item[field]] ?? 0) + 1
    return counts
  }, {})
}

// Suma un monto de los elementos que cumplen la condición; los montos llegan como número o texto
export function sumBy(items = [], field, condition = () => true) {
  return items.filter(condition).reduce((total, item) => total + (Number(item[field]) || 0), 0)
}

// Los más recientes primero, según un campo de fecha ("2026-11-04T10:00:00")
export function latest(items = [], field, limit = 5) {
  return [...items].sort((a, b) => String(b[field] ?? '').localeCompare(String(a[field] ?? ''))).slice(0, limit)
}
