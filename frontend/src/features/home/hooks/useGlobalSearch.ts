import { useQuery } from '@tanstack/react-query'
import { searchService } from '../../../services/searchService'
import { useState, useEffect } from 'react'
import { useDebounce } from '../../../shared/hooks/useDebounce'

export function useGlobalSearch() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)

  const { data: results, isLoading, error } = useQuery({
    queryKey: ['global-search', debouncedQuery],
    queryFn: () => searchService.searchAll(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  })

  return {
    query,
    setQuery,
    results: results || [],
    isLoading,
    error,
  }
}
