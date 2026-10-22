import { z } from 'zod'

export const oauthIssueSchema = z.object({
  username: z.string().trim()
    .min(1, 'El correo electrónico es obligatorio')
    .email('Introduce un correo electrónico válido')
    .max(255, 'El correo electrónico no puede superar los 255 caracteres'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
  client_id: z.string().trim()
    .min(1, 'El identificador del cliente es obligatorio')
    .max(64, 'El identificador del cliente no puede superar los 64 caracteres'),
  client_secret: z.string().min(1, 'El secreto del cliente es obligatorio'),
})

export const oauthRevokeSchema = z.object({
  token: z.string().trim()
    .min(1, 'El token de acceso es obligatorio')
    .min(16, 'El token de acceso debe tener al menos 16 caracteres'),
})
