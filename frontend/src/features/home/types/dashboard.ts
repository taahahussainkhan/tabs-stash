export interface MovieSummary {
  id: string // Renamed from public_id for consistency
  public_id?: string // For backward compatibility
  title: string
  type: "movie" | "series" | "book"
  author_or_director?: string
  director?: string // Alias for author_or_director for compatibility
  author?: string // Alias for author_or_director for compatibility
  year?: number
  genre?: string
  status: string
  rating?: number
  is_favorite: boolean
  is_watchlist: boolean
  updated_at: string
  end_date?: string | null
}

export type DashboardItem = MovieSummary

export interface DashboardData {
  stats: {
    total_movies: number
    total_series: number
    total_books: number
    watching: number
    reading: number
    completed: number
    watchlist: number
    completed_this_month: number
  }
  continue_watching: MovieSummary[]
  recently_completed: MovieSummary[]
  watchlist_preview: MovieSummary[]
}
