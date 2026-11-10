// Campo de las páginas de Ingresar y Crear cuenta: etiqueta arriba, caja de 49 px y un espacio opcional a la derecha
// (trailing) para un botón como "mostrar contraseña". El error aparece debajo con el ícono de "!".
export default function AuthField({ label, name, error, trailing, ...inputProps }) {
  const errorId = error ? `${name}-error` : undefined
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-xs font-medium">
        {label}
      </label>
      <div
        className={`flex h-[49px] items-center overflow-hidden rounded-[10px] border bg-white transition focus-within:ring-[3px] ${
          error ? 'border-error focus-within:ring-error/10' : 'border-[#cbc7be] focus-within:border-ink focus-within:ring-ink/5'
        }`}
      >
        <input
          id={name}
          name={name}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          className="h-full min-w-0 flex-1 bg-transparent px-3.5 text-sm outline-none placeholder:text-[#9e9b94]"
          {...inputProps}
        />
        {trailing}
      </div>
      {error && (
        <span id={errorId} className="flex items-center gap-1.5 text-xs text-error">
          <span aria-hidden="true" className="grid h-4 w-4 place-items-center rounded-full border border-error text-[10px] font-bold">
            !
          </span>
          {error}
        </span>
      )}
    </div>
  )
}
