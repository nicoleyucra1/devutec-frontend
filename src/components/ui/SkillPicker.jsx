import { useId, useRef, useState } from 'react'

// Las que se sugieren antes de escribir, si existen en el catálogo
const POPULAR = ['React', 'JavaScript', 'Python', 'Java', 'Figma', 'Diseño UX/UI', 'WordPress', 'Excel']
const MAX_SUGGESTIONS = 8

// "Diseño" y "diseno" cuentan igual al buscar
const normalize = (text) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

// Resalta en negrita la parte que coincide con lo escrito: "Rea" en "React"
function Highlight({ text, query }) {
  const start = normalize(text).indexOf(normalize(query))
  if (!query || start === -1) return text
  return (
    <>
      {text.slice(0, start)}
      <strong className="font-semibold">{text.slice(start, start + query.length)}</strong>
      {text.slice(start + query.length)}
    </>
  )
}

// Selector de habilidades como en las plataformas de freelance: se escribe, se elige de las sugerencias y cada
// habilidad elegida queda como un chip con ×. Con el teclado: flechas para moverse, Enter para elegir, Esc para
// cerrar y Borrar (con el campo vacío) para quitar la última.
// value es una lista de ids; onChange recibe la lista nueva.
export default function SkillPicker({ skills = [], value = [], onChange, label = 'Habilidades', placeholder = 'Busca React, Figma, Excel…' }) {
  const id = useId()
  const inputRef = useRef(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)

  const selectedIds = value.map(String)
  const selected = selectedIds.map((skillId) => skills.find((skill) => String(skill.id) === skillId)).filter(Boolean)
  const available = skills.filter((skill) => !selectedIds.includes(String(skill.id)))

  const q = query.trim()
  const suggestions = q
    ? available
        .filter((skill) => normalize(skill.name).includes(normalize(q)))
        // Primero las que empiezan con lo escrito
        .sort((a, b) => normalize(b.name).startsWith(normalize(q)) - normalize(a.name).startsWith(normalize(q)))
        .slice(0, MAX_SUGGESTIONS)
    : POPULAR.map((name) => available.find((skill) => skill.name === name)).filter(Boolean)
  const showList = open && suggestions.length > 0
  const highlighted = Math.min(active, suggestions.length - 1)

  const add = (skill) => {
    onChange([...selectedIds, String(skill.id)])
    setQuery('')
    setActive(0)
    inputRef.current?.focus()
  }
  const remove = (skillId) => {
    onChange(selectedIds.filter((item) => item !== String(skillId)))
    inputRef.current?.focus()
  }

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      setActive((current) => Math.min(current + 1, suggestions.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((current) => Math.max(current - 1, 0))
    } else if (event.key === 'Enter') {
      if (showList) {
        event.preventDefault()
        add(suggestions[highlighted])
      }
    } else if (event.key === 'Escape') {
      setOpen(false)
    } else if (event.key === 'Backspace' && !query && selected.length > 0) {
      remove(selected[selected.length - 1].id)
    }
  }

  return (
    <div className="relative">
      <label htmlFor={`${id}-input`} className="text-xs font-medium text-ink">
        {label}
      </label>
      <div
        onClick={() => inputRef.current?.focus()}
        className="mt-2 flex min-h-12 w-full cursor-text flex-wrap items-center gap-1.5 rounded-[10px] border border-gray-300 bg-white px-2.5 py-2 transition focus-within:border-ink focus-within:ring-[3px] focus-within:ring-ink/5"
      >
        {selected.map((skill) => (
          <span key={skill.id} className="inline-flex items-center gap-1 rounded-[7px] border border-escrow bg-escrow-light py-1 pl-2.5 pr-1 text-xs font-semibold text-escrow">
            {skill.name}
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                remove(skill.id)
              }}
              aria-label={`Quitar ${skill.name}`}
              className="grid h-5 w-5 cursor-pointer place-items-center rounded-[5px] transition-colors hover:bg-escrow hover:text-white"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          id={`${id}-input`}
          role="combobox"
          aria-expanded={showList}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={showList ? `${id}-option-${highlighted}` : undefined}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setActive(0)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={handleKeyDown}
          placeholder={selected.length ? 'Agregar otra…' : placeholder}
          autoComplete="off"
          className="min-w-[120px] flex-1 bg-transparent px-1 py-1 text-sm text-ink outline-none placeholder:text-muted"
          // El foco se marca en el recuadro de afuera; la regla global de :focus-visible le ganaría a una clase
          style={{ outline: 'none' }}
        />
      </div>

      {showList && (
        <ul
          id={`${id}-list`}
          role="listbox"
          aria-label={q ? 'Sugerencias' : 'Habilidades populares'}
          className="absolute left-0 right-0 z-20 mt-1.5 max-h-72 overflow-auto rounded-xl border border-line bg-surface p-1.5 shadow-[0_16px_45px_rgba(0,0,0,0.12)]"
        >
          {!q && <li className="px-2.5 pb-1 pt-1.5 text-[10px] font-semibold tracking-[0.12em] text-muted">POPULARES</li>}
          {suggestions.map((skill, index) => (
            <li
              key={skill.id}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={index === highlighted}
              // mousedown en vez de click: así el input no pierde el foco antes de elegir
              onMouseDown={(event) => {
                event.preventDefault()
                add(skill)
              }}
              onMouseEnter={() => setActive(index)}
              className={`flex cursor-pointer items-center justify-between rounded-[7px] px-2.5 py-2 text-sm ${
                index === highlighted ? 'bg-paper' : ''
              }`}
            >
              <span>
                <Highlight text={skill.name} query={q} />
              </span>
              {index === highlighted && <span className="text-[11px] text-muted">Enter ↵</span>}
            </li>
          ))}
        </ul>
      )}
      {open && q && suggestions.length === 0 && (
        <p role="status" className="absolute left-0 right-0 z-20 mt-1.5 rounded-xl border border-line bg-surface px-4 py-3 text-sm text-muted shadow-[0_16px_45px_rgba(0,0,0,0.12)]">
          No hay una habilidad que se llame “{q}”.
        </p>
      )}
    </div>
  )
}
