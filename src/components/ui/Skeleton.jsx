// Bloque que brilla de izquierda a derecha mientras cargan los datos
export default function Skeleton({ className = 'h-4 w-full' }) {
  return (
    <div
      className={`rounded-md bg-[linear-gradient(90deg,#edebe5_20%,#f7f6f2_50%,#edebe5_80%)] bg-[length:300%_100%] motion-safe:animate-[shimmer_1.4s_infinite] ${className}`}
    />
  )
}
