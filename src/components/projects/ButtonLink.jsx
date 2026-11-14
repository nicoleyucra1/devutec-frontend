import { Link } from 'react-router-dom'
import { buttonClass } from '../ui/buttonClass'
import PropTypes from 'prop-types'
import { linkTo } from '../../utils/propShapes'

// Link con el mismo aspecto que el Button del kit, para acciones que navegan a otra página
export default function ButtonLink({ to, state, variant = 'primary', className = '', children }) {
  return (
    <Link to={to} state={state} className={buttonClass(variant, className)}>
      {children}
    </Link>
  )
}

ButtonLink.propTypes = {
  to: linkTo.isRequired,
  state: PropTypes.object,
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'danger', 'lime', 'inverse']),
  className: PropTypes.string,
  children: PropTypes.node,
}
