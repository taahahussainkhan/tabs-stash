import { useForm } from '@tanstack/react-form'
import { X } from 'lucide-react'
import { useBulkCreateEpisodesMutation, type EpisodeBulkCreate } from '../../../services/seasonEpisodeService'
import { Input } from '../../../shared/components/common/form/Input'
import { bulkAddEpisodesSchema, type BulkAddEpisodesSchemaData } from '../schemas/bulkAddEpisodesSchema'

interface BulkAddEpisodesModalProps {
  seasonPublicId: string
  seriesPublicId: string
  onClose: () => void
}

export function BulkAddEpisodesModal({ seasonPublicId, seriesPublicId, onClose }: BulkAddEpisodesModalProps) {
  const bulkCreateMutation = useBulkCreateEpisodesMutation(seasonPublicId, seriesPublicId)

  const form = useForm<BulkAddEpisodesSchemaData>({
    defaultValues: {
      start_episode: 1,
      end_episode: 10,
    } satisfies BulkAddEpisodesSchemaData,
    validators: {
      onChange: bulkAddEpisodesSchema,
    },
    onSubmit: async ({ value }) => {
      await bulkCreateMutation.mutateAsync(value as EpisodeBulkCreate)
      onClose()
    },
  })

  const episodeCount = form.state.values.end_episode - form.state.values.start_episode + 1

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Bulk Add Episodes</h3>
          <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <div className="space-y-4">
            <div className="alert alert-info">
              <span className="text-sm">
                This will create {episodeCount} episode{episodeCount !== 1 ? 's' : ''} numbered from {form.state.values.start_episode} to {form.state.values.end_episode}.
              </span>
            </div>

            <form.Field
              name="start_episode"
              children={(field) => {
                const error = field.state.meta.isTouched && !field.state.meta.isValid
                  ? field.state.meta.errors.map(String).join(', ')
                  : undefined

                return (
                  <Input
                    label="Start Episode Number *"
                    type="number"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.valueAsNumber)}
                    onBlur={field.handleBlur}
                    min={1}
                    required
                    error={error}
                  />
                )
              }}
            />

            <form.Field
              name="end_episode"
              children={(field) => {
                const error = field.state.meta.isTouched && !field.state.meta.isValid
                  ? field.state.meta.errors.map(String).join(', ')
                  : undefined

                return (
                  <Input
                    label="End Episode Number *"
                    type="number"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.valueAsNumber)}
                    onBlur={field.handleBlur}
                    min={1}
                    required
                    error={error}
                  />
                )
              }}
            />
          </div>

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting] as const}
              children={([canSubmit, isSubmitting]) => (
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={bulkCreateMutation.isPending || isSubmitting || !canSubmit}
                >
                  {bulkCreateMutation.isPending || isSubmitting
                    ? 'Creating...'
                    : `Create ${episodeCount} Episode${episodeCount !== 1 ? 's' : ''}`}
                </button>
              )}
            />
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  )
}
