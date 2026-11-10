// Buscador chico con lupa para filtrar una lista que ya está en pantalla
export default function SearchField({ value, onChange, placeholder, label, className = '' }) {
  return (
    <label
      className={`flex h-10 items-center gap-2 rounded-[10px] border border-line bg-surface px-3 text-muted transition-colors focus-within:border-ink ${className}`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="w-full min-w-0 bg-transparent text-xs text-ink outline-none placeholder:text-muted"
      />
    </label>
  )
}
