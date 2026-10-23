import { useQuery } from '@tanstack/react-query'

import { ticketsService } from '../services/ticketsService.ts'
import { useBasicCredentials } from './useBasicCredentials.ts'

export const ticketsQueryKey = ['tickets'] as const

export function useTickets() {
  const credentials = useBasicCredentials()

  return useQuery({
    queryKey: ticketsQueryKey,
    queryFn: () => {
      if (credentials === null) {
        return Promise.reject(new Error('No hay una sesión activa.'))
      }

      return ticketsService.list(credentials)
    },
    enabled: credentials !== null,
  })
}