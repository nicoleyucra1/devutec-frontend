// Bloque gris que parpadea mientras cargan los datos
export default function Skeleton({ className = 'h-4 w-full' }) {
  return <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />
}