import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useJwtLogin } from '../hooks/useJwtLogin.ts'
import styles from './JwtLoginForm.module.css'

const jwtLoginSchema = z.object({
  email: z.string().trim().min(1, 'El correo electrónico es obligatorio.'),
  password: z.string().min(1, 'La contraseña es obligatoria.'),
})

type JwtLoginFormValues = z.infer<typeof jwtLoginSchema>

/** Formulario de inicio de sesión JWT con correo y contraseña. */
export function JwtLoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const { mutate, isPending } = useJwtLogin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JwtLoginFormValues>({
    resolver: zodResolver(jwtLoginSchema),
  })

  const onSubmit = (values: JwtLoginFormValues) => {
    mutate(values, { onSuccess })
  }

  return (
    <form className={styles.form} onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
      <div className={styles.field}>
        <label htmlFor="jwt-email">Correo electrónico</label>
        <input
          id="jwt-email"
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
        <label htmlFor="jwt-password">Contraseña</label>
        <input
          id="jwt-password"
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