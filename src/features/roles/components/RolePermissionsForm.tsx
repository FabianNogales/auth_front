import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { RolePermission, RoleResponse } from '../types/role.ts'
import { PermissionOptions } from './PermissionOptions.tsx'
import styles from '../pages/CreateRolePage.module.css'

// La edición conserva el contrato backend: el request decide si admite [].
const schema = z.object({ permissions: z.array(z.string()) })
type Values = z.infer<typeof schema>

interface Props {
  role: RoleResponse
  permissions: RolePermission[]
  pending: boolean
  onSave: (permissions: string[]) => Promise<unknown>
  onBack: () => void
}

export function RolePermissionsForm({ role, permissions, pending, onSave, onBack }: Props) {
  const { register, handleSubmit, reset, formState: { isSubmitting, isDirty } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { permissions: role.permissions },
  })

  useEffect(() => {
    if (!isDirty && !isSubmitting && !pending) {
      reset({ permissions: role.permissions })
    }
  }, [role.permissions, isDirty, isSubmitting, pending, reset])

  const submit = async (values: Values) => {
    if (role.is_system) return
    try {
      await onSave(values.permissions)
      reset({ permissions: values.permissions })
    } catch {
      // La mutation informa del error y conserva la selección.
    }
  }
  const disabled = pending || isSubmitting
  return (
    <form className={styles.form} onSubmit={handleSubmit(submit)}>
      <header>
        <h2>{role.name}</h2>
        {role.description !== null && <p>{role.description}</p>}
        <p>{role.is_system ? 'Rol del sistema' : 'Rol personalizado'}</p>
        <p>Permisos actuales: {role.permissions.join(', ') || 'Sin permisos'}</p>
      </header>
      {role.is_system && (
        <p role="alert" className={styles.error}>Este rol es del sistema y no puede modificarse</p>
      )}
      <fieldset className={styles.fields} disabled={role.is_system || disabled}>
        <legend>Permisos</legend>
        <PermissionOptions permissions={permissions} registration={register('permissions')} />
        {permissions.length === 0 && <p>No hay permisos disponibles.</p>}
      </fieldset>
      <div className={styles.actions}>
        <button type="button" className={styles.secondary} onClick={onBack} disabled={disabled}>Volver</button>
        <button type="submit" disabled={role.is_system || disabled}>
          {disabled ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}
