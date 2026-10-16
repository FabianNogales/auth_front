import { z } from 'zod'

export const createRoleSchema = z.object({
  name: z.string().trim()
    .min(1, 'El nombre del rol es obligatorio')
    .max(32, 'El nombre del rol no puede superar los 32 caracteres'),
  description: z.string()
    .max(255, 'La descripción no puede superar los 255 caracteres'),
  permissions: z.array(z.string())
    .min(1, 'Debe seleccionar al menos un permiso'),
})

export type CreateRoleValues = z.infer<typeof createRoleSchema>
