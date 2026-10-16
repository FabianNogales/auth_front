import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useApiKeyRequest } from '../hooks/useApiKeyRequest.ts'
import styles from './ApiKeyForm.module.css'

const apiKeySchema = z.object({
  apiKey: z.string().trim().min(1, 'La API Key es obligatoria.'),
})

type ApiKeyFormValues = z.infer<typeof apiKeySchema>

type ApiKeyFormProps = {
  onSuccess?: () => void
}

/** Formulario de autenticación mediante API Key (HU-30). */
export function ApiKeyForm({ onSuccess }: ApiKeyFormProps) {
  const [responseOutput, setResponseOutput] = useState<string | null>(null)
  const { mutate, isPending } = useApiKeyRequest()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApiKeyFormValues>({
    resolver: zodResolver(apiKeySchema),
  })

  const onSubmit = (values: ApiKeyFormValues) => {
    setResponseOutput(null)

    mutate(
      { apiKey: values.apiKey, path: '/tickets' },
      {
        onSuccess: (data) => {
          setResponseOutput(JSON.stringify(data, null, 2))
          if (onSuccess) {
            onSuccess()
          }
        },
        onError: (error: any) => {
          if (error?.status === 401) {
            setResponseOutput('No autenticado')
          } else if (error?.status === 403) {
            setResponseOutput('No autorizado (Permisos insuficientes - RBAC)')
          } else {
            setResponseOutput('No autenticado')
          }
        },
      }
    )
  }

  return (
    <form
      className={styles.form}
      onSubmit={(event) => void handleSubmit(onSubmit)(event)}
    >
      <div className={styles.field}>
        <label htmlFor="api-key-input">API Key</label>
        <input
          id="api-key-input"
          type="text"
          placeholder="Pega tu API Key aquí..."
          {...register('apiKey')}
        />
        {errors.apiKey !== undefined && (
          <p role="alert" className={styles.error}>
            {errors.apiKey.message}
          </p>
        )}
      </div>

      <button type="submit" disabled={isPending} className={styles.submit}>
        {isPending ? 'Enviando…' : 'Enviar solicitud →'}
      </button>

      {responseOutput !== null && (
        <div className={styles.response} role="region" aria-label="Resultado">
          {responseOutput}
        </div>
      )}
    </form>
  )
}