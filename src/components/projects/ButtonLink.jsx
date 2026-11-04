import { Link } from 'react-router-dom'

// Link con el mismo aspecto que el Button del kit, para acciones que navegan a otra página
const variants = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700',
  secondary: 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50',
}

export default function ButtonLink({ to, variant = 'primary', className = '', children }) {
  return (
    <Link
      to={to}
      className={`inline-block rounded-lg px-4 py-2 text-sm font-medium transition-colors ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  )
}
