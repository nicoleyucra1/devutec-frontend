import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { sessionExpiry } from '../utils/sessionExpiry'

// Protege las rutas hijas. Con roles, además exige que el usuario tenga uno de ellos.
export default function PrivateRoute({ roles }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    // Se guarda la ruta pedida para volver a ella después del login. Si la sesión venció, primero se explica qué pasó.
    return <Navigate to={sessionExpiry.isExpired() ? '/session-expired' : '/login'} replace state={{ from: location }} />
  }
  // Hay sesión de nuevo: si alguna vez venció, ya no hace falta avisarlo
  sessionExpiry.clear()
  if (roles && !roles.includes(user.rol)) {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}
