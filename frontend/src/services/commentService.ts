import { api } from '../app/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { CommentData, UpdateCommentPayload } from '../shared/types/comment'

// Generic comment service
export const commentService = {
  async updateComment(commentPublicId: string, data: UpdateCommentPayload): Promise<void> {
    await api.put(`/logging/comments/${commentPublicId}`, data)
  },

  async deleteComment(commentPublicId: string): Promise<void> {
    await api.delete(`/logging/comments/${commentPublicId}`)
  },

  // Session comments (for movies)
  async getSessionComments(sessionPublicId: string): Promise<CommentData[]> {
    const response = await api.get(`/logging/sessions/${sessionPublicId}/comments`)
    return (response.data || []).map((comment: any) => ({
      public_id: comment.public_id,
      timestamp: comment.timestamp ?? 0,
      duration: comment.chapter_or_episode ? Number(comment.chapter_or_episode) : undefined,
      text: comment.content ?? '',
    }))
  },

  async saveSessionComments(sessionPublicId: string, comments: CommentData[]): Promise<void> {
    await api.post(`/logging/sessions/${sessionPublicId}/comments`, 
      comments.map(c => ({
        content: c.text,
        timestamp: c.timestamp,
        chapter_or_episode: c.duration != null ? String(c.duration) : null,
        is_spoiler: false,
      }))
    )
  },
}

// React Query hooks
export function useUpdateCommentMutation(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentPublicId, data }: { commentPublicId: string; data: UpdateCommentPayload }) =>
      commentService.updateComment(commentPublicId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
      queryClient.invalidateQueries({ queryKey: ['seasons-episodes'] })
      toast.success('Comment updated successfully')
      onSuccessCallback?.()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update comment')
    },
  })
}

export function useDeleteCommentMutation(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentPublicId: string) => commentService.deleteComment(commentPublicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
      queryClient.invalidateQueries({ queryKey: ['seasons-episodes'] })
      toast.success('Comment deleted successfully')
      onSuccessCallback?.()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete comment')
    },
  })
}

export function useSaveSessionCommentsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sessionId, comments }: { sessionId: string; comments: CommentData[] }) =>
      commentService.saveSessionComments(sessionId, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
      toast.success('Comments saved successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to save comments')
    },
  })
}
