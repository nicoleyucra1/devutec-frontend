import Skeleton from '../ui/Skeleton'

const card = 'rounded-2xl border border-line bg-surface'

function PersonSkeleton() {
  return (
    <div className={`${card} flex items-center gap-3.5 p-4`}>
      <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
      <div className="grid flex-1 gap-2">
        <Skeleton className="h-2 w-16" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  )
}

// Esqueleto del detalle de contrato con la misma forma que la página: título y estados, tarjeta del monto con
// los 4 pasos, tarjeta de entrega y, a la derecha, el recuadro del siguiente paso, las dos personas y las fechas
export default function ContractDetailSkeleton() {
  return (
    <div aria-busy="true">
      <p role="status" className="sr-only">
        Cargando contrato…
      </p>
      <div aria-hidden="true">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div className="grid w-full max-w-md gap-3">
            <Skeleton className="h-2.5 w-36" />
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-3 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-[86px] rounded-full" />
            <Skeleton className="h-6 w-[104px] rounded-full" />
          </div>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
          <div className="grid gap-6">
            <div className={`${card} p-6 sm:p-[34px]`}>
              <div className="flex justify-between">
                <Skeleton className="h-2.5 w-32" />
                <Skeleton className="h-[22px] w-[76px] rounded-full" />
              </div>
              <div className="mb-10 mt-7 grid gap-3.5">
                <Skeleton className="h-20 w-full max-w-[300px] rounded-xl" />
                <Skeleton className="h-3 w-full max-w-[460px]" />
                <Skeleton className="h-3 w-full max-w-[360px]" />
              </div>
              <div className="grid gap-5 md:grid-cols-4 md:gap-3">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="flex gap-3 md:flex-col">
                    <Skeleton className="h-[31px] w-[31px] shrink-0 rounded-full" />
                    <div className="grid flex-1 gap-2">
                      <Skeleton className="h-2.5 w-4/5" />
                      <Skeleton className="h-2 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`${card} flex items-center gap-[18px] p-6 sm:p-[30px]`}>
              <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
              <div className="grid flex-1 gap-2.5">
                <Skeleton className="h-2 w-20" />
                <Skeleton className="h-5 w-56 rounded-md" />
                <Skeleton className="h-2.5 w-full max-w-sm" />
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="grid gap-3 rounded-2xl bg-[#e9e7e1] p-6 sm:p-7">
              <Skeleton className="h-2.5 w-24" />
              <Skeleton className="h-7 w-4/5 rounded-md" />
              <Skeleton className="h-2.5 w-full" />
              <Skeleton className="h-2.5 w-2/3" />
              <Skeleton className="mt-3 h-[46px] w-full rounded-[11px]" />
            </div>
            <PersonSkeleton />
            <PersonSkeleton />
            <div className={`${card} grid gap-4 p-5`}>
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="flex justify-between">
                  <Skeleton className="h-2.5 w-20" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
