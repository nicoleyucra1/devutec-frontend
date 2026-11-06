// Links de la barra de navegación, como en el diseño. Sin roles, el link lo ve cualquier usuario con sesión.
// "end" marca el link solo en su ruta exacta (Resumen no queda marcado en todas las páginas).
export const NAV_LINKS = [
  { to: '/', label: 'Resumen', end: true },
  { to: '/projects', label: 'Explorar', end: true },
  { to: '/my-projects', label: 'Mis proyectos', roles: ['CLIENT'] },
  { to: '/my-applications', label: 'Postulaciones', roles: ['FREELANCER'] },
  { to: '/contracts', label: 'Contratos', roles: ['CLIENT', 'FREELANCER'] },
]

export const ROLE_LABELS = {
  CLIENT: 'Cliente',
  FREELANCER: 'Freelancer',
  ADMIN: 'Administrador',
}

export function linksForRole(rol) {
  return NAV_LINKS.filter((link) => !link.roles || link.roles.includes(rol))
}

// Iniciales para el avatar ("CR" para Camila Ríos)
export function initials(name) {
  return (name ?? '?')
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}
