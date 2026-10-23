import { basicAuthHeaders } from '../../../shared/services/authHeaders.ts'

import { ApiError, toApiError } from '../../../shared/services/ApiError.ts'
import type { CreateTicketInput, EscalateTicketInput, Ticket, TicketHistoryEntry, TicketStatus, TicketView } from '../types/ticket.ts'

import { httpClient } from '../../../shared/services/httpClient.ts'
import type { BasicCredentials } from '../../authentication/types/auth.ts'


const headers = (credentials: BasicCredentials) =>
  basicAuthHeaders(credentials.email, credentials.password)

export const ROLE_NOT_FOUND_MESSAGE = 'El rol seleccionado no existe'


export const ticketsService = {
  async list(credentials: BasicCredentials): Promise<Ticket[]> {
    try {
      return (await httpClient.get<Ticket[]>('/tickets', { headers: headers(credentials) })).data
    } catch (error) {
      throw toApiError(error, 'No se pudieron cargar los tickets.')
    }
  },
  async create(credentials: BasicCredentials, input: CreateTicketInput): Promise<Ticket> {
    try {
      return (await httpClient.post<Ticket>('/tickets', input, { headers: headers(credentials) })).data
    } catch (error) {
      throw toApiError(error, 'No se pudo crear el ticket.')
    }
  },

    async get(credentials: BasicCredentials, id: number): Promise<Ticket> {
    try {
      return (await httpClient.get<Ticket>(`/tickets/${id}`, { headers: headers(credentials) })).data
    } catch (error) {
      const apiError = toApiError(error, 'No se pudo cargar el ticket.')

      if (apiError.isNotFound) {
        throw new ApiError('Ticket no encontrado', { status: apiError.status, cause: apiError })
      }

      throw apiError
    }
  },
  async history(credentials: BasicCredentials, id: number): Promise<TicketHistoryEntry[]> {
    try {
      return (await httpClient.get<TicketHistoryEntry[]>(`/tickets/${id}/history`, { headers: headers(credentials) })).data
    } catch (error) {
      throw toApiError(error, 'No se pudo cargar el historial de cambios.')
    }
  },
  async views(credentials: BasicCredentials, id: number): Promise<TicketView[]> {
    try {
      return (await httpClient.get<TicketView[]>(`/tickets/${id}/views`, { headers: headers(credentials) })).data
    } catch (error) {
      throw toApiError(error, 'No se pudo cargar el historial de vistas.')
    }
  },

    async changeStatus(credentials: BasicCredentials, id: number, status: TicketStatus): Promise<Ticket> {
    try {
      return (
        await httpClient.post<Ticket>(`/tickets/${id}/status`, { status }, { headers: headers(credentials) })
      ).data
    } catch (error) {
      throw toApiError(error, 'No se pudo cambiar el estado del ticket.')
    }
  },
  async escalate(credentials: BasicCredentials, id: number, input: EscalateTicketInput): Promise<Ticket> {
    try {
      return (
        await httpClient.post<Ticket>(`/tickets/${id}/escalate`, input, { headers: headers(credentials) })
      ).data
    } catch (error) {
      const apiError = toApiError(error, 'No se pudo escalar el ticket.')

      if (apiError.isNotFound && apiError.message.startsWith('Rol desconocido')) {
        throw new ApiError(ROLE_NOT_FOUND_MESSAGE, { status: apiError.status, cause: apiError })
      }

      throw apiError
    }
  },
  
}