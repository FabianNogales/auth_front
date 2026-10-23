import { z } from 'zod'

export const createTicketSchema = z.object({
  title: z.string().trim()
    .min(1, 'El título es obligatorio')
    .max(255, 'El título no puede superar los doscientos cincuenta y cinco caracteres'),
  description: z.string(),
})

export type CreateTicketValues = z.infer<typeof createTicketSchema>