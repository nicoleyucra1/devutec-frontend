// Links de la barra de navegación. Sin roles, el link lo ve cualquier usuario con sesión.
export const NAV_LINKS = [
  { to: '/projects', label: 'Explorar proyectos' },
  { to: '/my-projects', label: 'Mis proyectos', roles: ['CLIENT'] },
  { to: '/projects/new', label: 'Publicar proyecto', roles: ['CLIENT'] },
  { to: '/my-applications', label: 'Mis postulaciones', roles: ['FREELANCER'] },
  { to: '/contracts', label: 'Mis contratos', roles: ['CLIENT', 'FREELANCER'] },
  { to: '/profile/edit', label: 'Editar mi perfil', roles: ['FREELANCER'] },
]

export const ROLE_LABELS = {
  CLIENT: 'Cliente',
  FREELANCER: 'Freelancer',
  ADMIN: 'Administrador',
}

export function linksForRole(rol) {
  return NAV_LINKS.filter((link) => !link.roles || link.roles.includes(rol))
}
