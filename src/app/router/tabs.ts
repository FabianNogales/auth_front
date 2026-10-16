/**
 * Registro central de tabs del workspace.
 *
 * Otros devs agregan páginas aquí: una entrada = un item del sidebar.
 * `roles` filtra por rol en UI (vacío = solo exige sesión). La autorización
 * real siempre la decide el backend por request.
 */
export type LabTabSection = 'GENERAL' | 'LABORATORIO'

export interface LabTab {
  path: string
  label: string
  section: LabTabSection
  icon: 'home' | 'user' | 'users' | 'shield' | 'flask'
  roles?: string[]
}

export const LAB_TABS: LabTab[] = [
  { path: '/', label: 'Inicio', section: 'GENERAL', icon: 'home' },
  { path: '/perfil', label: 'Perfil', section: 'GENERAL', icon: 'user' },
  { path: '/roles/crear', label: 'Crear rol', section: 'GENERAL', icon: 'shield' },
  { path: '/roles/permisos', label: 'Gestionar permisos', section: 'GENERAL', icon: 'shield' },
  { path: '/usuarios/roles', label: 'Asignar rol', section: 'GENERAL', icon: 'users' },
  { path: '/api-keys', label: 'API Keys', section: 'LABORATORIO', icon: 'shield' },
]
