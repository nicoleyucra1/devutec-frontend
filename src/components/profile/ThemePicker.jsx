import { useId } from 'react'
import { useTheme } from '../../hooks/useTheme'

const icon = (children) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)

const OPTIONS = [
  {
    value: 'system',
    label: 'Sistema',
    icon: icon(
      <>
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M8 20h8M12 16v4" />
      </>,
    ),
  },
  {
    value: 'light',
    label: 'Claro',
    icon: icon(
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>,
    ),
  },
  { value: 'dark', label: 'Oscuro', icon: icon(<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />) },
]

// Qué hace cada opción, debajo de los botones
function helpText(preference, scheme) {
  if (preference === 'system') return `Sigue la configuración de tu dispositivo. Ahora: ${scheme === 'dark' ? 'oscuro' : 'claro'}.`
  if (preference === 'dark') return 'Siempre oscuro, aunque tu dispositivo esté en claro.'
  return 'Siempre claro, aunque tu dispositivo esté en oscuro.'
}

// Tema de la web en el menú del avatar (diseño "Tema · menú"): Sistema, Claro u Oscuro, con ícono.
// Es un grupo de opciones (radio): con Tab se llega al grupo y con las flechas se cambia.
export default function ThemePicker() {
  const id = useId()
  const { preference, scheme, setPreference } = useTheme()

  return (
    <fieldset aria-describedby={`${id}-ayuda`}>
      <legend className="px-1 text-[10px] font-semibold tracking-[0.13em] text-muted">TEMA</legend>
      <div className="mt-2 grid grid-cols-3 gap-1 rounded-[12px] bg-soft p-1">
        {OPTIONS.map((option) => {
          const active = preference === option.value
          return (
            <label
              key={option.value}
              className={`flex min-h-[54px] cursor-pointer flex-col items-center justify-center gap-1 rounded-[9px] text-xs transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-progress ${
                active ? 'bg-raised font-semibold text-ink shadow-[0_1px_3px_rgba(0,0,0,0.12)]' : 'text-muted hover:text-ink'
              }`}
            >
              <input
                type="radio"
                name={`${id}-tema`}
                value={option.value}
                checked={active}
                onChange={() => setPreference(option.value)}
                className="sr-only"
              />
              {option.icon}
              {option.label}
            </label>
          )
        })}
      </div>
      <p id={`${id}-ayuda`} aria-live="polite" className="mt-2 px-1 text-[11px] leading-snug text-muted">
        {helpText(preference, scheme)}
      </p>
    </fieldset>
  )
}
