import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { isApiError } from '../../../shared/services/ApiError.ts'
import { oauthIssueSchema } from '../schemas/oauthSchema.ts'
import { oauthFieldError, oauthService } from '../services/oauthService.ts'
import type { OAuthCredentials, OAuthTokenPair } from '../types/oauth.ts'
import styles from '../pages/OAuthPage.module.css'

const fields = [
  { name: 'username', label: 'Correo electrónico', type: 'email', autoComplete: 'username', maxLength: 255 },
  { name: 'password', label: 'Contraseña', type: 'password', autoComplete: 'current-password' },
  { name: 'client_id', label: 'Identificador del cliente', type: 'text', autoComplete: 'off', maxLength: 64 },
  { name: 'client_secret', label: 'Secreto del cliente', type: 'password', autoComplete: 'off' },
] as const

export function OAuthIssueForm({ onIssued, onStart }: {
  onIssued: (pair: OAuthTokenPair) => void
  onStart: () => void
}) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { register, handleSubmit, setError, resetField, formState: { errors, isSubmitting } } = useForm<OAuthCredentials>({
    resolver: zodResolver(oauthIssueSchema),
    defaultValues: { username: '', password: '', client_id: '', client_secret: '' },
  })

  return (
    <form className={styles.form} noValidate onSubmit={handleSubmit(async (values) => {
      setErrorMessage(null)
      onStart()
      try {
        const pair = await oauthService.issueToken(values)
        resetField('password')
        resetField('client_secret')
        onIssued(pair)
        toast.success('Tokens OAuth emitidos correctamente')
      } catch (error: unknown) {
        if (isApiError(error) && error.isValidation) {
          for (const { name } of fields) {
            const message = oauthFieldError(error.errors, name)
            if (message) setError(name, { type: 'server', message })
          }
        }
        const message = isApiError(error) ? error.message : 'No se pudo obtener el token OAuth'
        setErrorMessage(message)
        toast.error(message)
      }
    })}>
      {fields.map((field) => (
        <div key={field.name}>
          <label htmlFor={`oauth-${field.name}`}>{field.label}</label>
          <input id={`oauth-${field.name}`} type={field.type} autoComplete={field.autoComplete}
            maxLength={'maxLength' in field ? field.maxLength : undefined}
            {...register(field.name)} disabled={isSubmitting}
            aria-invalid={!!errors[field.name]}
            aria-describedby={errors[field.name] ? `oauth-${field.name}-error` : undefined} />
          {errors[field.name] && <p id={`oauth-${field.name}-error`} role="alert" className={styles.error}>{errors[field.name]?.message}</p>}
        </div>
      ))}
      {errorMessage && <p role="alert" className={styles.error}>{errorMessage}</p>}
      <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Obteniendo…' : 'Obtener token OAuth'}</button>
    </form>
  )
}
