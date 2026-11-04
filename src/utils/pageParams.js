// Lee ?page= y ?size= de la URL. La página empieza en 1 y el tamaño solo acepta los del selector.
const SIZES = [10, 25, 50]

export function readPageParams(searchParams) {
  const page = Math.max(Number(searchParams.get('page')) || 1, 1)
  const size = Number(searchParams.get('size'))
  return { page, size: SIZES.includes(size) ? size : SIZES[0] }
}
