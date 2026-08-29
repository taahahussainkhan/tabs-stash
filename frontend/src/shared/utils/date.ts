export type DateInput = string | number | Date | null | undefined

function toValidDate(input: DateInput): Date | null {
  if (input == null || input === '') return null
  const date = input instanceof Date ? input : new Date(input)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDate(
  input: DateInput,
  options?: Intl.DateTimeFormatOptions,
  locale?: string | string[],
  placeholder = '-',
): string {
  const date = toValidDate(input)
  if (!date) return placeholder
  return date.toLocaleDateString(locale, options)
}

export function formatDateTime(
  input: DateInput,
  options?: Intl.DateTimeFormatOptions,
  locale?: string | string[],
  placeholder = '-',
): string {
  const date = toValidDate(input)
  if (!date) return placeholder
  return date.toLocaleString(locale, options)
}
