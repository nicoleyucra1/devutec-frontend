import Skeleton from './Skeleton'

// Cómo se ve cada tipo de celda mientras carga: proyecto (cuadrito + dos líneas), persona (avatar + línea),
// píldora (un Badge) y línea (texto corto)
function Cell({ type, row }) {
  const width = ['78%', '64%', '84%', '58%', '72%'][row % 5]
  if (type === 'project') {
    return (
      <span className="col-span-2 flex items-center gap-3 lg:col-span-1">
        <Skeleton className="h-10 w-10 shrink-0 rounded-[10px]" />
        <span className="grid flex-1 gap-2">
          <span style={{ width }}>
            <Skeleton className="h-3 w-full" />
          </span>
          <Skeleton className="h-2 w-16" />
        </span>
      </span>
    )
  }
  if (type === 'person') {
    return (
      <span className="col-span-2 flex items-center gap-2 lg:col-span-1">
        <Skeleton className="h-[26px] w-[26px] shrink-0 rounded-full" />
        <Skeleton className="h-2.5 w-24" />
      </span>
    )
  }
  if (type === 'pill') return <Skeleton className="h-[22px] w-[76px] rounded-full" />
  return <Skeleton className="h-3 w-[70px]" />
}

// Esqueleto de una tabla con la misma grilla que la tabla real, para que la página no salte cuando llegan los datos
export default function TableSkeleton({ columns, cells, rows = 5, label }) {
  return (
    <div aria-busy="true" className="overflow-hidden rounded-2xl border border-line bg-surface">
      <p role="status" className="sr-only">
        {label}
      </p>
      <div aria-hidden="true" className={`hidden gap-x-4 bg-[#efede7] px-5 py-4 lg:grid ${columns}`}>
        {cells.map((cell, index) => (
          <Skeleton key={index} className="h-2 w-14" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, row) => (
        <div
          key={row}
          aria-hidden="true"
          className={`grid min-h-[78px] grid-cols-2 items-center gap-x-4 gap-y-3 border-t border-line px-5 py-4 lg:gap-y-0 ${columns}`}
        >
          {cells.map((type, index) => (
            <Cell key={index} type={type} row={row} />
          ))}
        </div>
      ))}
    </div>
  )
}
