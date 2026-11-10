// Botón del ojo para mostrar u ocultar la contraseña; va dentro de AuthField como trailing
export default function PasswordToggle({ shown, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={shown ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      aria-pressed={shown}
      className="grid h-full w-12 flex-none place-items-center text-muted transition-colors hover:text-ink"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="2.5" />
        {shown && <path d="m4 4 16 16" />}
      </svg>
    </button>
  )
}
