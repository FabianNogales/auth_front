import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { isApiError } from '../../../shared/services/ApiError.ts'
import { oauthRevokeSchema } from '../schemas/oauthSchema.ts'
import { oauthFieldError, oauthService } from '../services/oauthService.ts'
import styles from '../pages/OAuthPage.module.css'
import { useSessionStore } from '../hooks/useSessionStore.ts'

export function OAuthRevokeForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { register, handleSubmit, setError, reset, formState: { errors, isSubmitting } } = useForm<{ token: string }>({
    resolver: zodResolver(oauthRevokeSchema),
    defaultValues: { token: '' },
  })
  return (
    <form className={styles.form} noValidate onSubmit={handleSubmit(async ({ token }) => {
      setErrorMessage(null)
      try {
        const result = await oauthService.revokeToken(token)
        if (useSessionStore.getState().oauthToken === token) useSessionStore.getState().clearOAuthTokens()
        reset()
        if (result === 'already_revoked') toast.info('El token ya estaba revocado')
        else toast.success('Token revocado correctamente')
      } catch (error: unknown) {
        if (isApiError(error) && error.isValidation) {
          const message = oauthFieldError(error.errors, 'token')
          if (message) setError('token', { type: 'server', message })
        }
        const message = isApiError(error) ? error.message : 'No se pudo revocar el token OAuth'
        setErrorMessage(message)
        toast.error(message)
      }
    })}>
      <div>
        <label htmlFor="oauth-revoke-token">Token de acceso</label>
        <input id="oauth-revoke-token" type="password" autoComplete="off" {...register('token')}
          disabled={isSubmitting} aria-invalid={!!errors.token}
          aria-describedby={errors.token ? 'oauth-revoke-error' : undefined} />
        {errors.token && <p id="oauth-revoke-error" role="alert" className={styles.error}>{errors.token.message}</p>}
      </div>
      {errorMessage && <p role="alert" className={styles.error}>{errorMessage}</p>}
      <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Revocando…' : 'Revocar token'}</button>
    </form>
  )
}
