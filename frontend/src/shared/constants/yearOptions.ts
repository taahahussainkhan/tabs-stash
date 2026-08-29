import type { SelectOption } from '../types/selectOption'

export function buildYearOptions(params?: {
  startYear?: number
  endYear?: number
}): SelectOption[] {
  const endYear = params?.endYear ?? new Date().getFullYear()
  const startYear = params?.startYear ?? 1900

  if (endYear < startYear) {
    return []
  }

  const yearsCount = endYear - startYear + 1

  return Array.from({ length: yearsCount }, (_, i) => {
    const year = endYear - i
    const value = year.toString()

    return { value, label: value }
  })
}
