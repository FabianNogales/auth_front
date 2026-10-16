import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  createRoleSchema,
  type CreateRoleValues,
} from '../schemas/createRoleSchema.ts'
import type { RolePermission } from '../types/role.ts'
import { PermissionOptions } from './PermissionOptions.tsx'
import styles from '../pages/CreateRolePage.module.css'

interface CreateRoleFormProps {
  permissions: RolePermission[]
  onCreate: (values: CreateRoleValues) => Promise<unknown>
  onCancel: () => void
}

export function CreateRoleForm({
  permissions,
  onCreate,
  onCancel,
}: CreateRoleFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateRoleValues>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: { name: '', description: '', permissions: [] },
  })

  const onSubmit = async (values: CreateRoleValues) => {
    try {
      await onCreate(values)
      reset()
    } catch {
      // La mutation muestra el error; se conservan los datos para reintentar.
    }
  }

  return (
    <form className={styles.form} noValidate onSubmit={handleSubmit(onSubmit)}>
      <h2>Información del rol</h2>
      <fieldset className={styles.fields} disabled={isSubmitting}>
        <div className={styles.field}>
          <label htmlFor="role-name">Nombre del rol *</label>
          <input
            id="role-name"
            maxLength={32}
            {...register('name')}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'role-name-error' : undefined}
          />
          {errors.name && (
            <p id="role-name-error" role="alert" className={styles.error}>
              {errors.name.message}
            </p>
          )}
        </div>
        <div className={styles.field}>
          <label htmlFor="role-description">Descripción</label>
          <textarea
            id="role-description"
            rows={3}
            maxLength={255}
            {...register('description')}
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? 'role-description-error' : undefined}
          />
          {errors.description && (
            <p id="role-description-error" role="alert" className={styles.error}>
              {errors.description.message}
            </p>
          )}
        </div>
        <fieldset
          className={styles.permissions}
          aria-invalid={!!errors.permissions}
          aria-describedby={errors.permissions ? 'role-permissions-error' : undefined}
        >
          <legend>Permisos iniciales *</legend>
          <PermissionOptions permissions={permissions} registration={register('permissions')} />
          {errors.permissions && (
            <p id="role-permissions-error" role="alert" className={styles.error}>
              {errors.permissions.message}
            </p>
          )}
        </fieldset>
      </fieldset>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.secondary}
          disabled={isSubmitting}
          onClick={onCancel}
        >
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando…' : 'Guardar rol'}
        </button>
      </div>
    </form>
  )
}
