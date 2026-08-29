import { useForm } from '@tanstack/react-form'
import { X } from 'lucide-react'
import type { SeasonCreate } from '../types/seasonEpisode'
import { Input } from '../../../shared/components/common/form/Input'
import { Textarea } from '../../../shared/components/common/form/Textarea'
import { addSeasonSchema, type AddSeasonSchemaData } from '../schemas/addSeasonSchema'

interface AddSeasonModalProps {
  onClose: () => void
  onSubmit: (seasonData: SeasonCreate) => Promise<void>
  existingSeasonNumbers: number[]
}

export function AddSeasonModal({ onClose, onSubmit, existingSeasonNumbers }: AddSeasonModalProps) {
  const form = useForm<AddSeasonSchemaData>({
    defaultValues: {
      season_number: Math.max(0, ...existingSeasonNumbers) + 1,
      title: '',
      year: new Date().getFullYear(),
      episode_count: undefined,
      notes: '',
    } as AddSeasonSchemaData,
    validators: {
      onChange: addSeasonSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value as SeasonCreate)
      onClose()
    },
  })

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Add New Season</h3>
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
              name="season_number"
              children={(field) => {
                const error = field.state.meta.isTouched && !field.state.meta.isValid
                  ? field.state.meta.errors.map(String).join(', ')
                  : undefined

                return (
                  <Input
                    label="Season Number *"
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
                  placeholder="e.g., The Beginning"
                                  />
              )}
            />

            <form.Field
              name="year"
              children={(field) => {
                const error = field.state.meta.isTouched && !field.state.meta.isValid
                  ? field.state.meta.errors.map(String).join(', ')
                  : undefined

                return (
                  <Input
                    label="Year (Optional)"
                    type="number"
                    value={field.state.value ?? ''}
                    onChange={(e) => field.handleChange(e.target.value === '' ? undefined : e.target.valueAsNumber)}
                    onBlur={field.handleBlur}
                    min={1900}
                    max={2030}
                                        error={error}
                  />
                )
              }}
            />

            <form.Field
              name="episode_count"
              children={(field) => {
                const error = field.state.meta.isTouched && !field.state.meta.isValid
                  ? field.state.meta.errors.map(String).join(', ')
                  : undefined

                return (
                  <Input
                    label="Expected Episode Count (Optional)"
                    type="number"
                    value={field.state.value ?? ''}
                    onChange={(e) => field.handleChange(e.target.value === '' ? undefined : e.target.valueAsNumber)}
                    onBlur={field.handleBlur}
                    min={0}
                    placeholder="e.g., 10"
                                        error={error}
                  />
                )
              }}
            />

            <form.Field
              name="notes"
              children={(field) => (
                <Textarea
                  label="Notes (Optional)"
                  rows={4}
                  value={field.state.value || ''}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Add any notes about this season..."
                                  />
              )}
            />
          </div>

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting] as const}
              children={([canSubmit, isSubmitting]) => (
                <button type="submit" className="btn btn-primary" disabled={isSubmitting || !canSubmit}>
                  {isSubmitting ? 'Creating...' : 'Create Season'}
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
