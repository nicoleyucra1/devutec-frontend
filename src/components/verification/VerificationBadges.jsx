import PropTypes from 'prop-types'

// Insignias de confianza del estudiante: se registró con correo universitario (.edu.pe) y el admin aprobó su carnet
export default function VerificationBadges({ profile, className = '' }) {
  if (!profile?.universityEmail && !profile?.carnetVerified) return null
  return (
    <span className={`flex flex-wrap gap-1.5 ${className}`}>
      {profile.universityEmail && (
        <span className="inline-flex items-center gap-1 rounded-full bg-escrow-light px-2.5 py-1 text-[11px] font-semibold text-escrow">
          <span aria-hidden="true">🎓</span> Correo universitario
        </span>
      )}
      {profile.carnetVerified && (
        <span className="inline-flex items-center gap-1 rounded-full bg-escrow-light px-2.5 py-1 text-[11px] font-semibold text-escrow">
          <span aria-hidden="true">🪪</span> Carnet verificado
        </span>
      )}
    </span>
  )
}

VerificationBadges.propTypes = {
  profile: PropTypes.shape({
    universityEmail: PropTypes.bool,
    carnetVerified: PropTypes.bool,
  }),
  className: PropTypes.string,
}
