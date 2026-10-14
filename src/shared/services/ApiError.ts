import { AxiosError } from 'axios'

export type ApiErrorCode = 'HTTP_ERROR' | 'NETWORK_ERROR' | 'TIMEOUT'

export interface ApiErrorOptions {
  status?: number
  code?: ApiErrorCode
  errors?: unknown
  cause?: unknown
}

/**
 * Error estándar de todas las peticiones del laboratorio.
 *
 * Se construye desde AxiosError en los services. Nunca lleva lógica de
 * sesión: el httpClient es neutral y cada feature decide qué hacer.
 */
export class ApiError extends Error {
  readonly status: number
  readonly code: ApiErrorCode
  readonly errors?: unknown

  constructor(message: string, options: ApiErrorOptions = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = options.status ?? 0
    this.code = options.code ?? 'HTTP_ERROR'
    this.errors = options.errors

    // Mantiene `instanceof ApiError` en distintos targets.
    Object.setPrototypeOf(this, new.target.prototype)

    if (options.cause !== undefined) {
      ;(this as Error & { cause?: unknown }).cause = options.cause
    }
  }

  get isUnauthorized(): boolean {
    return this.status === 401
  }

  get isForbidden(): boolean {
    return this.status === 403
  }

  get isNotFound(): boolean {
    return this.status === 404
  }

  get isValidation(): boolean {
    return this.status === 422
  }

  get isServerError(): boolean {
    return this.status >= 500 && this.status <= 599
  }

  get isNetworkError(): boolean {
    return this.code === 'NETWORK_ERROR'
  }

  get isTimeout(): boolean {
    return this.code === 'TIMEOUT'
  }
}

/**
 * Type guard para estrechar errores en hooks y componentes.
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

/**
 * Convierte un error de Axios en ApiError. El mensaje del backend manda:
 * usa `detail`, luego `message`, luego el fallback.
 */
export function toApiError(error: unknown, fallback: string): ApiError {
  if (isApiError(error)) {
    return error
  }

  if (error instanceof AxiosError) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return new ApiError('El servidor tardó demasiado en responder.', {
        status: 0,
        code: 'TIMEOUT',
        cause: error,
      })
    }

    if (error.response !== undefined) {
      const data = error.response.data as
        | { detail?: unknown; message?: unknown; errors?: unknown }
        | undefined
      const detail = data !== undefined ? data.detail : undefined
      const message = data !== undefined ? data.message : undefined

      return new ApiError(
        typeof detail === 'string'
          ? detail
          : typeof message === 'string'
            ? message
            : fallback,
        {
          status: error.response.status,
          code: 'HTTP_ERROR',
          errors: data?.errors,
          cause: error,
        },
      )
    }

    return new ApiError('No se pudo conectar al servidor.', {
      status: 0,
      code: 'NETWORK_ERROR',
      cause: error,
    })
  }

  return new ApiError(fallback, { cause: error })
}
