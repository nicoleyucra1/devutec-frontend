import { useState } from 'react'
import { initials } from '../layout/navLinks'
import { avatarSrc } from '../../utils/avatar'

const SIZES = {
  sm: 'h-[26px] w-[26px] text-[8px]',
  md: 'h-9 w-9 text-[10px]',
  nav: 'h-[34px] w-[34px] text-[11px]',
  lg: 'h-12 w-12 text-xs',
  xl: 'h-24 w-24 text-2xl',
}

// Foto de perfil de una persona; si no tiene (o no carga), un círculo con sus iniciales.
// src es la avatarUrl que manda el backend (/api/v1/users/5/avatar?v=...) o una URL ya armada.
export default function Avatar({ name, src, size = 'md', className = '' }) {
  const url = src?.startsWith('blob:') ? src : avatarSrc(src)
  // Se recuerda qué URL falló: si llega una foto nueva, se vuelve a intentar
  const [failedUrl, setFailedUrl] = useState(null)
  const sizeClass = SIZES[size] ?? SIZES.md

  if (url && url !== failedUrl) {
    return (
      <img
        src={url}
        alt=""
        aria-hidden="true"
        onError={() => setFailedUrl(url)}
        className={`shrink-0 rounded-full bg-soft object-cover ${sizeClass} ${className}`}
      />
    )
  }

  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full bg-ink font-semibold tracking-wide text-white ${sizeClass} ${className}`}
    >
      {initials(name)}
    </span>
  )
}
