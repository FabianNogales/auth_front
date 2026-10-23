import { useQuery } from '@tanstack/react-query'

import type { BasicCredentials } from '../../authentication/types/auth.ts'
import { ticketsService } from '../services/ticketsService.ts'
import { useBasicCredentials } from './useBasicCredentials.ts'

function run<T>(
  credentials: BasicCredentials | null,
  id: number | null,
  call: (credentials: BasicCredentials, id: number) => Promise<T>,
): Promise<T> {
  if (credentials === null || id === null) {
    return Promise.reject(new Error('No hay una sesión activa.'))
  }

  return call(credentials, id)
}

function newestFirst<T extends { id: number }>(items: T[], dateOf: (item: T) => string): T[] {
  return [...items].sort(
    (a, b) => Date.parse(dateOf(b)) - Date.parse(dateOf(a)) || b.id - a.id,
  )
}

export function useTicketDetail(id: number | null) {
  const credentials = useBasicCredentials()
  const ready = credentials !== null && id !== null

  // Cada GET /tickets/{id} registra una vista en el back: sin refetch automático
  // y sin caché entre visitas, para que "una consulta = una entrada".
  const ticket = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => run(credentials, id, ticketsService.get),
    enabled: ready,
    retry: false,
    refetchOnWindowFocus: false,
    gcTime: 0,
  })

  // Se piden después del ticket para que la vista recién registrada ya esté.
  const history = useQuery({
    queryKey: ['ticket-history', id],
    queryFn: () => run(credentials, id, ticketsService.history),
    enabled: ready && ticket.isSuccess,
    select: (entries) => newestFirst(entries, (entry) => entry.created_at),
    gcTime: 0,
  })

  const views = useQuery({
    queryKey: ['ticket-views', id],
    queryFn: () => run(credentials, id, ticketsService.views),
    enabled: ready && ticket.isSuccess,
    select: (items) => newestFirst(items, (item) => item.viewed_at),
    gcTime: 0,
  })

  const createdAt =
    history.data?.find((entry) => entry.action === 'created')?.created_at ?? null

  return { ticket, history, views, createdAt }
}