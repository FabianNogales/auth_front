const formatter = new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'medium' })

export function formatDateTime(value: string | null): string {
  if (value === null) {
    return '—'
  }

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? '—' : formatter.format(date)
}