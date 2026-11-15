import Badge from '../ui/Badge'
import { STATUS_LABELS } from '../../utils/format'
import PropTypes from 'prop-types'

const STATUS_COLORS = {
  OPEN: 'green',
  IN_PROGRESS: 'blue',
  DONE: 'gray',
}

export default function ProjectStatusBadge({ status }) {
  return <Badge color={STATUS_COLORS[status] ?? 'gray'}>{STATUS_LABELS[status] ?? status}</Badge>
}

ProjectStatusBadge.propTypes = {
  status: PropTypes.string,
}
