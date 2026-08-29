export function pad2(value: number): string {
  return value.toString().padStart(2, '0')
}

export function formatSecondsAsClock(seconds: number | null | undefined, placeholder = '-'): string {
  if (seconds == null || Number.isNaN(seconds)) return placeholder
  const total = Math.max(0, Math.floor(seconds))

  const hours = Math.floor(total / 3600)
  const mins = Math.floor((total % 3600) / 60)
  const secs = total % 60

  if (hours > 0) {
    return `${hours}:${pad2(mins)}:${pad2(secs)}`
  }

  return `${mins}:${pad2(secs)}`
}

export function formatSecondsAsHoursMinutes(seconds: number | null | undefined, placeholder = '-'): string {
  if (seconds == null || Number.isNaN(seconds)) return placeholder
  const total = Math.max(0, Math.floor(seconds))
  const hours = Math.floor(total / 3600)
  const mins = Math.floor((total % 3600) / 60)

  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

export type WatchStatus = 'watching' | 'completed' | 'paused' | 'rewatching'

export function getWatchStatusBadgeClass(status: string): string {
  switch (status) {
    case 'watching':
      return 'badge-info'
    case 'completed':
      return 'badge-success'
    case 'paused':
      return 'badge-warning'
    case 'rewatching':
      return 'badge-secondary'
    default:
      return 'badge-neutral'
  }
}

export function getWatchStatusVariant(status: string): 'info' | 'success' | 'warning' | 'secondary' | 'neutral' {
  switch (status) {
    case 'watching':
      return 'info'
    case 'completed':
      return 'success'
    case 'paused':
      return 'warning'
    case 'rewatching':
      return 'secondary'
    default:
      return 'neutral'
  }
}

export function getWatchStatusDotClass(status: string): string {
  switch (status) {
    case 'completed':
      return 'bg-success'
    case 'watching':
      return 'bg-info'
    case 'paused':
      return 'bg-warning'
    case 'rewatching':
      return 'bg-secondary'
    default:
      return 'bg-neutral'
  }
}
