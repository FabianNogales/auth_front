import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { RoleResponse } from '../../roles/types/role.ts'
import styles from '../../roles/pages/CreateRolePage.module.css'

const schema = z.object({ role: z.string().min(1, 'Debe seleccionar un rol') })
type Values = z.infer<typeof schema>

interface Props {
  roles: RoleResponse[]
  disabled: boolean
  onAssign: (role: RoleResponse) => Promise<unknown>
}

export function AssignRoleForm({ roles, disabled, onAssign }: Props) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { role: '' },
  })
  const submit = async (values: Values) => {
    const role = roles.find((item) => item.name === values.role)
    if (!role) return
    try {
      await onAssign(role)
      reset()
    } catch {
      // La mutation muestra el error y conserva la selección.
    }
  }
  return (
    <form className={styles.form} noValidate onSubmit={handleSubmit(submit)}>
      <div className={styles.field}>
        <label htmlFor="assign-role">Rol</label>
        <select id="assign-role" {...register('role')} disabled={disabled || isSubmitting}
          aria-invalid={!!errors.role} aria-describedby={errors.role ? 'assign-role-error' : undefined}>
          <option value="">Selecciona un rol</option>
          {roles.map((role) => <option key={role.name} value={role.name}>{role.name}</option>)}
        </select>
        {errors.role && <p id="assign-role-error" role="alert" className={styles.error}>{errors.role.message}</p>}
      </div>
      <div className={styles.actions}>
        <button type="submit" disabled={disabled || isSubmitting}>
          {isSubmitting ? 'Asignando…' : 'Asignar rol'}
        </button>
      </div>
    </form>
  )
}
