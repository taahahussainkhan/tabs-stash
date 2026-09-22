import { moviesApi } from '../features/movies/api/moviesApi'
import { seriesApi } from '../features/series/api/seriesApi'

export type SearchResultType = 'movie' | 'series' | 'book'

export interface SearchResult {
  id: string
  title: string
  subtitle?: string
  type: SearchResultType
  image?: string
  status?: string
}

export const searchService = {
  async searchAll(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return []

    const [movies, series] = await Promise.all([
      moviesApi.getMovies({ search: query, page_size: 5 }),
      seriesApi.getAll({ search: query, page_size: 5 }),
    ])

    const results: SearchResult[] = [
      ...movies.items.map((m) => ({
        id: m.id,
        title: m.title,
        subtitle: m.director,
        type: 'movie' as const,
        image: m.poster_image,
        status: m.status,
      })),
      ...series.items.map((s) => ({
        id: s.id,
        title: s.title,
        subtitle: s.creator,
        type: 'series' as const,
        image: s.poster_image,
        status: s.status,
      })),
    ]

    return results.sort((a, b) => a.title.localeCompare(b.title))
  },
}
