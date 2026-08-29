export interface Season {
  public_id: string
  series_id: number
  season_number: number
  title?: string | null
  year?: number | null
  episode_count?: number | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface SeasonWithProgress {
  season: Season
  watched_episodes: number
  total_episodes: number
  progress_percentage: number
  average_rating?: number | null
}

export interface Episode {
  public_id: string
  season_id: number
  episode_number: number
  title?: string | null
  duration?: number | null
  is_watched: boolean
  watched_date?: string | null
  current_timestamp?: number | null
  rating?: number | null
  notes?: string | null
  comment_count?: number
  created_at: string
  updated_at: string
}

export interface Comment {
  public_id: string
  loggable_type: string
  content: string
  timestamp?: number | null
  chapter_or_episode?: string | null
  is_spoiler: boolean
  created_at: string
  updated_at: string
}

export interface EpisodeWithComments {
  episode: Episode
  comments: Comment[]
}

export interface SeasonCreate {
  season_number: number
  title?: string
  year?: number
  episode_count?: number
  notes?: string
}

export interface SeasonUpdate {
  title?: string
  year?: number
  episode_count?: number
  notes?: string
}

export interface EpisodeCreate {
  episode_number: number
  title?: string
  duration?: number
}

export interface EpisodeBulkCreate {
  start_episode: number
  end_episode: number
}

export interface EpisodeUpdate {
  title?: string
  duration?: number
  is_watched?: boolean
  watched_date?: string
  current_timestamp?: number
  rating?: number
  notes?: string
}

export interface CommentCreate {
  content: string
  timestamp?: number
  chapter_or_episode?: string
  is_spoiler?: boolean
}

export type EpisodeCommentData = {
  public_id?: string
  timestamp: number
  duration?: number
  text: string
}
