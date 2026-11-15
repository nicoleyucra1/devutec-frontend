import Card from '../ui/Card'
import Skeleton from '../ui/Skeleton'
import PropTypes from 'prop-types'

// Un número destacado del dashboard, por ejemplo "Contratos en curso: 2"
export default function StatCard({ label, value, hint, loading = false }) {
  return (
    <Card>
      <p className="text-sm text-gray-500">{label}</p>
      {loading ? (
        <Skeleton className="mt-2 h-8 w-20" />
      ) : (
        <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      )}
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </Card>
  )
}

StatCard.propTypes = {
  label: PropTypes.node.isRequired,
  value: PropTypes.node,
  hint: PropTypes.node,
  loading: PropTypes.bool,
}
