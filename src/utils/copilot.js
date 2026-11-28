// Funcionalidades que el backend suma a todo proyecto (reunión inicial y publicación), aunque nadie las nombre
const ALWAYS_INCLUDED = ['DESCUBRIMIENTO', 'DESPLIEGUE']

// true si el proyecto tiene funcionalidades propias (las guarda el asistente IA al crearlo).
// Sin ellas, las horas solo cuentan la reunión inicial y la publicación, y saldrían engañosamente bajas.
export function hasFeatureDetail(estimate) {
  return Boolean(estimate?.features?.some((feature) => !ALWAYS_INCLUDED.includes(feature.code)))
}
