import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import PublicHeader from '../components/layout/PublicHeader'
import ButtonLink from '../components/projects/ButtonLink'
import ErrorState from '../components/ui/ErrorState'
import { ERROR_ICONS } from '../components/ui/errorIcons'
import { useAuth } from '../hooks/useAuth'
import { sessionExpiry } from '../utils/sessionExpiry'

// Estado 401 del diseño: la sesión venció y el refresh token ya no sirve. Explica qué pasó y lleva al login,
// que después vuelve a la página donde estaba la persona.
export default function SessionExpired() {
  const { user } = useAuth()
  const location = useLocation()
  const from = location.state?.from

  // Ya se mostró el aviso: la próxima vez que falte la sesión se va directo al login
  useEffect(() => sessionExpiry.clear(), [])

  if (user) return <Navigate to={from?.pathname ?? '/'} replace />

  return (
    <>
      <PublicHeader />
      <main className="mx-auto w-full max-w-[1200px] px-5">
        <ErrorState
          status={401}
          actions={
            <>
              <ButtonLink to="/login" state={{ from }}>
                {ERROR_ICONS.login}
                Ingresar de nuevo
              </ButtonLink>
              <ButtonLink to="/" variant="secondary">
                {ERROR_ICONS.home}
                Ir al inicio
              </ButtonLink>
            </>
          }
        />
      </main>
    </>
  )
}
