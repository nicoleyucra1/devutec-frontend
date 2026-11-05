// Links de la barra de navegación. Sin roles, el link lo ve cualquier usuario con sesión.
export const NAV_LINKS = [
  { to: '/projects', label: 'Explorar proyectos' },
  { to: '/my-projects', label: 'Mis proyectos', roles: ['CLIENT'] },
  { to: '/projects/new', label: 'Publicar proyecto', roles: ['CLIENT'] },
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
