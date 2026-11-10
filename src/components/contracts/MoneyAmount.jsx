import { formatBudget } from '../../utils/format'

// Monto grande del diseño: "S/ 600" en tinta y ".00" en gris
export default function MoneyAmount({ value, className = '' }) {
  const text = formatBudget(value)
  const dot = text.lastIndexOf('.')
  return (
    <p className={`font-semibold tabular-nums tracking-[-0.05em] ${className}`}>
      {dot === -1 ? (
        text
      ) : (
        <>
          {text.slice(0, dot)}
          <span className="text-[#a6a39c]">{text.slice(dot)}</span>
        </>
      )}
    </p>
  )
}
