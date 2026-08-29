import { api } from '../app/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type {
  Comment,
  CommentCreate,
  Episode,
  EpisodeBulkCreate,
  EpisodeCommentData,
  EpisodeCreate,
  EpisodeUpdate,
  EpisodeWithComments,
  Season,
  SeasonCreate,
  SeasonUpdate,
  SeasonWithProgress,
} from '../features/series/types/seasonEpisode'

// Service
export const seasonEpisodeService = {
  // Season methods
  async getSeasons(seriesPublicId: string): Promise<SeasonWithProgress[]> {
    const response = await api.get<SeasonWithProgress[]>(`/logging/series/${seriesPublicId}/seasons`)
    return response.data
  },

  async createSeason(seriesPublicId: string, seasonData: SeasonCreate): Promise<Season> {
    const response = await api.post<Season>(`/logging/series/${seriesPublicId}/seasons`, seasonData)
    return response.data
  },

  async updateSeason(seasonPublicId: string, seasonData: SeasonUpdate): Promise<Season> {
    const response = await api.put<Season>(`/logging/seasons/${seasonPublicId}`, seasonData)
    return response.data
  },

  async deleteSeason(seasonPublicId: string): Promise<void> {
    await api.delete(`/logging/seasons/${seasonPublicId}`)
  },

  // Episode methods
  async getEpisodes(seasonPublicId: string, limit: number = 50, offset: number = 0): Promise<Episode[]> {
    const response = await api.get<Episode[]>(`/logging/seasons/${seasonPublicId}/episodes`, {
      params: { limit, offset }
    })
    return response.data
  },

  async createEpisode(seasonPublicId: string, episodeData: EpisodeCreate): Promise<Episode> {
    const response = await api.post<Episode>(`/logging/seasons/${seasonPublicId}/episodes`, episodeData)
    return response.data
  },

  async bulkCreateEpisodes(seasonPublicId: string, bulkData: EpisodeBulkCreate): Promise<Episode[]> {
    const response = await api.post<Episode[]>(`/logging/seasons/${seasonPublicId}/episodes/bulk`, bulkData)
    return response.data
  },

  async updateEpisode(episodePublicId: string, episodeData: EpisodeUpdate): Promise<Episode> {
    const response = await api.put<Episode>(`/logging/episodes/${episodePublicId}`, episodeData)
    return response.data
  },

  async markEpisodeWatched(episodePublicId: string, isWatched: boolean): Promise<{ message: string; is_watched: boolean }> {
    const response = await api.patch<{ message: string; is_watched: boolean }>(
      `/logging/episodes/${episodePublicId}/watched`,
      null,
      { params: { is_watched: isWatched } }
    )
    return response.data
  },

  async bulkMarkEpisodesWatched(episodePublicIds: string[], isWatched: boolean): Promise<Episode[]> {
    const response = await api.post<Episode[]>('/logging/episodes/bulk-watched', {
      episode_public_ids: episodePublicIds,
      is_watched: isWatched
    })
    return response.data
  },

  async deleteEpisode(episodePublicId: string): Promise<void> {
    await api.delete(`/logging/episodes/${episodePublicId}`)
  },

  async getNextUnwatchedEpisode(seriesPublicId: string): Promise<{ season: Season | null; episode: Episode | null; message?: string }> {
    const response = await api.get<{ season: Season | null; episode: Episode | null; message?: string }>(
      `/logging/series/${seriesPublicId}/next-unwatched`
    )
    return response.data
  },

  // Episode comments
  async getEpisodeComments(episodePublicId: string): Promise<Comment[]> {
    const response = await api.get<Comment[]>(`/logging/episodes/${episodePublicId}/comments`)
    return response.data
  },

  async createEpisodeComment(episodePublicId: string, commentData: CommentCreate): Promise<Comment> {
    const response = await api.post<Comment>(`/logging/episodes/${episodePublicId}/comments`, commentData)
    return response.data
  },
}

