// Fila de filtros tipo píldora. La opción elegida queda en negro y cada una puede mostrar cuántos hay.
export default function FilterChips({ options, value, onChange, label }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-xs font-medium transition-colors duration-200 ${
              active ? 'border-ink bg-ink text-white' : 'border-line bg-surface text-ink hover:border-[#aaa69d]'
            }`}
          >
            {option.label}
            {option.count !== undefined && (
              <span className={`tabular-nums ${active ? 'text-white/60' : 'text-muted'}`}>{option.count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
