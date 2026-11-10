import { useState } from 'react'
import Button from './Button'
import Modal from './Modal'

// Botón "Contactar soporte" de los estados de error. El equipo todavía está definiendo el canal de soporte;
// cuando exista (correo, WhatsApp o formulario), se cambia solo aquí y todas las pantallas lo usan.
export default function SupportButton({ variant = 'ghost', className = '' }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)} className={className}>
        Contactar soporte
      </Button>
      <Modal open={open} title="Soporte en preparación" kicker="SOPORTE" onClose={() => setOpen(false)}>
        <p className="text-sm leading-relaxed text-muted">
          Todavía estamos armando el canal de soporte. Mientras tanto, vuelve a intentarlo en unos minutos: tus pagos en
          garantía siguen protegidos y ningún pago se mueve sin una confirmación.
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
