import ButtonLink from '../components/projects/ButtonLink'
import { useAuth } from '../hooks/useAuth'
import AdminDashboard from './dashboard/AdminDashboard'
import ClientDashboard from './dashboard/ClientDashboard'
import FreelancerDashboard from './dashboard/FreelancerDashboard'

const ROLE_LABELS = {
  ADMIN: 'Administrador',
}

export default function Home() {
  const { user } = useAuth()

  // El cliente y el freelancer tienen su propio resumen con el diseño nuevo, a pantalla completa
  if (user.rol === 'CLIENT') return <ClientDashboard />
  if (user.rol === 'FREELANCER') return <FreelancerDashboard />

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      {/* Cerrar sesión está en la barra de navegación */}
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Hola, {user.nombre ?? user.email}</h1>
        <p className="mt-1 text-gray-500">{ROLE_LABELS[user.rol] ?? user.rol}</p>
      </header>

      <div className="mt-6 mb-8 flex flex-wrap gap-2">
        <ButtonLink to="/projects" variant="secondary">
          Ver proyectos
        </ButtonLink>
      </div>

      {user.rol === 'ADMIN' && <AdminDashboard />}
    </main>
  )
}
