import PropTypes from 'prop-types'
import { contractShape } from '../../utils/propShapes'
import ReportButton from '../reports/ReportButton'

// Reemplaza a la tarjeta de WhatsApp: DEVUTEC no comparte celulares entre cliente y estudiante.
// Todo se coordina dentro del contrato (entregas, pedidos de cambios y la traductora), así el pago queda protegido.
// Abajo va el botón para reportar si la otra persona pide hablar o pagar por fuera.
export default function CoordinateCard({ contract, isClient }) {
  if (contract.status === 'CANCELLED') return null
  const otherName = (isClient ? contract.freelancerName : contract.clientName) ?? (isClient ? 'el estudiante' : 'el cliente')

  return (
    <section aria-label="Cómo coordinar" className="rounded-2xl border border-line bg-surface p-5">
      <p className="text-[10px] font-semibold tracking-[0.12em] text-muted">COORDINAR</p>
      <p className="mt-2 text-sm">
        Todo se coordina aquí: entregas, pedidos de cambios y la traductora. DEVUTEC no comparte celulares para que tu pago siga
        protegido por la garantía.
      </p>
      <p className="mt-2 text-xs text-muted">Los pagos y los cambios de monto se hacen solo en DEVUTEC: fuera de aquí nadie te protege.</p>
      <div className="mt-4 border-t border-line pt-3">
        <ReportButton contractId={contract.id} personName={otherName} />
      </div>
    </section>
  )
}

CoordinateCard.propTypes = {
  contract: contractShape.isRequired,
  isClient: PropTypes.bool,
}
