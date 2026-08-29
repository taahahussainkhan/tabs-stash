import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { NumberInput } from '../../../shared/components/common/form/NumberInput'
import { Textarea } from '../../../shared/components/common/form/Textarea'
import { formatSecondsAsClock } from '../../../shared/utils/time'

interface CommentsSectionProps {
  comments: Array<{
    id: string
    timestamp: number
    duration?: number
    text: string
    created_at?: string
  }>
  onChange: (comments: CommentsSectionProps['comments']) => void
}

export function CommentsSection({ comments, onChange }: CommentsSectionProps) {
  const [newComment, setNewComment] = useState({
    timestamp: '',
    duration: '',
    text: ''
  })

  const addComment = () => {
    if (newComment.text.trim()) {
      const comment = {
        id: crypto.randomUUID(),
        timestamp: parseFloat(newComment.timestamp) || 0,
        duration: parseFloat(newComment.duration) || undefined,
        text: newComment.text.trim(),
        created_at: new Date().toISOString()
      }
      
      onChange([...comments, comment])
      setNewComment({ timestamp: '', duration: '', text: '' })
    }
  }

  const removeComment = (id: string) => {
    onChange(comments.filter(comment => comment.id !== id))
  }


  return (
    <div className="space-y-4">
      {/* Existing Comments */}
      {comments.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-base-content/70">Comments ({comments.length})</h4>
          {comments.map((comment) => (
            <div key={comment.id} className="bg-base-200 rounded-lg p-3 relative">
              <button
                type="button"
                onClick={() => removeComment(comment.id)}
                className="absolute top-2 right-2 text-error hover:text-error/80"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="pr-8">
                <div className="text-xs text-base-content/60 mb-1">
                  {comment.timestamp > 0 && `At ${formatSecondsAsClock(comment.timestamp)}`}
                  {comment.duration && ` (${formatSecondsAsClock(comment.duration)})`}
                </div>
                <div className="text-sm text-base-content">{comment.text}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Comment */}
      <div className="border border-base-300 rounded-lg p-3">
        <h4 className="font-medium text-sm text-base-content/70 mb-3">Add Comment</h4>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="w-[30%]">
              <NumberInput
                label="Timestamp (seconds)"
                labelSize="sm"
                size="md"
                rounded="lg"
                placeholder="Timestamp (seconds)"
                                min={0}
                step={1}
                value={newComment.timestamp}
                onChange={(e) => setNewComment({ ...newComment, timestamp: e.target.value })}
              />
            </div>
            <div className="w-[30%]">
              <NumberInput
                label="Duration (seconds)"
                labelSize="sm"
                size="md"
                rounded="lg"
                placeholder="Duration (seconds)"
                                min={0}
                step={1}
                value={newComment.duration}
                onChange={(e) => setNewComment({ ...newComment, duration: e.target.value })}
              />
            </div>
          </div>
          <Textarea
            label="Comment"
            labelSize="sm"
            size="md"
            rounded="lg"
            placeholder="Your comment about this part..."
                        value={newComment.text}
            onChange={(e) => setNewComment({ ...newComment, text: e.target.value })}
            rows={3}
          />
          <button
            type="button"
            onClick={addComment}
            className="btn btn-sm btn-primary"
            disabled={!newComment.text.trim()}
          >
            <Plus className="w-4 h-4" />
            Add Comment
          </button>
        </div>
      </div>
    </div>
  )
}
