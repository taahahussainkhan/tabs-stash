import type { SelectOption } from '../../../shared/types/selectOption'

export const watchingLimitOptions: SelectOption[] = [
  { value: '', label: 'Unlimited' },
  ...Array.from({ length: 10 }, (_, i) => {
    const value = (i + 1).toString()
    return { value, label: value }
  }),
]
