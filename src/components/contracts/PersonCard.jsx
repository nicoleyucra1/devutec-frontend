import { Link } from 'react-router-dom'
import Avatar from '../ui/Avatar'

// Tarjeta de una de las partes del contrato. Si tiene perfil público, el nombre lleva a él.
export default function PersonCard({ role, name, isYou, to }) {
  return (
    <div className="flex items-center gap-3.5 rounded-2xl border border-line bg-surface p-4">
      <Avatar name={name} size="lg" />
      <div className="min-w-0">
        <span className="text-[10px] font-semibold tracking-[0.12em] text-muted">
          {role}
          {isYou && ' · TÚ'}
        </span>
        {to ? (
          <Link to={to} className="block truncate text-sm font-semibold hover:underline">
            {name}
          </Link>
        ) : (
          <strong className="block truncate text-sm font-semibold">{name}</strong>
        )}
      </div>
    </div>
  )
}
