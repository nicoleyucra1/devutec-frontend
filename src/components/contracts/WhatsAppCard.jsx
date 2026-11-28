import PhoneEditor from '../profile/PhoneEditor'
import { useAuth } from '../../hooks/useAuth'
import { whatsappLink } from '../../utils/phone'
import { buttonClass } from '../ui/buttonClass'
import PropTypes from 'prop-types'
import { contractShape } from '../../utils/propShapes'
import ReportButton from '../reports/ReportButton'

function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 20.5l1.6-5.4A8.4 8.4 0 1 1 21 11.5Z" />
      <path d="M8.5 10h7M8.5 13.5h4.5" />
    </svg>
  )
}

// Contacto por WhatsApp entre las dos personas del contrato. Los celulares solo llegan aquí y recién cuando el pago
// está en garantía (lo que protege DEVUTEC es el pago, no el dato). No llegan en contratos cancelados.
// Si la otra persona no agregó su celular se avisa; si eres tú quien no lo agregó, lo puedes agregar aquí mismo.
// Abajo va el botón para reportar si alguien pide pagar o trabajar por fuera.
export default function WhatsAppCard({ contract, isClient }) {
  const { user } = useAuth()
  if (contract.status === 'CANCELLED') return null

  const otherName = (isClient ? contract.freelancerName : contract.clientName) ?? (isClient ? 'el freelancer' : 'el cliente')
  const otherPhone = isClient ? contract.freelancerPhone : contract.clientPhone
  const firstName = otherName.split(' ')[0]
  const message = `Hola ${firstName}, te escribo por el contrato de “${contract.projectTitle}” en DEVUTEC.`

  return (
    <section aria-label="Contacto por WhatsApp" className="rounded-2xl border border-line bg-surface p-5">
      <p className="text-[10px] font-semibold tracking-[0.12em] text-muted">COORDINAR</p>
      {!contract.paidWithCard ? (
        <p className="mt-2 text-sm text-muted">
          El WhatsApp de {firstName} aparece cuando el pago esté en garantía. Así los dos quedan protegidos desde el primer
          mensaje.
        </p>
      ) : otherPhone ? (
        <>
          <p className="mt-2 text-sm">Habla directo con {firstName} para coordinar detalles del trabajo.</p>
          <a
            href={whatsappLink(otherPhone, message)}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass('primary', 'mt-4 w-full')}
          >
            <ChatIcon />
            Escribir por WhatsApp
          </a>
          <p className="mt-3 text-xs text-muted">Los pagos y los cambios de monto se hacen solo en DEVUTEC: fuera de aquí nadie te protege.</p>
        </>
      ) : (
        <p className="mt-2 text-sm text-muted">{firstName} todavía no agregó su celular. Cuando lo haga, aparecerá aquí el botón para escribirle por WhatsApp.</p>
      )}

      {contract.paidWithCard && !user.celular && (
        <div className="mt-5 border-t border-line pt-5">
          <PhoneEditor label="Agrega tu celular" help={`Así ${firstName} también te puede escribir. Solo lo ven las personas de tus contratos.`} />
        </div>
      )}
      <div className="mt-4 border-t border-line pt-3">
        <ReportButton contractId={contract.id} personName={otherName} />
      </div>
    </section>
  )
}

WhatsAppCard.propTypes = {
  contract: contractShape.isRequired,
  isClient: PropTypes.bool,
}
