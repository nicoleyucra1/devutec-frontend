import { Link } from 'react-router-dom'
import { buttonClass } from '../ui/buttonClass'

// Link con el mismo aspecto que el Button del kit, para acciones que navegan a otra página
export default function ButtonLink({ to, variant = 'primary', className = '', children }) {
  return (
    <Link to={to} className={buttonClass(variant, className)}>
      {children}
    </Link>
  )
}
