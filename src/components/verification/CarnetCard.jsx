import { useEffect, useId, useState } from 'react'
import PropTypes from 'prop-types'
import { buttonClass } from '../ui/buttonClass'
import { verificationService } from '../../services/verificationService'
import { errorMessage } from '../../utils/errorMessage'

const STATES = {
  NONE: {
    kicker: 'VERIFICA TU CARNET',
    title: 'Sube una foto de tu carnet universitario',
    text: 'Es la segunda verificación, además de tu correo .edu.pe. Con el carnet aprobado, tu perfil muestra «Carnet verificado» y los clientes confían más en ti.',
    tone: 'border-line bg-surface',
  },
  PENDING: {
    kicker: 'EN REVISIÓN',
    title: 'Recibimos tu carnet',
    text: 'Lo revisamos pronto. Mientras tanto puedes seguir postulando.',
    tone: 'border-pending/40 bg-pending-light',
  },
  APPROVED: {
    kicker: 'VERIFICADO',
    title: '🪪 Tu carnet está verificado',
    text: 'Tu perfil ya muestra la insignia «Carnet verificado».',
    tone: 'border-escrow/40 bg-escrow-light',
  },
  REJECTED: {
    kicker: 'HAY QUE SUBIRLO DE NUEVO',
    title: 'No pudimos aprobar tu carnet',
    text: '',
    tone: 'border-error/40 bg-error-light',
  },
}

// Segunda verificación del estudiante: sube la foto de su carnet universitario y el admin la revisa.
// La foto es privada: solo la ven el estudiante y el admin.
export default function CarnetCard({ className = '' }) {
  const id = useId()
  const [status, setStatus] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    verificationService
      .getMyStatus()
      .then((data) => active && setStatus(data))
      .catch(() => active && setStatus(null))
    return () => {
      active = false
    }
  }, [])

  if (!status) return null
  const key = status.status ?? 'NONE'
  const view = STATES[key]
  const canUpload = key === 'NONE' || key === 'REJECTED'

  const upload = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('La foto puede pesar hasta 5 MB')
      return
    }
    setUploading(true)
    setError(null)
    try {
      setStatus(await verificationService.uploadCarnet(file))
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setUploading(false)
    }
  }

  return (
    <article className={`rounded-2xl border p-6 ${view.tone} ${className}`}>
      <p className="text-[10px] font-semibold tracking-[0.13em] text-muted">{view.kicker}</p>
      <h2 className="mt-2 text-lg font-semibold tracking-tight">{view.title}</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">
        {key === 'REJECTED' ? `Motivo: ${status.rejectReason}. Sube otra foto, nítida y con tus datos visibles.` : view.text}
      </p>
      <p className="mt-3 text-xs text-muted">
        {status.universityEmail ? '🎓 Tu correo universitario ya está verificado.' : 'Tu cuenta no usa un correo .edu.pe.'}
      </p>
      {canUpload && (
        <div className="mt-4">
          {/* capture abre la cámara en el celular; en computadora elige un archivo */}
          {/* El input queda enfocable con el teclado (sr-only); la etiqueta es el botón que se ve */}
          <input
            id={`${id}-file`}
            type="file"
            accept="image/jpeg,image/png"
            capture="environment"
            className="peer sr-only"
            onChange={upload}
            disabled={uploading}
          />
          <label
            htmlFor={`${id}-file`}
            className={buttonClass('lime', `cursor-pointer peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-progress ${uploading ? 'pointer-events-none opacity-70' : ''}`)}
          >
            {uploading ? 'Subiendo…' : key === 'REJECTED' ? 'Subir otra foto' : 'Subir foto del carnet'}
          </label>
          <p className="mt-2 text-[11px] text-muted">JPG o PNG, hasta 5 MB. Solo lo ve el equipo de DEVUTEC.</p>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-2 text-xs text-error">
          {error}
        </p>
      )}
    </article>
  )
}

CarnetCard.propTypes = {
  className: PropTypes.string,
}
