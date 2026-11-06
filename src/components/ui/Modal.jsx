import { useEffect, useRef } from 'react'

//Ventana que aparece encima de la página. Usa <dialog>, que ya maneja la tecla Esc y el foco.
export default function Modal({ open, title, onClose, children }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      className="m-auto w-[calc(100%_-_2rem)] max-w-md rounded-[18px] p-8 text-ink shadow-[0_30px_80px_rgba(0,0,0,0.25)] backdrop:bg-ink/55"
    >
      <h2 className="text-[26px] font-semibold tracking-tight text-ink">{title}</h2>
      <div className="mt-3">{children}</div>
    </dialog>
  )
}