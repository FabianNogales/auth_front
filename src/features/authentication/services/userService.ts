import { httpClient } from '../../../shared/services/httpClient.ts'
import { basicAuthHeaders } from '../../../shared/services/authHeaders.ts'
import { toApiError } from '../../../shared/services/ApiError.ts'
import { useSessionStore } from '../hooks/useSessionStore.ts'

function getAuthHeaders() {
  const { mechanism, basicEmail, basicPassword } = useSessionStore.getState()
  if (mechanism === 'BASIC' && basicEmail && basicPassword) {
    return basicAuthHeaders(basicEmail, basicPassword)
  }
  return {}
}

export interface RegisterUserInput {
  name: string
  email: string
  password: string
  password_confirmation: string
  role: string
}

export const userService = {
  async register(input: RegisterUserInput) {
    try {
      const response = await httpClient.post('/users', input, {
        headers: getAuthHeaders(),
      })
      return response.data
    } catch (error) {
      throw toApiError(error, 'No se pudo registrar el usuario.')
    }
  }
}