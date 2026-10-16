import type { UseFormRegisterReturn } from 'react-hook-form'
import type { RolePermission } from '../types/role.ts'
import styles from '../pages/CreateRolePage.module.css'

interface Props {
  permissions: RolePermission[]
  registration: UseFormRegisterReturn<'permissions'>
}

export function PermissionOptions({ permissions, registration }: Props) {
  return (
    <div className={styles.permissionGrid}>
      {permissions.map((permission) => (
        <label className={styles.permission} key={permission.id}>
          <input type="checkbox" value={permission.name} {...registration} />
          <span>
            <strong>{permission.name}</strong>
            {permission.description !== null && (
              <span className={styles.description}>{permission.description}</span>
            )}
          </span>
        </label>
      ))}
    </div>
  )
}
