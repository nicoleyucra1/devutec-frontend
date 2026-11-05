import { Link } from 'react-router-dom'
import Badge from '../ui/Badge'
import Card from '../ui/Card'
import Skeleton from '../ui/Skeleton'

// Lista corta de contratos o postulaciones: título (con link si tiene "to"), detalle a la derecha y un estado
export default function ItemList({ items, loading = false }) {
  if (loading) {
    return (
      <Card className="flex flex-col gap-3">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-5 w-3/5" />
      </Card>
    )
  }

  return (
    <Card className="p-0">
      <ul className="divide-y divide-gray-100">
        {items.map((item) => (
          <li key={item.key} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
            <div className="min-w-0">
              {item.to ? (
                <Link to={item.to} className="font-medium text-gray-900 hover:underline">
                  {item.title}
                </Link>
              ) : (
                <p className="font-medium text-gray-900">{item.title}</p>
              )}
              {item.subtitle && <p className="text-sm text-gray-500">{item.subtitle}</p>}
            </div>
            <div className="flex items-center gap-3">
              {item.detail && <span className="text-sm font-semibold text-gray-900">{item.detail}</span>}
              {item.status && <Badge color={item.statusColor}>{item.status}</Badge>}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}
