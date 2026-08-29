import type { WatchStatus } from '../../../shared/constants/watchStatus'
import type { PaginatedResponse } from '../../../shared/types/pagination'

export type SeriesStatus = WatchStatus

export interface SeasonStructure {
  season_number: number
  episode_count: number
  title?: string
  year?: number
}

export interface SeriesLogCreate {
  title: string
  creator?: string
  year?: number
  genre?: string
  platform?: string
  rating?: number
  notes?: string
  status: SeriesStatus
  start_date: string
  end_date?: string | null
  current_timestamp?: number
  stop_reason?: string
  is_rewatch?: boolean
  seasons?: SeasonStructure[]
}

export interface SeriesLog {
  id: string // Renamed from public_id for consistency
  public_id?: string // For backward compatibility in some components
  title: string
  creator?: string
  year?: number
  genre?: string
  platform?: string
  rating?: number
  notes?: string
  status: SeriesStatus
  start_date: string
  end_date?: string | null
  current_timestamp?: number
  stop_reason?: string
  is_rewatch: boolean
  is_favorite?: boolean
  is_watchlist?: boolean
  created_at: string
  updated_at: string
  rewatch_count?: number
  episodes_watched?: number
  total_episodes?: number
}

export interface PaginationParams {
  page?: number
  page_size?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  search?: string
  status?: string
  creator?: string
  genre?: string
  platform?: string
  year_min?: number
  year_max?: number
  rating_min?: number
  rating_max?: number
  is_favorite?: boolean
  is_watchlist?: boolean
}

export type SeriesPaginatedResponse = PaginatedResponse<SeriesLog>

export interface SeriesStats {
  total: number
  watching: number
  completed: number
  paused: number
  rewatching: number
}

export interface SessionHistory {
  sessionId: string // Renamed from sessionPublicId for consistency
  status: SeriesStatus
  startDate: string
  endDate?: string | null
  isRewatch: boolean
  rating?: number | null
  notes?: string | null
  comments: Array<{
    public_id: string
    timestamp: number
    duration?: number
    text: string
  }>
}

// Backend response types
export interface SeriesOut {
  public_id: string
  title: string
  creator?: string | null
  year?: number | null
  genre?: string | null
  is_favorite?: boolean
  is_watchlist?: boolean
  created_at: string
  updated_at: string
}

export interface SessionOut {
  public_id: string
  status: SeriesStatus
  start_date: string
  end_date?: string | null
  current_position?: number | null
  stop_reason?: string | null
  is_rewatch: boolean
  rating?: number | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface SeriesWithCurrentSessionOut {
  series: SeriesOut
  current_session?: SessionOut | null
  rewatch_count: number
}

export interface SeriesWithSessionsOut {
  series: SeriesOut
  current_session?: SessionOut | null
  sessions: SessionOut[]
}

export interface BackendCommentOut {
  public_id: string
  loggable_type: string
  content: string
  timestamp?: number | null
  chapter_or_episode?: string | null
  is_spoiler: boolean
  created_at: string
  updated_at: string
}

export interface BackendSessionWithCommentsOut {
  session: SessionOut
  comments: BackendCommentOut[]
}

export interface SeriesSessionsWithCommentsOut {
  series: SeriesOut
  sessions: BackendSessionWithCommentsOut[]
}
