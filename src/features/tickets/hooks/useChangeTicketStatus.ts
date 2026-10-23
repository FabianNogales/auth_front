import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { isApiError } from '../../../shared/services/ApiError.ts'
import { ticketsService } from '../services/ticketsService.ts'
import type { TicketStatus } from '../types/ticket.ts'
import { useBasicCredentials } from './useBasicCredentials.ts'
import { ticketsQueryKey } from './useTickets.ts'

export function useChangeTicketStatus(ticketId: number) {
  const client = useQueryClient()
  const credentials = useBasicCredentials()

  return useMutation({
    mutationFn: (status: TicketStatus) => {
      if (credentials === null) {
        return Promise.reject(new Error('No hay una sesión activa.'))
      }

      return ticketsService.changeStatus(credentials, ticketId, status)
    },
    onSuccess: async (updated) => {
      client.setQueryData(['ticket', ticketId], updated)
      toast.success('Estado actualizado correctamente')
      await Promise.all([
        client.invalidateQueries({ queryKey: ticketsQueryKey }),
        client.invalidateQueries({ queryKey: ['ticket-history', ticketId] }),
      ])
    },
    onError: (error: Error) => {
      // El 422 (transición inválida) lo muestra el formulario junto al selector.
      if (!(isApiError(error) && error.isValidation)) {
        toast.error(error.message)
      }
    },
  })
}