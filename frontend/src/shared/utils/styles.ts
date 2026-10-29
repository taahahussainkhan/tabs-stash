export const getStatusColorClass = (status: string) => {
  switch (status) {
    case 'completed':
    case 'read':
    case 'finished':
      return 'text-[var(--success)] bg-[var(--success-soft)] border-[var(--success)]'
    case 'watching':
    case 'reading':
      return 'text-[var(--accent-sage)] bg-[var(--success-soft)] border-[var(--success)]'
    case 'paused':
    case 'on-hold':
      return 'text-[var(--warning)] bg-[var(--warning-soft)] border-[var(--warning)]'
    case 'dropped':
      return 'text-[var(--danger)] bg-[var(--danger-soft)] border-[var(--danger)]'
    case 'planning':
    case 'wishlist':
    case 'want-to-read':
    case 'to_watch':
    case 'to-watch':
      return 'text-[var(--accent-indigo)] bg-[var(--primary-soft)] border-[var(--accent-indigo)]'
    case 'rewatching':
    case 'rereading':
      return 'text-[var(--primary)] bg-[var(--primary-soft)] border-[var(--danger)]'
    default:
      return 'text-content-muted bg-[var(--surface-secondary)] border-[var(--border-color)]'
  }
}

export const getStatusDotClass = (status: string) => {
  switch (status) {
    case 'completed':
    case 'read':
    case 'finished':
      return 'bg-[var(--success)]'
    case 'watching':
    case 'reading':
      return 'bg-[var(--accent-sage)]'
    case 'paused':
    case 'on-hold':
      return 'bg-[var(--warning)]'
    case 'dropped':
      return 'bg-[var(--danger)]'
    case 'planning':
    case 'wishlist':
    case 'want-to-read':
    case 'to_watch':
    case 'to-watch':
      return 'bg-[var(--accent-indigo)]'
    case 'rewatching':
    case 'rereading':
      return 'bg-[var(--primary)]'
    default:
      return 'bg-content-muted'
  }
}
