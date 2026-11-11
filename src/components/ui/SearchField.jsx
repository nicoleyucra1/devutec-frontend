import { useEffect, useRef, useState } from 'react'

// Buscador chico con lupa para filtrar una lista que ya está en pantalla.
// Lo escrito se guarda aquí y se avisa a la página cuando la persona deja de escribir: la búsqueda vive en la URL,
// que se actualiza un instante después, y sin esto se perdían letras al escribir rápido.
export default function SearchField({ value, onChange, placeholder, label, className = '', delay = 250 }) {
  const [text, setText] = useState(value)
  const [lastValue, setLastValue] = useState(value)
  const timer = useRef(null)

  // Si la página cambia la búsqueda por su cuenta (por ejemplo "Borrar búsqueda"), el campo la sigue
  if (value !== lastValue) {
    setLastValue(value)
    setText(value)
  }

  useEffect(() => () => clearTimeout(timer.current), [])

  const handleChange = (event) => {
    const next = event.target.value
    setText(next)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => onChange(next), delay)
  }

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
        value={text}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={label}
        className="w-full min-w-0 bg-transparent text-xs text-ink outline-none placeholder:text-muted"
      />
    </label>
  )
}
