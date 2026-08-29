import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

export function useSearchParamsState<T extends Record<string, any>>(
  defaultValues: T
): [T, (newParams: Partial<T>) => void] {
  const [searchParams, setSearchParams] = useSearchParams()

  const state = useMemo(() => {
    const currentParams: any = { ...defaultValues }
    searchParams.forEach((value, key) => {
      const defaultValue = defaultValues[key]
      if (typeof defaultValue === 'number') {
        currentParams[key] = Number(value)
      } else if (typeof defaultValue === 'boolean') {
        currentParams[key] = value === 'true'
      } else {
        currentParams[key] = value
      }
    })
    return currentParams as T
  }, [searchParams, defaultValues])

  const setState = useCallback(
    (newParams: Partial<T>) => {
      const updatedParams = new URLSearchParams(searchParams)
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '' || value === defaultValues[key]) {
          updatedParams.delete(key)
        } else {
          updatedParams.set(key, String(value))
        }
      })
      setSearchParams(updatedParams, { replace: true })
    },
    [searchParams, setSearchParams, defaultValues]
  )

  return [state, setState]
}
