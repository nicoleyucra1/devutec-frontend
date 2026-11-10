// true si el usuario activó "reducir movimiento" en su sistema; ahí las animaciones se quedan quietas
export function prefersReducedMotion() {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}
