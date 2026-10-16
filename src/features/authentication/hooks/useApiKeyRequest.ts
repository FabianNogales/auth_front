import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import { isApiError } from '../../../shared/services/ApiError.ts'
import { apiKeyService } from '../services/apiKeyService.ts'

export function useApiKeyRequest() {
  return useMutation({
    mutationFn: ({ apiKey, path }: { apiKey: string; path: string }) =>
      apiKeyService.getProtectedResource<unknown>(path, apiKey),
    onSuccess: () => {
      toast.success('Solicitud exitosa', {
        description: 'Se accedió al recurso protegido correctamente.',
      })
    },
    onError: (error: unknown) => {
      if (isApiError(error)) {
        if (error.status === 401) {
          toast.error('No autenticado.')
          return
        }
        if (error.status === 403) {
          toast.error('Acceso prohibido (Falta de permisos / RBAC).')
          return
        }
      }
      toast.error('Ocurrió un error al procesar la solicitud.')
    },
  })
}