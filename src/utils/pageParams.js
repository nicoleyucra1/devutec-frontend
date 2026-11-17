const SIZES = [10, 25, 50, 100]

export function readPageParams(searchParams) {
  const page = Math.max(Number(searchParams.get('page')) || 1, 1)
  const size = Number(searchParams.get('size'))
  return { page, size: SIZES.includes(size) ? size : SIZES[0] }
}
