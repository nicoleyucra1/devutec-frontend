// Campo de formulario con su etiqueta y el mensaje de error debajo
export default function Input({ label, name, error, ...inputProps }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-ink">{label}</span>
      <input
        name={name}
        aria-invalid={Boolean(error)}
        className={`mt-2 block min-h-12 w-full rounded-[10px] border bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:ring-[3px] ${
          error ? 'border-error focus:ring-error/10' : 'border-gray-300 focus:border-ink focus:ring-ink/5'
        }`}
        {...inputProps}
      />
      {error && (
        <span className="mt-1.5 flex items-center gap-1.5 text-xs text-error">
          <span
            aria-hidden="true"
            className="grid h-4 w-4 place-items-center rounded-full border border-error text-[10px] font-bold"
          >
            !
          </span>
          {error}
        </span>
      )}
    </label>
  )
}
