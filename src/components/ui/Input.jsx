// Campo de formulario con su etiqueta y el mensaje de error debajo
export default function Input({ label, name, error, ...inputProps }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input
        name={name}
        aria-invalid={Boolean(error)}
        className={`mt-1 block w-full rounded-lg border px-3 py-2 text-gray-900 outline-none focus:ring-2 ${
          error ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-200'
        }`}
        {...inputProps}
      />
      {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
    </label>
  )
}
