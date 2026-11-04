import Badge from '../ui/Badge'
import { STATUS_LABELS } from '../../utils/format'

const STATUS_COLORS = {
  OPEN: 'green',
  IN_PROGRESS: 'yellow',
  DONE: 'gray',
}

export default function ProjectStatusBadge({ status }) {
  return <Badge color={STATUS_COLORS[status] ?? 'gray'}>{STATUS_LABELS[status] ?? status}</Badge>
}
