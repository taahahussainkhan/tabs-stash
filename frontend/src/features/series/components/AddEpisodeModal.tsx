import { useForm } from '@tanstack/react-form'
import { X } from 'lucide-react'
import { useCreateEpisodeMutation, type EpisodeCreate } from '../../../services/seasonEpisodeService'
import { Input } from '../../../shared/components/common/form/Input'
import { addEpisodeSchema, type AddEpisodeSchemaData } from '../schemas/addEpisodeSchema'

interface AddEpisodeModalProps {
  seasonPublicId: string
  seriesPublicId: string
  onClose: () => void
}

export function AddEpisodeModal({ seasonPublicId, seriesPublicId, onClose }: AddEpisodeModalProps) {
  const createEpisodeMutation = useCreateEpisodeMutation(seasonPublicId, seriesPublicId)

  const form = useForm<AddEpisodeSchemaData>({
    defaultValues: {
      episode_number: 1,
      title: '',
      duration: undefined,
    } satisfies AddEpisodeSchemaData,
    validators: {
      onChange: addEpisodeSchema,
    },
    onSubmit: async ({ value }) => {
      await createEpisodeMutation.mutateAsync(value as EpisodeCreate)
      onClose()
    },
  })

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Add Episode</h3>
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
            <form.Field
              name="episode_number"
              children={(field) => {
                const error = field.state.meta.isTouched && !field.state.meta.isValid
                  ? field.state.meta.errors.map(String).join(', ')
                  : undefined

                return (
                  <Input
                    label="Episode Number *"
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
              name="title"
              children={(field) => (
                <Input
                  label="Title (Optional)"
                  type="text"
                  value={field.state.value || ''}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="e.g., Pilot"
                                  />
              )}
            />

            <form.Field
              name="duration"
              children={(field) => {
                const error = field.state.meta.isTouched && !field.state.meta.isValid
                  ? field.state.meta.errors.map(String).join(', ')
                  : undefined

                return (
                  <Input
                    label="Duration (minutes, optional)"
                    type="number"
                    value={field.state.value ?? ''}
                    onChange={(e) => field.handleChange(e.target.value === '' ? undefined : e.target.valueAsNumber)}
                    onBlur={field.handleBlur}
                    min={1}
                    placeholder="e.g., 45"
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
                  disabled={createEpisodeMutation.isPending || isSubmitting || !canSubmit}
                >
                  {createEpisodeMutation.isPending || isSubmitting ? 'Creating...' : 'Create Episode'}
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
