import PublicHeader from '../components/layout/PublicHeader'
import ButtonLink from '../components/projects/ButtonLink'
import ErrorState from '../components/ui/ErrorState'
import { ERROR_ICONS } from '../components/ui/errorIcons'
import { useAuth } from '../hooks/useAuth'

// Página 404 del diseño (v2): un "404" gigante con Cuyi confundido dentro del 0, el aviso de que los pagos
// en garantía siguen intactos y dos caminos para volver. Con sesión se ve la navbar; sin sesión, la barra pública.
// Usa la misma pantalla que el resto de los errores (401, 403, 409 y 500).
export default function NotFound() {
  const { user } = useAuth()

  return (
    <>
      {!user && <PublicHeader />}
      <main className="mx-auto w-full max-w-[1200px] px-6">
        <ErrorState
          status={404}
          title={['Esta página nunca', 'se entregó.']}
          text="Puede que el enlace esté roto o que el proyecto ya no exista."
          actions={
            <>
              <ButtonLink to="/">
                {ERROR_ICONS.home}
                Volver al inicio
              </ButtonLink>
              <ButtonLink to="/projects" variant="secondary">
                {ERROR_ICONS.search}
                Explorar proyectos
              </ButtonLink>
            </>
          }
        />
      </main>
    </>
  )
}
