import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useBasicLogin } from '../hooks/useBasicLogin.ts'
import styles from './BasicLoginForm.module.css'

const basicLoginSchema = z.object({
  email: z.string().trim().min(1, 'El correo electrónico es obligatorio.'),
  password: z.string().min(1, 'La contraseña es obligatoria.'),
})

type BasicLoginFormValues = z.infer<typeof basicLoginSchema>

type BasicLoginFormProps = {
  onSuccess?: () => void
}

/** Formulario de inicio de sesión con correo y contraseña. */
export function BasicLoginForm({ onSuccess }: BasicLoginFormProps) {
  const { mutate, isPending } = useBasicLogin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BasicLoginFormValues>({
    resolver: zodResolver(basicLoginSchema),
  })

  const onSubmit = (values: BasicLoginFormValues) => {
    mutate(values, { onSuccess })
  }

  return (
    <form
      className={styles.form}
      onSubmit={(event) => void handleSubmit(onSubmit)(event)}
    >
      <div className={styles.field}>
        <label htmlFor="basic-email">Correo electrónico</label>
        <input
          id="basic-email"
          type="email"
          autoComplete="email"
          placeholder="valentina.torres@ejemplo.edu"
          {...register('email')}
        />
        {errors.email !== undefined && (
          <p role="alert" className={styles.error}>
            {errors.email.message}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="basic-password">Contraseña</label>
        <input
          id="basic-password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••••••"
          {...register('password')}
        />
        {errors.password !== undefined && (
          <p role="alert" className={styles.error}>
            {errors.password.message}
          </p>
        )}
      </div>

      <button type="submit" disabled={isPending} className={styles.submit}>
        {isPending ? 'Ingresando…' : 'Ver Inicio →'}
      </button>
    </form>
  )
}
