import { useState } from 'react'
import { Plus, Trash2, Save, MessageSquare, Clock, AlignLeft, X } from 'lucide-react'
import { formatSecondsAsClock } from '../../../../shared/utils/time'
import { useSaveEpisodeCommentsMutation } from '../../../../services/seasonEpisodeService'
import type { EpisodeCommentData } from '../../types/seasonEpisode'
import { PropertyRow, GhostInput, GhostTextArea } from '../../../../shared/components/common/property-sheet'

interface AddEpisodeCommentsModalContentProps {
  episodePublicId: string
  episodeTitle: string
  episodeNumber: number
  existingComments?: EpisodeCommentData[]
  onClose: () => void
}

export function AddEpisodeCommentsModalContent({
  episodePublicId,
  episodeTitle,
  episodeNumber,
  existingComments = [],
  onClose,
}: AddEpisodeCommentsModalContentProps) {
  const [comments, setComments] = useState<EpisodeCommentData[]>(existingComments)
  const [timestamp, setTimestamp] = useState<string>('')
  const [duration, setDuration] = useState<string>('')
  const [text, setText] = useState<string>('')

  const saveMutation = useSaveEpisodeCommentsMutation()

  const handleAddComment = () => {
    const trimmed = text.trim()
    if (!trimmed) return

    const newComment: EpisodeCommentData = {
      timestamp: parseFloat(timestamp) || 0,
      duration: duration ? parseFloat(duration) : undefined,
      text: trimmed,
    }

    setComments((prev) => [...prev, newComment])
    setTimestamp('')
    setDuration('')
    setText('')
  }

  const handleRemoveComment = (index: number) => {
    setComments((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    await saveMutation.mutateAsync({
      episodePublicId,
      comments,
    })
    onClose()
  }

  return (
    <div className="flex flex-col h-full bg-[#1e2026]">
      <div className="p-6 sm:p-10 flex-1 overflow-y-auto custom-scrollbar space-y-6">
        {/* Title */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2 font-mono">
            <span className="mono-badge mono-badge-cyan text-[9px]">EPISODE {episodeNumber}</span>
            <span className="text-[10px] text-content-muted uppercase tracking-wider">{episodeTitle}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight">
            Episode Marginalia &amp; Notes
          </h2>
        </div>

        {/* Existing Comments */}
        {comments.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase text-content-muted">
              <span>Recorded Notes</span>
              <span>{comments.length} item{comments.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
              {comments.map((comment, index) => (
                <div key={index} className="bg-[#15161a] border border-[#2e323c] rounded-[4px] p-2.5 relative group">
                  <button
                    type="button"
                    onClick={() => handleRemoveComment(index)}
                    className="absolute top-2 right-2 p-1 text-content-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="pr-6">
                    <div className="text-[10px] font-mono text-accent-cyan font-bold mb-0.5">
                      {comment.timestamp > 0 && `At ${formatSecondsAsClock(comment.timestamp)}`}
                      {comment.duration && ` (${formatSecondsAsClock(comment.duration)})`}
                    </div>
                    <div className="text-xs text-content-secondary leading-relaxed">{comment.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Note Section */}
        <div className="space-y-0.5 pt-2">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-content-muted/40 mb-2 px-1">
            New Timestamp Note
          </div>

          <PropertyRow icon={<Clock className="w-4 h-4" />} label="Timestamp (Seconds)">
            <GhostInput
              type="number"
              placeholder="0"
              min={0}
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
            />
          </PropertyRow>

          <PropertyRow icon={<Clock className="w-4 h-4" />} label="Duration (Seconds)">
            <GhostInput
              type="number"
              placeholder="Optional duration"
              min={0}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </PropertyRow>

          <div className="space-y-2 pt-3 border-t border-[#242730]">
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-content-muted/40 px-1">
              <AlignLeft className="w-3.5 h-3.5" />
              <span>Observation Text</span>
            </div>

            <GhostTextArea
              placeholder="What occurred in the episode at this moment?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleAddComment}
              disabled={!text.trim()}
              className="btn-secondary px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Note</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 sm:px-10 py-4 border-t border-[#2e323c] flex items-center justify-between gap-4 bg-[#17181d] shrink-0">
        <button 
          type="button" 
          className="text-xs font-medium text-content-muted hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          onClick={onClose}
        >
          <X className="w-3.5 h-3.5" />
          <span>Discard</span>
        </button>

        <button 
          type="button" 
          className="btn-primary px-5 py-2 text-xs flex items-center gap-1.5" 
          onClick={handleSave}
          disabled={saveMutation.isPending || comments.length === 0}
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saveMutation.isPending ? 'Saving...' : 'Save All Notes'}</span>
        </button>
      </div>
    </div>
  )
}