// Query keys
export const seasonEpisodeKeys = {
  all: ['seasons-episodes'] as const,
  seasons: (seriesId: string) => [...seasonEpisodeKeys.all, 'seasons', seriesId] as const,
  episodes: (seasonId: string) => [...seasonEpisodeKeys.all, 'episodes', seasonId] as const,
  episodeComments: (episodeId: string) => [...seasonEpisodeKeys.all, 'episode-comments', episodeId] as const,
  nextUnwatched: (seriesId: string) => [...seasonEpisodeKeys.all, 'next-unwatched', seriesId] as const,
}

// React Query hooks
export function useSeasonsQuery(seriesPublicId: string) {
  return useQuery({
    queryKey: seasonEpisodeKeys.seasons(seriesPublicId),
    queryFn: () => seasonEpisodeService.getSeasons(seriesPublicId),
    enabled: !!seriesPublicId,
  })
}

export function useEpisodesQuery(seasonPublicId: string, limit: number = 50, offset: number = 0) {
  return useQuery({
    queryKey: [...seasonEpisodeKeys.episodes(seasonPublicId), limit, offset],
    queryFn: () => seasonEpisodeService.getEpisodes(seasonPublicId, limit, offset),
    enabled: !!seasonPublicId,
  })
}

export function useNextUnwatchedQuery(seriesPublicId: string) {
  return useQuery({
    queryKey: seasonEpisodeKeys.nextUnwatched(seriesPublicId),
    queryFn: () => seasonEpisodeService.getNextUnwatchedEpisode(seriesPublicId),
    enabled: !!seriesPublicId,
  })
}

// Mutations
export function useCreateSeasonMutation(seriesPublicId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (seasonData: SeasonCreate) => seasonEpisodeService.createSeason(seriesPublicId, seasonData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seasonEpisodeKeys.seasons(seriesPublicId) })
      toast.success('Season created successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create season')
    },
  })
}

export function useUpdateSeasonMutation(seriesPublicId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ seasonPublicId, seasonData }: { seasonPublicId: string; seasonData: SeasonUpdate }) =>
      seasonEpisodeService.updateSeason(seasonPublicId, seasonData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seasonEpisodeKeys.seasons(seriesPublicId) })
      toast.success('Season updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update season')
    },
  })
}

export function useDeleteSeasonMutation(seriesPublicId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (seasonPublicId: string) => seasonEpisodeService.deleteSeason(seasonPublicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seasonEpisodeKeys.seasons(seriesPublicId) })
      toast.success('Season deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete season')
    },
  })
}

export function useCreateEpisodeMutation(seasonPublicId: string, seriesPublicId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (episodeData: EpisodeCreate) => seasonEpisodeService.createEpisode(seasonPublicId, episodeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seasonEpisodeKeys.episodes(seasonPublicId) })
      queryClient.invalidateQueries({ queryKey: seasonEpisodeKeys.seasons(seriesPublicId) })
      toast.success('Episode created successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create episode')
    },
  })
}

export function useBulkCreateEpisodesMutation(seasonPublicId: string, seriesPublicId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (bulkData: EpisodeBulkCreate) => seasonEpisodeService.bulkCreateEpisodes(seasonPublicId, bulkData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seasonEpisodeKeys.episodes(seasonPublicId) })
      queryClient.invalidateQueries({ queryKey: seasonEpisodeKeys.seasons(seriesPublicId) })
      toast.success('Episodes created successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create episodes')
    },
  })
}

export function useUpdateEpisodeMutation(seasonPublicId: string, seriesPublicId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ episodePublicId, episodeData }: { episodePublicId: string; episodeData: EpisodeUpdate }) =>
      seasonEpisodeService.updateEpisode(episodePublicId, episodeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seasonEpisodeKeys.episodes(seasonPublicId) })
      queryClient.invalidateQueries({ queryKey: seasonEpisodeKeys.seasons(seriesPublicId) })
      toast.success('Episode updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update episode')
    },
  })
}

