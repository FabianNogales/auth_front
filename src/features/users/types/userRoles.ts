import type { LabUser } from '../../authentication/types/auth.ts'
import type { RoleResponse } from '../../roles/types/role.ts'

export interface UserWithRoles extends LabUser {
  roles: RoleResponse[]
}
