import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Home() {
  const { user, logout } = useAuth()

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hola, {user.nombre ?? user.email}</h1>
          <p className="mt-1 text-gray-500">
            {user.rol === 'CLIENT' ? 'Cuenta de cliente' : user.rol === 'FREELANCER' ? 'Cuenta de freelancer' : 'Administrador'}
          </p>
        </div>
        <button
          onClick={logout}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cerrar sesión
        </button>
      </div>
      <div className="mt-8 flex flex-wrap gap-6">
        <Link to="/projects" className="font-semibold text-indigo-600 hover:underline">
          Explorar proyectos →
        </Link>
        {user.rol === 'FREELANCER' && (
          <>
            <Link to="/profile/edit" className="font-semibold text-indigo-600 hover:underline">
              Editar mi perfil →
            </Link>
            {user.id && (
              <Link to={`/freelancers/${user.id}`} className="font-semibold text-indigo-600 hover:underline">
                Ver mi perfil público →
              </Link>
            )}
          </>
        )}
      </div>
    </main>
  )
}
