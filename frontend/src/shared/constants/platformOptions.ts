import type { SelectOption } from '../types/selectOption'

export const platformValues = [
  'Netflix',
  'Disney+',
  'HBO Max',
  'Amazon Prime',
  'Hulu',
  'Apple TV+',
  'Paramount+',
  'Peacock',
  'YouTube',
  'Theater',
  'DVD/Blu-ray',
  'Digital Download',
  'Other',
] as const

export const platformOptions: SelectOption[] = platformValues.map((platform) => ({
  value: platform,
  label: platform,
}))
