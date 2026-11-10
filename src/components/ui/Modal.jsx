import { useEffect, useRef } from 'react'

const ICON_TONES = {
  green: 'bg-escrow-light text-escrow',
  red: 'bg-error-light text-error',
  ink: 'bg-paper text-ink',
}

//Ventana que aparece encima de la página. Usa <dialog>, que ya maneja la tecla Esc y el foco.
//icon y kicker son opcionales: el ícono va en un círculo y el kicker es el texto chico sobre el título.
export default function Modal({ open, title, onClose, children, icon, iconTone = 'green', kicker }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const handleCancel = (event) => {
    // Esc no cierra el <dialog> por su cuenta: lo decide onClose (por ejemplo, no mientras se guarda)
    event.preventDefault()
    onClose?.()
  }

  return (
    <dialog
      ref={ref}
      onCancel={handleCancel}
      className="m-auto w-[calc(100%_-_2rem)] max-w-md rounded-[18px] p-8 text-ink shadow-[0_30px_80px_rgba(0,0,0,0.25)] backdrop:bg-ink/55"
    >
      {icon && (
        <span aria-hidden="true" className={`mb-5 grid h-12 w-12 place-items-center rounded-full ${ICON_TONES[iconTone] ?? ICON_TONES.green}`}>
          {icon}
        </span>
      )}
      {kicker && <p className="mb-2 text-[10px] font-semibold tracking-[0.13em] text-muted">{kicker}</p>}
      <h2 className="text-[26px] font-semibold tracking-tight text-ink">{title}</h2>
      <div className="mt-3">{children}</div>
    </dialog>
  )
}
