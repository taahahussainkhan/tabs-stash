import { useState } from 'react'
import { Edit2, Trash2, Save, X } from 'lucide-react'
import { useUpdateCommentMutation, useDeleteCommentMutation } from '../../../services/commentService'
import { NumberInput } from './form/NumberInput'
import { Textarea } from './form/Textarea'
import { useConfirmation } from '../../hooks/useConfirmation'
import { formatSecondsAsClock } from '../../utils/time'

interface CommentItemProps {
  comment: {
    public_id?: string
    timestamp: number
    duration?: number
    text: string
  }
  onDelete?: () => void
  onUpdate?: () => void
  showActions?: boolean
}

export function CommentItem({ comment, onDelete, onUpdate, showActions = true }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState(comment.text)
  const [editedTimestamp, setEditedTimestamp] = useState(comment.timestamp.toString())
  const [editedDuration, setEditedDuration] = useState(comment.duration?.toString() || '')
  const { confirm } = useConfirmation()

  const updateMutation = useUpdateCommentMutation(() => {
    setIsEditing(false)
    onUpdate?.()
  })

  const deleteMutation = useDeleteCommentMutation(() => {
    onDelete?.()
  })

  const handleSave = () => {
    if (!comment.public_id) return

    updateMutation.mutate({
      commentPublicId: comment.public_id,
      data: {
        content: editedText,
        timestamp: parseFloat(editedTimestamp) || 0,
        chapter_or_episode: editedDuration ? editedDuration : null,
        is_spoiler: false,
      },
    })
  }

  const handleDelete = () => {
    if (!comment.public_id) return

    confirm({
      title: 'Delete Comment',
      message: 'Are you sure you want to delete this comment? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: () => {
        deleteMutation.mutate(comment.public_id!)
      },
    })
  }

  const handleCancel = () => {
    setEditedText(comment.text)
    setEditedTimestamp(comment.timestamp.toString())
    setEditedDuration(comment.duration?.toString() || '')
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="bg-base-200 rounded-lg p-4 border-2 border-primary">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NumberInput
              label="Timestamp (seconds)"
              labelSize="sm"
              size="sm"
              placeholder="Timestamp (seconds)"
              min={0}
              step={1}
              value={editedTimestamp}
              onChange={(e) => setEditedTimestamp(e.target.value)}
            />
            <NumberInput
              label="Duration (optional)"
              labelSize="sm"
              size="sm"
              placeholder="Duration (optional)"
              min={0}
              step={1}
              value={editedDuration}
              onChange={(e) => setEditedDuration(e.target.value)}
              helperText="In seconds"
            />
          </div>

          <Textarea
            label="Comment"
            labelSize="sm"
            size="sm"
            rows={3}
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
          />

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-ghost btn-sm gap-1"
              disabled={updateMutation.isPending}
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn btn-primary btn-sm gap-1"
              disabled={updateMutation.isPending || !editedText.trim()}
            >
              <Save className="w-4 h-4" />
              {updateMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-base-200 rounded-lg p-3 relative group">
      {showActions && comment.public_id && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="btn btn-ghost btn-xs text-info hover:text-info/80"
            title="Edit comment"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="btn btn-ghost btn-xs text-error hover:text-error/80"
            disabled={deleteMutation.isPending}
            title="Delete comment"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
      <div className={showActions && comment.public_id ? 'pr-16' : ''}>
        <div className="text-xs text-base-content/60 mb-1">
          {comment.timestamp > 0 && `At ${formatSecondsAsClock(comment.timestamp)}`}
          {comment.duration && ` (${formatSecondsAsClock(comment.duration)})`}
        </div>
        <div className="text-sm text-base-content whitespace-pre-wrap">{comment.text}</div>
      </div>
    </div>
  )
}