export function useMarkEpisodeWatchedMutation(seasonPublicId: string, seriesPublicId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ episodePublicId, isWatched }: { episodePublicId: string; isWatched: boolean }) =>
      seasonEpisodeService.markEpisodeWatched(episodePublicId, isWatched),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seasonEpisodeKeys.episodes(seasonPublicId) })
      queryClient.invalidateQueries({ queryKey: seasonEpisodeKeys.seasons(seriesPublicId) })
      queryClient.invalidateQueries({ queryKey: seasonEpisodeKeys.nextUnwatched(seriesPublicId) })
      toast.success('Episode watch status updated')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update watch status')
    },
  })
}

export function useBulkMarkEpisodesWatchedMutation(seasonPublicId: string, seriesPublicId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ episodePublicIds, isWatched }: { episodePublicIds: string[]; isWatched: boolean }) =>
      seasonEpisodeService.bulkMarkEpisodesWatched(episodePublicIds, isWatched),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seasonEpisodeKeys.episodes(seasonPublicId) })
      queryClient.invalidateQueries({ queryKey: seasonEpisodeKeys.seasons(seriesPublicId) })
      queryClient.invalidateQueries({ queryKey: seasonEpisodeKeys.nextUnwatched(seriesPublicId) })
      toast.success('Episodes watch status updated')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update watch status')
    },
  })
}

export function useDeleteEpisodeMutation(seasonPublicId: string, seriesPublicId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (episodePublicId: string) => seasonEpisodeService.deleteEpisode(episodePublicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seasonEpisodeKeys.episodes(seasonPublicId) })
      queryClient.invalidateQueries({ queryKey: seasonEpisodeKeys.seasons(seriesPublicId) })
      toast.success('Episode deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete episode')
    },
  })
}

export function useCreateEpisodeCommentMutation(episodePublicId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentData: CommentCreate) => seasonEpisodeService.createEpisodeComment(episodePublicId, commentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seasonEpisodeKeys.episodeComments(episodePublicId) })
      toast.success('Comment added successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to add comment')
    },
  })
}

export const episodeCommentService = {
  async getEpisodeComments(episodePublicId: string): Promise<EpisodeCommentData[]> {
    const response = await api.get<Comment[]>(`/logging/episodes/${episodePublicId}/comments`)
    return (response.data || []).map(comment => ({
      public_id: comment.public_id,
      timestamp: comment.timestamp ?? 0,
      duration: comment.chapter_or_episode ? Number(comment.chapter_or_episode) : undefined,
      text: comment.content ?? '',
    }))
  },

  async saveEpisodeComments(episodePublicId: string, comments: EpisodeCommentData[]): Promise<void> {
    // Delete existing comments first (replace all)
    // Create new comments
    for (const comment of comments) {
      await api.post(`/logging/episodes/${episodePublicId}/comments`, {
        loggable_type: 'episode',
        loggable_public_id: episodePublicId,
        content: comment.text,
        timestamp: comment.timestamp,
        chapter_or_episode: comment.duration != null ? String(comment.duration) : null,
        is_spoiler: false,
      })
    }
  },
}

export function useEpisodeCommentsQuery(episodePublicId: string, enabled = true) {
  return useQuery({
    queryKey: seasonEpisodeKeys.episodeComments(episodePublicId),
    queryFn: () => episodeCommentService.getEpisodeComments(episodePublicId),
    enabled: enabled && !!episodePublicId,
  })
}

export function useSaveEpisodeCommentsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ episodePublicId, comments }: { episodePublicId: string; comments: EpisodeCommentData[] }) =>
      episodeCommentService.saveEpisodeComments(episodePublicId, comments),
    onSuccess: (_, { episodePublicId }) => {
      queryClient.invalidateQueries({ queryKey: seasonEpisodeKeys.episodeComments(episodePublicId) })
      toast.success('Comments saved successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to save comments')
    },
  })
}
