import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { CreateTicketValues } from '../schemas/createTicketSchema.ts'
import { ticketsService } from '../services/ticketsService.ts'
import { useBasicCredentials } from './useBasicCredentials.ts'
import { ticketsQueryKey } from './useTickets.ts'

export function useCreateTicket() {
  const client = useQueryClient()
  const credentials = useBasicCredentials()

  return useMutation({
    mutationFn: (values: CreateTicketValues) => {
      if (credentials === null) {
        return Promise.reject(new Error('No hay una sesión activa.'))
      }

      const description = values.description.trim()

      return ticketsService.create(credentials, {
        title: values.title,
        ...(description === '' ? {} : { description }),
      })
    },
    onSuccess: async () => {
      toast.success('Ticket creado correctamente')
      await client.invalidateQueries({ queryKey: ticketsQueryKey })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}