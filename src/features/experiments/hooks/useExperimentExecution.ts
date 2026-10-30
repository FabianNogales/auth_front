import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useSessionStore } from '../../authentication/hooks/useSessionStore.ts'
import { metricsQueryKey } from '../../metrics/index.ts'
import { experimentKeys } from '../constants/experiments.ts'
import { executeExperiment, type ExperimentCredential } from '../services/experimentExecution.ts'
import type { Experiment } from '../types/experiment.ts'

export function useExperimentExecution() {
  const client = useQueryClient()
  const userId = useSessionStore((state) => state.user?.id)
  const controller = useRef<AbortController | null>(null)
  const mounted = useRef(false)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false; controller.current?.abort() }
  }, [userId])

  const run = async (experiment: Experiment, credential: ExperimentCredential): Promise<boolean> => {
    if (controller.current !== null) return false
    const active = new AbortController()
    controller.current = active
    setBusy(true)
    setError(null)
    try {
      const result = await executeExperiment(experiment, credential, {
        signal: active.signal,
        onStarted: (running) => {
          if (mounted.current) client.setQueryData<Experiment[]>(experimentKeys.list(userId), (current) => current?.map((item) => item.id === running.id ? running : item))
        },
        onProgress: (message) => { if (mounted.current) setProgress(message) },
      })
      if (mounted.current) {
        client.setQueryData<Experiment[]>(experimentKeys.list(userId), (current) => current?.map((item) => item.id === result.experiment.id ? result.experiment : item))
        client.setQueryData(metricsQueryKey(experiment.id), { metrics: result.metrics, comparison: result.comparison })
        toast.success('Experimento completado')
        if (result.metrics.length !== 2 || result.comparison.losses > 0 || !result.comparison.valid) {
          toast.warning('Las métricas registradas no coinciden con las dos solicitudes previstas; consulta los resultados')
        }
      }
      return true
    } catch (failure) {
      if (mounted.current) {
        const message = failure instanceof Error ? failure.message : 'No se pudo ejecutar el experimento'
        setError(message)
        toast.error(message)
      }
      return false
    } finally {
      controller.current = null
      if (mounted.current) {
        setBusy(false)
        setProgress('')
        void client.invalidateQueries({ queryKey: experimentKeys.all })
        void client.invalidateQueries({ queryKey: metricsQueryKey(experiment.id) })
      }
    }
  }
  return { run, busy, progress, error }
}
