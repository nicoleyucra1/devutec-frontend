import { useState } from 'react'
import Button from './Button'
import Modal from './Modal'
import { ERROR_ICONS } from './errorIcons'
import PropTypes from 'prop-types'
import { OPEN_CHAT_EVENT } from '../support/CuyiChat'
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from '../support/faq'

// Botón "Contactar soporte" de los estados de error: abre el chat de ayuda con Cuyi. Si el chat no está
// (sin sesión iniciada, o la pantalla de error tapa toda la web), muestra el aviso de abajo.
export default function SupportButton({ variant = 'secondary', className = '' }) {
  const [open, setOpen] = useState(false)

  const handleClick = () => {
    // dispatchEvent devuelve false si el chat recibió el evento y lo abrió
    const chatOpened = !window.dispatchEvent(new CustomEvent(OPEN_CHAT_EVENT, { cancelable: true }))
    if (!chatOpened) setOpen(true)
  }

  return (
    <>
      <Button variant={variant} onClick={handleClick} className={className}>
        {ERROR_ICONS.chat}
        Contactar soporte
      </Button>
      <Modal open={open} title="Ayuda de DEVUTEC" kicker="SOPORTE" onClose={() => setOpen(false)}>
        <p className="text-sm leading-relaxed text-muted">
          Escríbenos a{' '}
          <a href={SUPPORT_MAILTO} className="font-semibold text-ink underline underline-offset-2">
            {SUPPORT_EMAIL}
          </a>{' '}
          contándonos qué pasó, o inicia sesión para chatear con Cuyi, nuestro asistente. Tus pagos en garantía siguen
          protegidos y ningún pago se mueve sin una confirmación.
        </p>
        <div className="mt-6 flex justify-end">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Entendido
          </Button>
        </div>
      </Modal>
    </>
  )
}

SupportButton.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'danger', 'lime', 'inverse']),
  className: PropTypes.string,
}
