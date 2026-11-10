import Button from '../ui/Button'
import ErrorState from '../ui/ErrorState'
import SupportButton from '../ui/SupportButton'
import { errorVariant } from '../../utils/errorVariant'

// Error al cargar una página o una sección. Con status (el código HTTP que da useAsync) elige la tarjeta del
// diseño que corresponde; children son botones extra que van junto a Reintentar.
export default function ErrorBox({ message, status, onRetry, children, className }) {
  const serverSide = ['500', 'offline'].includes(errorVariant(status))
  return (
    <ErrorState
      status={status}
      message={message}
      className={className}
      actions={
        <>
          {onRetry && <Button onClick={onRetry}>Reintentar</Button>}
          {children}
          {serverSide && <SupportButton />}
        </>
      }
    />
  )
}
