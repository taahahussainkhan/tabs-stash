import { useState, useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { MessageSquare, Check, Play, Save, Star, Clock, AlignLeft, X } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '../../../../app/api'
import { toast } from 'sonner'
import { seasonEpisodeKeys, useEpisodeCommentsQuery, useSaveEpisodeCommentsMutation } from '../../../../services/seasonEpisodeService'
import type { EpisodeCommentData } from '../../types/seasonEpisode'
import { CommentItem } from '../../../../shared/components/common/CommentItem'
import { CommentForm } from '../../../../shared/components/common/CommentForm'
import { PropertyRow, GhostInput, GhostTextArea } from '../../../../shared/components/common/property-sheet'
import { RatingSlider } from '../../../../shared/components/common/form/RatingSlider'
import { episodeTrackingSchema, type EpisodeTrackingSchemaData } from '../../schemas/episodeTrackingSchema'
import { useModal } from '../../../../shared/hooks/useModal'

interface Episode {
  public_id: string
  episode_number: number
  title?: string
  duration?: number
  is_watched: boolean
  watched_date?: string
  current_timestamp?: number
  rating?: number
  notes?: string
}

interface EpisodeTrackingModalContentProps {
  episode: Episode
  seasonNumber: number
  seriesTitle: string
  seriesPublicId: string
  seasonPublicId: string
}

export function EpisodeTrackingModalContent({
  episode,
  seasonNumber,
  seriesTitle,
  seriesPublicId,
  seasonPublicId,
}: EpisodeTrackingModalContentProps) {
  const { closeModal } = useModal()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'details' | 'comments'>('details')

  const form = useForm<EpisodeTrackingSchemaData>({
    defaultValues: {
      status: episode.is_watched ? 'completed' : 'watching',
      start_date: new Date().toISOString().slice(0, 16),
      end_date: episode.is_watched && episode.watched_date
        ? new Date(episode.watched_date).toISOString().slice(0, 16)
        : '',
      current_position: episode.current_timestamp || 0,
      rating: episode.rating || 0,
      notes: episode.notes || '',
      title: episode.title || '',
      duration: episode.duration || 0,
    } satisfies EpisodeTrackingSchemaData,
    validators: {
      onChange: episodeTrackingSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        if (value.title !== episode.title || value.duration !== episode.duration) {
          await api.put(`/logging/episodes/${episode.public_id}`, {
            title: value.title || null,
            duration: value.duration || null,
          })
        }

        await api.post(`/logging/episodes/${episode.public_id}/session`, {
          status: value.status,
          start_date: new Date(value.start_date).toISOString(),
          end_date: value.end_date ? new Date(value.end_date).toISOString() : null,
          current_position: value.current_position,
          rating: value.rating || null,
          notes: value.notes || null,
        })

        if (JSON.stringify(comments) !== JSON.stringify(existingComments)) {
          await saveCommentsMutation.mutateAsync({
            episodePublicId: episode.public_id,
            comments,
          })
        }

        queryClient.invalidateQueries({ queryKey: seasonEpisodeKeys.episodes(seasonPublicId) })
        queryClient.invalidateQueries({ queryKey: seasonEpisodeKeys.seasons(seriesPublicId) })

        toast.success('Episode updated successfully')
        closeModal(`episode-tracking-${episode.public_id}`)
      } catch (error) {
        toast.error('Failed to update episode')
      }
    },
  })

  // Comments state
  const { data: existingComments } = useEpisodeCommentsQuery(episode.public_id)
  const saveCommentsMutation = useSaveEpisodeCommentsMutation()
  const [comments, setComments] = useState<EpisodeCommentData[]>([])

  useEffect(() => {
    if (existingComments && existingComments.length > 0) {
      setComments(existingComments)
    }
  }, [existingComments])

  const addComment = (comment: { timestamp: number; duration?: number; text: string }) => {
    setComments([...comments, comment])
  }

  const removeComment = (index: number) => {
    setComments(comments.filter((_, i) => i !== index))
  }

  const handleMarkWatched = () => {
    form.setFieldValue('status', 'completed')
    form.setFieldValue('end_date', new Date().toISOString().slice(0, 16))
  }

  const handleMarkUnwatched = () => {
    form.setFieldValue('status', 'watching')
    form.setFieldValue('end_date', '')
  }

  return (
    <div className="flex flex-col h-full bg-[#1e2026]">
      <form
        id="episode-tracking-form"
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          void form.handleSubmit()
        }}
        className="flex flex-col h-full"
      >
        <div className="p-6 sm:p-10 flex-1 overflow-y-auto custom-scrollbar space-y-6">
          {/* Header Title - Notion Style */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono">
                <span className="mono-badge mono-badge-cyan text-[9px]">
                  S{seasonNumber} &bull; EP{episode.episode_number}
                </span>
                <span className="text-[10px] text-content-muted uppercase tracking-wider">
                  {seriesTitle}
                </span>
              </div>

              {/* Tabs */}
              <div className="flex p-0.5 bg-[#15161a] border border-[#2e323c] rounded-[4px] font-mono text-xs">
                <button
                  type="button"
                  className={`px-2.5 py-0.5 font-semibold rounded-[3px] transition-colors cursor-pointer ${
                    activeTab === 'details' 
                      ? 'bg-[#1e2026] text-accent-cyan border border-accent-cyan/30' 
                      : 'text-content-muted hover:text-white'
                  }`}
                  onClick={() => setActiveTab('details')}
                >
                  Properties
                </button>
                <button
                  type="button"
                  className={`px-2.5 py-0.5 font-semibold rounded-[3px] transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'comments' 
                      ? 'bg-[#1e2026] text-accent-cyan border border-accent-cyan/30' 
                      : 'text-content-muted hover:text-white'
                  }`}
                  onClick={() => setActiveTab('comments')}
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>Notes ({comments.length})</span>
                </button>
              </div>
            </div>

            <form.Field
              name="title"
              children={(field) => (
                <input
                  value={field.state.value || ''}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={`Episode ${episode.episode_number}`}
                  className="w-full text-2xl sm:text-4xl font-bold bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-0 text-content-primary placeholder:text-content-muted/20"
                  autoFocus
                />
              )}
            />
          </div>

          {activeTab === 'details' ? (
            <div className="space-y-6">
              {/* Properties Sheet */}
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-content-muted/40 mb-2 px-1">
                  Properties
                </div>

                <PropertyRow icon={<Play className="w-4 h-4" />} label="Status">
                  <div className="flex items-center gap-2 py-1">
                    <button
                      type="button"
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-[4px] border font-mono text-xs font-semibold transition-colors cursor-pointer ${
                        form.state.values.status === 'completed'
                          ? 'bg-[#143324] border-[#1e593a] text-[#4ade80]'
                          : 'bg-[#15161a] border-[#2e323c] text-content-muted hover:text-white'
                      }`}
                      onClick={handleMarkWatched}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Watched</span>
                    </button>
                    <button
                      type="button"
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-[4px] border font-mono text-xs font-semibold transition-colors cursor-pointer ${
                        form.state.values.status === 'watching'
                          ? 'bg-[#0f2e2b] border-[#134e4a] text-[#2dd4bf]'
                          : 'bg-[#15161a] border-[#2e323c] text-content-muted hover:text-white'
                      }`}
                      onClick={handleMarkUnwatched}
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>In Progress</span>
                    </button>
                  </div>
                </PropertyRow>

                <PropertyRow icon={<Clock className="w-4 h-4" />} label="Duration (Minutes)">
                  <form.Field
                    name="duration"
                    children={(field) => (
                      <GhostInput
                        type="number"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.valueAsNumber || 0)}
                        placeholder="e.g. 50"
                        min={0}
                      />
                    )}
                  />
                </PropertyRow>

                <PropertyRow icon={<Clock className="w-4 h-4" />} label="Session Start">
                  <form.Field
                    name="start_date"
                    children={(field) => (
                      <GhostInput
                        type="datetime-local"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    )}
                  />
                </PropertyRow>

                {form.state.values.status === 'completed' && (
                  <PropertyRow icon={<Clock className="w-4 h-4" />} label="Session End">
                    <form.Field
                      name="end_date"
                      children={(field) => (
                        <GhostInput
                          type="datetime-local"
                          value={field.state.value || ''}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      )}
                    />
                  </PropertyRow>
                )}

                {form.state.values.status === 'watching' && (
                  <PropertyRow icon={<Clock className="w-4 h-4" />} label="Pause Position">
                    <form.Field
                      name="current_position"
                      children={(field) => (
                        <GhostInput
                          type="number"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(parseInt(e.target.value) || 0)}
                          placeholder="Seconds (e.g. 1200)"
                        />
                      )}
                    />
                  </PropertyRow>
                )}

                <PropertyRow icon={<Star className="w-4 h-4" />} label="Rating">
                  <form.Field
                    name="rating"
                    children={(field) => (
                      <div className="py-1">
                        <RatingSlider
                          value={field.state.value}
                          onChange={(value) => field.handleChange(value)}
                        />
                      </div>
                    )}
                  />
                </PropertyRow>
              </div>

              {/* Notes */}
              <div className="space-y-2 pt-4 border-t border-[#242730]">
                <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-content-muted/40 px-1">
                  <AlignLeft className="w-3.5 h-3.5" />
                  <span>Episode Thoughts</span>
                </div>

                <form.Field
                  name="notes"
                  children={(field) => (
                    <GhostTextArea
                      rows={3}
                      value={field.state.value || ''}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Reflections on this episode..."
                    />
                  )}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase text-content-muted">
                  <span>Episode Marginalia</span>
                  <span>{comments.length} note{comments.length !== 1 ? 's' : ''}</span>
                </div>

                {comments.length > 0 ? (
                  <div className="space-y-2 max-h-52 overflow-y-auto custom-scrollbar pr-1">
                    {comments.map((comment, index) => (
                      <CommentItem
                        key={comment.public_id || index}
                        comment={comment}
                        onDelete={() => removeComment(index)}
                        onUpdate={() => {
                          queryClient.invalidateQueries({ queryKey: seasonEpisodeKeys.episodeComments(episode.public_id) })
                        }}
                        showActions={true}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-6 bg-[#15161a] border border-[#2e323c] rounded-[4px] text-center font-mono text-xs text-content-muted">
                    No timestamped notes recorded yet.
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#242730]">
                <CommentForm onAdd={addComment} />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-10 py-4 border-t border-[#2e323c] flex items-center justify-between gap-4 bg-[#17181d] shrink-0">
          <button 
            type="button" 
            className="text-xs font-medium text-content-muted hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            onClick={() => closeModal(`episode-tracking-${episode.public_id}`)}
          >
            <X className="w-3.5 h-3.5" />
            <span>Discard</span>
          </button>
          <form.Subscribe
            selector={(state) => [state.isSubmitting, state.canSubmit]}
            children={([isSubmitting, canSubmit]) => (
              <button 
                form="episode-tracking-form"
                type="submit" 
                className="btn-primary px-5 py-2 text-xs flex items-center gap-1.5"
                disabled={!canSubmit || (isSubmitting as boolean)}
              >
                <Save className="w-3.5 h-3.5" />
                <span>{(isSubmitting as boolean) ? 'Saving...' : 'Save Episode'}</span>
              </button>
            )}
          />
        </div>
      </form>
    </div>
  )
}
