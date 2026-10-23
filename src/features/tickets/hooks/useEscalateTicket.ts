import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { EscalateTicketValues } from '../schemas/escalateTicketSchema.ts'
import { ROLE_NOT_FOUND_MESSAGE, ticketsService } from '../services/ticketsService.ts'
import { useBasicCredentials } from './useBasicCredentials.ts'
import { ticketsQueryKey } from './useTickets.ts'

export function useEscalateTicket(ticketId: number) {
  const client = useQueryClient()
  const credentials = useBasicCredentials()

  return useMutation({
    mutationFn: (values: EscalateTicketValues) => {
      if (credentials === null) {
        return Promise.reject(new Error('No hay una sesión activa.'))
      }

      const note = values.note.trim()

      return ticketsService.escalate(credentials, ticketId, {
        to_role: values.to_role,
        ...(note === '' ? {} : { note }),
      })
    },
    onSuccess: async (updated) => {
      client.setQueryData(['ticket', ticketId], updated)
      toast.success('Ticket escalado correctamente')
      await Promise.all([
        client.invalidateQueries({ queryKey: ticketsQueryKey }),
        client.invalidateQueries({ queryKey: ['ticket-history', ticketId] }),
      ])
    },
    onError: (error: Error) => {
      // "El rol seleccionado no existe" se muestra junto al selector.
      if (error.message !== ROLE_NOT_FOUND_MESSAGE) {
        toast.error(error.message)
      }
    },
  })
}