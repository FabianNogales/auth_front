import { z } from 'zod'

export const escalateTicketSchema = z.object({
  to_role: z.string().min(1, 'Debe seleccionar un rol destino'),
  note: z.string(),
})

export type EscalateTicketValues = z.infer<typeof escalateTicketSchema>