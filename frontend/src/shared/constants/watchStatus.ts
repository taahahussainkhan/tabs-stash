import type { SelectOption } from '../types/selectOption'

export const watchStatusValues = ['watching', 'completed', 'paused', 'rewatching'] as const
export type WatchStatus = (typeof watchStatusValues)[number]

export const watchStatusOptions: SelectOption[] = [
  { value: 'watching', label: 'Watching' },
  { value: 'completed', label: 'Completed' },
  { value: 'paused', label: 'Paused' },
  { value: 'rewatching', label: 'Rewatching' },
]
