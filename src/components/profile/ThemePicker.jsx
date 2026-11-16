import { useTheme } from '../../hooks/useTheme'

const OPTIONS = [
  { value: 'system', label: 'Sistema' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
]

// Elegir el modo de la web, como en el Perfil de la app: Sistema (sigue al computador o celular), Claro u Oscuro
export default function ThemePicker() {
  const { preference, setPreference } = useTheme()

  return (
    <fieldset>
      <legend className="font-semibold">Apariencia</legend>
      <p className="text-sm text-muted">Elige cómo quieres ver DevUTEC en este navegador.</p>
      <div className="mt-3 grid grid-cols-3 gap-1 rounded-[12px] bg-soft p-1">
        {OPTIONS.map((option) => {
          const active = preference === option.value
          return (
            <label
              key={option.value}
              className={`flex min-h-10 cursor-pointer items-center justify-center rounded-[9px] text-sm font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-progress ${
                active ? 'bg-surface text-ink shadow-[0_1px_3px_rgba(0,0,0,0.12)]' : 'text-muted hover:text-ink'
              }`}
            >
              <input
                type="radio"
                name="tema"
                value={option.value}
                checked={active}
                onChange={() => setPreference(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
