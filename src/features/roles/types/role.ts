export interface RolePermission {
  id: number
  name: string
  description: string | null
  is_system: boolean
}

export interface RoleResponse {
  name: string
  description: string | null
  is_system: boolean
  permissions: string[]
}

export interface CreateRoleInput {
  name: string
  description: string
  permissions: string[]
}
