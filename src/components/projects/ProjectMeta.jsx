// Datos clave del proyecto: presupuesto, fecha límite y los extras que se pasen
export default function ProjectMeta({ items }) {
  return (
    <dl className="flex flex-wrap gap-x-6 gap-y-2">
      {items.map(({ label, value }) => (
        <div key={label}>
          <dt className="text-xs text-gray-500">{label}</dt>
          <dd className="font-semibold text-gray-900">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
