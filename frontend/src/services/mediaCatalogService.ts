import { api } from '../app/api'
import { config } from '../config'

export interface MediaCatalogSearchResult {
  id: string
  title: string
  type: 'movie' | 'series'
  year: number | null
  creator: string | null
  posterUrl: string | null
  overview: string | null
  genres: string[]
  voteAverage?: number | null
}

export interface MediaCatalogEpisodeDetails {
  episodeNumber: number
  title: string
  duration?: number | null
  overview?: string | null
}

export interface MediaCatalogSeasonStructure {
  seasonNumber: number
  episodeCount: number
  title?: string
  year?: number
  episodes?: MediaCatalogEpisodeDetails[]
}

export interface MediaCatalogItemDetails {
  id: string
  title: string
  type: 'movie' | 'series'
  year: number | null
  creator: string | null
  posterUrl: string | null
  overview: string | null
  genres: string[]
  runtimeMinutes: number | null
  seasons?: MediaCatalogSeasonStructure[]
}

export const mediaCatalogService = {
  async search(
    query: string,
    type: 'movie' | 'series' | 'all' = 'all'
  ): Promise<MediaCatalogSearchResult[]> {
    const trimmed = query.trim()
    if (!trimmed || trimmed.length < 2) return []

    try {
      const response = await api.get<{ results: MediaCatalogSearchResult[] }>('/catalog/search', {
        params: { q: trimmed, type },
      })
      if (response.data?.results) {
        return response.data.results
      }
    } catch (err) {
      console.warn('[MediaCatalog] Primary request failed, attempting direct endpoint fallback:', err)
    }

    // Direct fetch fallback in case of Axios cookie/interceptor issues
    try {
      const url = `${config.API_URL}/catalog/search?q=${encodeURIComponent(trimmed)}&type=${type}`
      const res = await fetch(url)
      const data = await res.json()
      return data?.results || []
    } catch (fallbackErr) {
      console.error('[MediaCatalog] Both primary and fallback search failed:', fallbackErr)
      return []
    }
  },

  async getDetails(
    id: string,
    type: 'movie' | 'series'
  ): Promise<MediaCatalogItemDetails | null> {
    if (!id) return null

    try {
      const response = await api.get<{ item: MediaCatalogItemDetails }>(
        `/catalog/details/${type}/${id}`
      )
      if (response.data?.item) {
        return response.data.item
      }
    } catch (err) {
      console.warn('[MediaCatalog] Primary getDetails failed, attempting direct endpoint fallback:', err)
    }

    // Direct fetch fallback
    try {
      const url = `${config.API_URL}/catalog/details/${type}/${id}`
      const res = await fetch(url)
      const data = await res.json()
      return data?.item || null
    } catch (fallbackErr) {
      console.error('[MediaCatalog] Both primary and fallback getDetails failed:', fallbackErr)
      return null
    }
  },
}
