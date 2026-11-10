import Button from '../ui/Button'
import ButtonLink from './ButtonLink'
import ErrorState from '../ui/ErrorState'
import { ERROR_ICONS } from '../ui/errorIcons'
import SupportButton from '../ui/SupportButton'
import { errorVariant } from '../../utils/errorVariant'

// Error al cargar una página o una sección. Con status (el código HTTP que da useAsync) elige la pantalla del
// diseño que corresponde; children son botones extra que van junto a Reintentar. compact es para secciones.
export default function ErrorBox({ message, status, onRetry, children, compact, className }) {
  const variant = errorVariant(status)
  const serverSide = ['500', 'offline'].includes(variant)
  // Reintentar no cambia nada sin sesión, sin permiso o si ya no existe: ahí se ofrece el camino que sí sirve
  const final = ['401', '403', '404'].includes(variant)
  return (
    <ErrorState
      status={status}
      message={message}
      compact={compact}
      className={className}
      actions={
        <>
          {onRetry && !final && (
            <Button onClick={onRetry}>
              {ERROR_ICONS.retry}
              Reintentar
            </Button>
          )}
          {children}
          {final && !children && (
            <ButtonLink to={variant === '401' ? '/login' : '/'}>
              {variant === '401' ? ERROR_ICONS.login : ERROR_ICONS.home}
              {variant === '401' ? 'Ingresar de nuevo' : 'Volver al inicio'}
            </ButtonLink>
          )}
          {serverSide && <SupportButton />}
        </>
      }
    />
  )
}
