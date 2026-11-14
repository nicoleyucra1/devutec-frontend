const money = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' })

export function formatBudget(value) {
  return value === null || value === undefined ? '—' : money.format(value)
}

// "2026-11-10" se lee como fecha local para que no se corra un día por la zona horaria
export function formatDate(value) {
  if (!value) return 'Sin fecha límite'
  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export const STATUS_LABELS = {
  OPEN: 'Abierto',
  IN_PROGRESS: 'En progreso',
  DONE: 'Terminado',
}

// Fecha y hora cercana para avisos: "hoy, 16:20", "ayer, 09:05" o "8 nov 2026, 16:20"
export function formatWhen(value) {
  if (!value) return ''
  const date = new Date(value)
  const time = date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false })
  const days = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86_400_000)
  if (days === 0) return `hoy, ${time}`
  if (days === 1) return `ayer, ${time}`
  return `${formatDate(value)}, ${time}`
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}
