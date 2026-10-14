/**
 * Headers explícitos por mecanismo.
 *
 * El httpClient es neutral a propósito (AGENTS.md §5.5): NUNCA adjunta
 * credenciales solo. Cada service elige qué headers enviar por llamada.
 */

/** `Authorization: Basic <base64(email:password)>` (RFC 7617). */
export function basicAuthHeaders(
  email: string,
  password: string,
): Record<string, string> {
  return {
    Authorization: `Basic ${btoa(`${email}:${password}`)}`,
  }
}

/** `X-API-Key: <plano>`. */
export function apiKeyHeaders(key: string): Record<string, string> {
  return { 'X-API-Key': key }
}

/** `Authorization: Bearer <token>` (+ discriminador para OAuth). */
export function bearerHeaders(
  token: string,
  mechanism?: 'jwt' | 'oauth',
): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  }

  if (mechanism !== undefined) {
    headers['X-Auth-Mechanism'] = mechanism
  }

  return headers
}

/** Activa el registro de métricas si el experimento está RUNNING. */
export function experimentHeaders(
  experimentId: number | null,
): Record<string, string> {
  if (experimentId === null) {
    return {}
  }

  return { 'X-Experiment-Id': String(experimentId) }
}
