import ButtonLink from '../components/projects/ButtonLink'
import { useAuth } from '../hooks/useAuth'
import AdminDashboard from './dashboard/AdminDashboard'
import ClientDashboard from './dashboard/ClientDashboard'
import FreelancerDashboard from './dashboard/FreelancerDashboard'

const ROLE_LABELS = {
  FREELANCER: 'Cuenta de freelancer',
  ADMIN: 'Administrador',
}

// Accesos rápidos que cambian según el rol
function QuickActions({ user }) {
  if (user.rol === 'FREELANCER') {
    return (
      <>
        <ButtonLink to="/projects">Explorar proyectos</ButtonLink>
        <ButtonLink to="/profile/edit" variant="secondary">Editar mi perfil</ButtonLink>
        {user.id && (
          <ButtonLink to={`/freelancers/${user.id}`} variant="secondary">Ver mi perfil público</ButtonLink>
        )}
      </>
    )
  }
  return <ButtonLink to="/projects" variant="secondary">Ver proyectos</ButtonLink>
}

export default function Home() {
  const { user } = useAuth()

  // El cliente tiene su propio resumen con el diseño nuevo, a pantalla completa
  if (user.rol === 'CLIENT') return <ClientDashboard />

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      {/* Cerrar sesión está en la barra de navegación */}
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Hola, {user.nombre ?? user.email}</h1>
        <p className="mt-1 text-gray-500">{ROLE_LABELS[user.rol] ?? user.rol}</p>
      </header>

      <div className="mt-6 mb-8 flex flex-wrap gap-2">
        <QuickActions user={user} />
      </div>

      {user.rol === 'FREELANCER' && <FreelancerDashboard />}
      {user.rol === 'ADMIN' && <AdminDashboard />}
    </main>
  )
}
