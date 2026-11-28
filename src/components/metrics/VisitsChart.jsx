import { useState } from 'react'
import PropTypes from 'prop-types'

const DAY = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', timeZone: 'UTC' })
const LONG_DAY = new Intl.DateTimeFormat('es-PE', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })
// Las fechas llegan como "2026-11-28": se leen en UTC para que no se corran un día
const toDate = (value) => new Date(`${value}T00:00:00Z`)

// Visitas por día: una sola serie (verde de DEVUTEC), barras finas con la punta redondeada, eje recesivo y un
// tooltip por barra. Debajo hay una tabla para lectores de pantalla con los mismos datos.
export default function VisitsChart({ daily }) {
  const [hover, setHover] = useState(null)
  const max = Math.max(1, ...daily.map((day) => day.visits))
  // Una línea de guía "redonda" arriba (1, 2, 5, 10, 20, 50…)
  const step = [1, 2, 5].flatMap((n) => [n, n * 10, n * 100, n * 1000]).sort((a, b) => a - b).find((n) => n >= max) ?? max
  const labelEvery = daily.length <= 7 ? 1 : daily.length <= 31 ? 5 : 15
  const active = hover === null ? null : daily[hover]

  return (
    <figure className="relative">
      <div className="flex h-48 gap-3">
        <div className="flex w-7 flex-col justify-between text-right text-[10px] tabular-nums text-muted" aria-hidden="true">
          <span>{step}</span>
          <span>{Math.round(step / 2)}</span>
          <span>0</span>
        </div>
        <div className="relative flex-1 border-b border-line" onMouseLeave={() => setHover(null)}>
          <div className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-line" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed border-line" aria-hidden="true" />
          <div className="absolute inset-0 flex items-end gap-[2px]" aria-hidden="true">
            {daily.map((day, index) => (
              // La zona para pasar el mouse es toda la columna, más grande que la barra
              <div
                key={day.date}
                className="flex h-full min-w-0 flex-1 items-end justify-center"
                onMouseEnter={() => setHover(index)}
              >
                <div
                  className={`w-full max-w-[22px] rounded-t-[4px] transition-opacity ${hover !== null && hover !== index ? 'opacity-50' : ''}`}
                  style={{
                    height: day.visits > 0 ? `${Math.max(2, (day.visits / step) * 100)}%` : '0',
                    background: 'var(--color-escrow)',
                  }}
                />
              </div>
            ))}
          </div>
          {active && (
            <div
              role="status"
              className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-sm"
              style={{ left: `${((hover + 0.5) / daily.length) * 100}%` }}
            >
              <p className="font-semibold capitalize">{LONG_DAY.format(toDate(active.date))}</p>
              <p className="mt-0.5 tabular-nums">
                {active.visits} {active.visits === 1 ? 'visita' : 'visitas'}
                {active.orders > 0 && ` · ${active.orders} ${active.orders === 1 ? 'pedido' : 'pedidos'}`}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="ml-10 mt-2 flex gap-[2px] text-[10px] text-muted" aria-hidden="true">
        {daily.map((day, index) => (
          <span key={day.date} className="min-w-0 flex-1 overflow-visible whitespace-nowrap text-center">
            {index % labelEvery === 0 ? DAY.format(toDate(day.date)) : ''}
          </span>
        ))}
      </div>
      <figcaption className="sr-only">Visitas por día</figcaption>
      <table className="sr-only">
        <thead>
          <tr>
            <th>Día</th>
            <th>Visitas</th>
            <th>Pedidos</th>
          </tr>
        </thead>
        <tbody>
          {daily.map((day) => (
            <tr key={day.date}>
              <td>{LONG_DAY.format(toDate(day.date))}</td>
              <td>{day.visits}</td>
              <td>{day.orders}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}

VisitsChart.propTypes = {
  daily: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      visits: PropTypes.number.isRequired,
      orders: PropTypes.number.isRequired,
    }),
  ).isRequired,
}
