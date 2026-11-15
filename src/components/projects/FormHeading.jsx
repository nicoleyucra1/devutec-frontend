import PropTypes from 'prop-types'

// Encabezado de Publicar y Editar proyecto: texto chico arriba, título con cursiva verde y una línea de ayuda
export default function FormHeading({ kicker, title, emphasis }) {
  return (
    <header className="mb-9 mt-8 md:mb-12">
      <p className="text-[11px] font-semibold tracking-[0.13em]">{kicker}</p>
      <h1 className="mb-2 mt-3.5 text-[39px] font-semibold leading-[1.02] tracking-[-0.04em] md:text-[47px]">
        {title} <em className="font-serif font-normal text-escrow">{emphasis}</em>
      </h1>
      <p className="text-muted">Una descripción clara ayuda a recibir mejores propuestas y precios más precisos.</p>
    </header>
  )
}

FormHeading.propTypes = {
  kicker: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  emphasis: PropTypes.string.isRequired,
}
