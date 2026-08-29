import type { WatchStatus } from '../../../shared/constants/watchStatus'
import type { CommentData } from '../../../shared/types/comment'
import type { PaginatedResponse } from '../../../shared/types/pagination'

export type MovieStatus = WatchStatus

export interface MovieLogCreate {
  title: string
  director?: string
  year?: number
  genre?: string
  poster_image?: string
  platform?: string
  rating?: number
  notes?: string
  status: MovieStatus
  start_date: string
  end_date?: string | null
  current_timestamp?: number
  stop_reason?: string
  is_rewatch?: boolean
}

export interface MovieLog {
  id: string // Renamed from public_id for consistency
  public_id?: string // For backward compatibility in some components
  title: string
  director?: string
  year?: number
  genre?: string
  poster_image?: string
  platform?: string
  rating?: number
  notes?: string
  status: MovieStatus
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
}

export interface PaginationParams {
  page?: number
  page_size?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  search?: string
  status?: string
  director?: string
  genre?: string
  platform?: string
  year_min?: number
  year_max?: number
  rating_min?: number
  rating_max?: number
  is_favorite?: boolean
  is_watchlist?: boolean
}

export type MoviesPaginatedResponse = PaginatedResponse<MovieLog>

export interface MovieStats {
  total: number
  watching: number
  completed: number
  paused: number
  rewatching: number
}

export interface SessionHistory {
  sessionId: string // Renamed from sessionPublicId
  status: MovieStatus
  startDate: string
  endDate?: string | null
  isRewatch: boolean
  rating?: number | null
  notes?: string | null
  comments: CommentData[]
}

// Backend response types (keep them as they are in the API, but map them to our internal types)
export interface MovieOut {
  public_id: string
  title: string
  director?: string | null
  year?: number | null
  genre?: string | null
  poster_image?: string | null
  is_favorite?: boolean
  is_watchlist?: boolean
  created_at: string
  updated_at: string
}

export interface SessionOut {
  public_id: string
  status: MovieStatus
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

export interface MovieWithCurrentSessionOut {
  movie: MovieOut
  current_session?: SessionOut | null
  rewatch_count: number
}

export interface MovieWithSessionsOut {
  movie: MovieOut
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

export interface MovieSessionsWithCommentsOut {
  movie: MovieOut
  sessions: BackendSessionWithCommentsOut[]
}
