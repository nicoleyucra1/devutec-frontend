import { useId, useState } from 'react'
import PropTypes from 'prop-types'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { useToast } from '../../hooks/useToast'
import { errorMessage } from '../../utils/errorMessage'
import { REPORT_REASONS, reportService } from '../../services/reportService'

function FlagIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 21V4M5 4h11l-2 4 2 4H5" />
    </svg>
  )
}

// Botón "Reportar" con su ventana. Sirve para el contrato (contractId) o la postulación (applicationId).
// Quien más lo usa es el estudiante: si cobra por fuera pierde la garantía de pago y la reseña.
export default function ReportButton({ contractId, applicationId, personName, className = '' }) {
  const id = useId()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('PAGO_POR_FUERA')
  const [detail, setDetail] = useState('')
  const [sending, setSending] = useState(false)
  const firstName = personName?.split(' ')[0] ?? 'esta persona'

  const close = () => {
    if (!sending) setOpen(false)
  }

  const submit = async (event) => {
    event.preventDefault()
    setSending(true)
    try {
      await reportService.create({ contractId, applicationId, reason, detail: detail.trim() || undefined })
      toast.success('Gracias por avisarnos. El equipo de DEVUTEC lo va a revisar.')
      setOpen(false)
      setDetail('')
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 text-xs text-muted underline-offset-2 hover:text-error hover:underline ${className}`}
      >
        <FlagIcon />
        Reportar a {firstName}
      </button>

      <Modal open={open} onClose={close} title={`Reportar a ${firstName}`} kicker="REPORTE" icon={<FlagIcon />} iconTone="red">
        <form onSubmit={submit} className="grid gap-4">
          <p className="text-sm text-muted">
            Los pagos y los acuerdos se hacen solo dentro de DEVUTEC: así tu dinero queda en garantía. Cuéntanos qué pasó y el
            equipo de DEVUTEC lo revisa.
          </p>
          <fieldset className="grid gap-2">
            <legend className="mb-1 text-xs font-semibold">Motivo</legend>
            {Object.entries(REPORT_REASONS).map(([value, label]) => (
              <label key={value} className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-line px-3 py-2.5 text-sm has-[:checked]:border-ink">
                <input type="radio" name={`${id}-reason`} value={value} checked={reason === value} onChange={() => setReason(value)} />
                {label}
              </label>
            ))}
          </fieldset>
          <label className="grid gap-1.5 text-xs font-semibold" htmlFor={`${id}-detail`}>
            Detalle (opcional)
            <textarea
              id={`${id}-detail`}
              value={detail}
              onChange={(event) => setDetail(event.target.value)}
              maxLength={1000}
              rows={3}
              className="rounded-xl border border-line bg-surface px-3 py-2 text-sm font-normal"
              placeholder="Por ejemplo: me escribió que le pague por Yape para no pagar la comisión"
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={close} disabled={sending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={sending}>
              {sending ? 'Enviando…' : 'Enviar reporte'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}

ReportButton.propTypes = {
  contractId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  applicationId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  personName: PropTypes.string,
  className: PropTypes.string,
}
