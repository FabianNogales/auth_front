import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import tableStyles from '../../../shared/styles/dataTable.module.css'
import { formatDateTime } from '../../../shared/utils/formatDateTime.ts'
import { useSessionStore } from '../../authentication/hooks/useSessionStore.ts'
import { useRoles } from '../../roles/hooks/useRoles.ts'
import { userRolesService } from '../../users/services/userRolesService.ts'
import { ExperimentStatusBadge } from '../components/ExperimentStatusBadge.tsx'
import { EXPERIMENT_STATUS_LABELS, experimentKeys, mechanismLabel } from '../constants/experiments.ts'
import { experimentLiveService } from '../services/experimentLiveService.ts'
import { experimentRoleService } from '../services/experimentRoleService.ts'
import { experimentService } from '../services/experimentService.ts'
import type { Experiment } from '../types/experiment.ts'
import styles from './ExperimentsPage.module.css'

interface LogEntry { id: number; phase: string; status: number }

export function ChangeRolePage() {
  const sessionUserId = useSessionStore((state) => state.user?.id)
  const client = useQueryClient()
  const [experimentId, setExperimentId] = useState('')
  const [role, setRole] = useState('')
  const [secret, setSecret] = useState('')
  const [log, setLog] = useState<LogEntry[]>([])

  const experiments = useQuery({ queryKey: experimentKeys.list(sessionUserId), queryFn: experimentService.list, retry: false })
  const roles = useRoles()
  const available = (experiments.data ?? []).filter(
    (item) => (item.status === 'PENDING' || item.status === 'RUNNING') && item.test_user_id !== null,
  )
  const experiment = available.find((item) => String(item.id) === experimentId)
  const running = experiment?.status === 'RUNNING'
  const testUserId = experiment?.test_user_id ?? null

  const subject = useQuery({
    queryKey: ['user', testUserId],
    queryFn: () => userRolesService.getUser(testUserId as string),
    enabled: testUserId !== null,
  })
  const history = useQuery({
    queryKey: ['role-changes', experiment?.id],
    queryFn: () => experimentRoleService.history((experiment as Experiment).id),
    enabled: running,
  })

  const refresh = () => client.invalidateQueries({ queryKey: experimentKeys.all })
  const fail = (error: Error) => toast.error(error.message)

  const start = useMutation({
    mutationFn: () => experimentService.start((experiment as Experiment).id),
    onSuccess: () => { toast.success('Experimento en ejecución'); setLog([]); void refresh() },
    onError: fail,
  })
  const finish = useMutation({
    mutationFn: () => experimentService.finish((experiment as Experiment).id),
    onSuccess: () => { toast.success('Experimento finalizado'); setExperimentId(''); setSecret(''); setLog([]); void refresh() },
    onError: fail,
  })
  const send = useMutation({
    mutationFn: () =>
      experimentLiveService.sendTicketsRequest(experiment as Experiment, { email: subject.data?.email ?? '', secret }),
    onSuccess: (status) =>
      setLog((entries) => [
        ...entries,
        { id: entries.length + 1, phase: (history.data?.length ?? 0) === 0 ? 'Antes del cambio' : 'Después del cambio', status },
      ]),
    onError: fail,
  })
  const change = useMutation({
    mutationFn: () =>
      experimentRoleService.change(
        (experiment as Experiment).id,
        testUserId as string,
        role.trim(),
        (subject.data?.roles ?? []).map((item) => item.name),
      ),
    onSuccess: () => {
      toast.success('Rol cambiado correctamente')
      setRole('')
      void client.invalidateQueries({ queryKey: ['role-changes', experiment?.id] })
      void client.invalidateQueries({ queryKey: ['user', testUserId] })
    },
    onError: fail,
  })
  const busy = start.isPending || finish.isPending || send.isPending || change.isPending

  return (
    <main className={`${tableStyles.stack} ${styles.page}`}>
      <header>
        <h1>Experimento en vivo</h1>
        <p className={styles.subtitle}>
          Inicia un experimento, envía solicitudes del usuario de prueba, cambia su rol y compara el antes y el después.
        </p>
      </header>

      <section className={`${tableStyles.panel} ${styles.experimentPanel}`} aria-label="Experimento">
        <div className={styles.field}>
          <label htmlFor="experiment">Experimento</label>
          <select
            id="experiment"
            value={experimentId}
            disabled={busy}
            onChange={(event) => { setExperimentId(event.target.value); setRole(''); setSecret(''); setLog([]) }}
          >
            <option value="">Selecciona un experimento</option>
            {available.map((item) => (
              <option key={item.id} value={item.id}>
                #{item.id} · {item.name} · {mechanismLabel(item.mechanism)} · {EXPERIMENT_STATUS_LABELS[item.status]}
              </option>
            ))}
          </select>
          {experiments.isSuccess && available.length === 0 && (
            <p className={styles.hint}>No hay experimentos pendientes ni en ejecución. Crea uno en Experimentos.</p>
          )}
        </div>
        {experiment && (
          <div className={styles.actions}>
            <ExperimentStatusBadge status={experiment.status} />
            {experiment.status === 'PENDING' && (
              <button type="button" disabled={busy} onClick={() => start.mutate()}>Iniciar experimento</button>
            )}
            {running && (
              <button type="button" className={styles.secondary} disabled={busy} onClick={() => finish.mutate()}>
                Finalizar experimento
              </button>
            )}
          </div>
        )}
      </section>

      {experiment && running && (
        <>
          <section className={tableStyles.panel} aria-label="Usuario de prueba">
            <h2>{subject.data?.name ?? 'Cargando usuario…'}</h2>
            <p className={styles.hint}>
              Roles actuales: {subject.data?.roles.map((item) => item.name).join(', ') || '—'}
            </p>
            <form
              className={styles.form}
              onSubmit={(event) => {
                event.preventDefault()
                if (secret.trim() && subject.data && !busy) send.mutate()
              }}
            >
              <div className={styles.field}>
                <label htmlFor="secret">
                  {experiment.mechanism === 'basic'
                    ? `Contraseña de ${subject.data?.email ?? 'el usuario'}`
                    : experiment.mechanism === 'api_key'
                      ? 'API Key del usuario (texto completo)'
                      : 'Token de acceso del usuario'}
                </label>
                <input id="secret" type="password" autoComplete="off" value={secret} onChange={(event) => setSecret(event.target.value)} />
              </div>
              <button type="submit" disabled={!secret.trim() || !subject.data || busy}>Enviar solicitud de prueba</button>
            </form>
            {log.length > 0 && (
              <div className={tableStyles.tableWrap}>
                <table className={tableStyles.table}>
                  <caption>Solicitudes enviadas en esta sesión</caption>
                  <thead><tr>{['N°', 'Momento', 'Respuesta HTTP'].map((label) => <th scope="col" key={label}>{label}</th>)}</tr></thead>
                  <tbody>
                    {log.map((entry) => (
                      <tr key={entry.id}><td>{entry.id}</td><td>{entry.phase}</td><td>{entry.status}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p><Link to={`/experimentos/comparacion?ids=${experiment.id}`}>Ver comparación antes y después</Link></p>
          </section>

          <section className={tableStyles.panel} aria-label="Cambio de rol">
            <form
              className={styles.form}
              onSubmit={(event) => {
                event.preventDefault()
                if (role.trim() && subject.data && !busy) change.mutate()
              }}
            >
              <div className={styles.field}>
                <label htmlFor="role">Nuevo rol</label>
                <input id="role" list="role-options" autoComplete="off" value={role} onChange={(event) => setRole(event.target.value)} />
                <datalist id="role-options">
                  {roles.data?.map((item) => <option key={item.name} value={item.name} />)}
                </datalist>
              </div>
              <button type="submit" disabled={!role.trim() || !subject.data || busy}>
                {change.isPending ? 'Cambiando…' : 'Cambiar rol'}
              </button>
            </form>
          </section>

          <section className={tableStyles.panel} aria-label="Historial de cambios de rol">
            <h2>Historial del experimento</h2>
            {history.isPending && <p role="status">Cargando historial…</p>}
            {history.isError && <p role="alert">{history.error.message}</p>}
            {history.data?.length === 0 && <p className={tableStyles.empty}>Aún no hay cambios de rol registrados</p>}
            {!!history.data?.length && (
              <div className={tableStyles.tableWrap}>
                <table className={tableStyles.table}>
                  <caption>Cambios de rol registrados</caption>
                  <thead><tr>{['Fecha', 'Administrador', 'Rol agregado', 'Rol quitado'].map((label) => <th scope="col" key={label}>{label}</th>)}</tr></thead>
                  <tbody>
                    {history.data.map((item) => (
                      <tr key={`${item.created_at}-${item.payload.admin_id}`}>
                        <td>{formatDateTime(item.created_at)}</td>
                        <td>{item.payload.admin_name ?? '—'}</td>
                        <td>{item.payload.added?.join(', ') || '—'}</td>
                        <td>{item.payload.removed?.join(', ') || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  )
}
