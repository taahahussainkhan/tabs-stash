import { useForm } from '@tanstack/react-form'
import { useCreateEpisodeMutation, type EpisodeCreate } from '../../../services/seasonEpisodeService'
import { PropertyRow, GhostInput } from '../../../../shared/components/common/property-sheet'
import { addEpisodeSchema, type AddEpisodeSchemaData } from '../schemas/addEpisodeSchema'
import { Plus, Hash, Clock, X } from 'lucide-react'

interface AddEpisodeModalContentProps {
  seasonPublicId: string
  seriesPublicId: string
  onClose: () => void
}

export function AddEpisodeModalContent({ seasonPublicId, seriesPublicId, onClose }: AddEpisodeModalContentProps) {
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
    <div className="flex flex-col h-full bg-[#1e2026]">
      <form
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
            <div className="flex items-center gap-2 mb-2 font-mono">
              <span className="mono-badge mono-badge-ochre text-[9px]">EPISODE LOG</span>
              <span className="text-[10px] text-content-muted uppercase tracking-wider">New Episode</span>
            </div>

            <form.Field
              name="title"
              children={(field) => (
                <input
                  value={field.state.value || ''}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={`Episode ${form.state.values.episode_number}`}
                  className="w-full text-2xl sm:text-4xl font-bold bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-0 text-content-primary placeholder:text-content-muted/20"
                  autoFocus
                />
              )}
            />
          </div>

          {/* Properties Sheet */}
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-content-muted/40 mb-2 px-1">
              Properties
            </div>

            <PropertyRow icon={<Hash className="w-4 h-4" />} label="Episode Number" required>
              <form.Field
                name="episode_number"
                children={(field) => (
                  <GhostInput
                    type="number"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.valueAsNumber)}
                    min={1}
                  />
                )}
              />
            </PropertyRow>

            <PropertyRow icon={<Clock className="w-4 h-4" />} label="Duration (Minutes)">
              <form.Field
                name="duration"
                children={(field) => (
                  <GhostInput
                    type="number"
                    value={field.state.value ?? ''}
                    onChange={(e) => field.handleChange(e.target.value === '' ? undefined : e.target.valueAsNumber)}
                    placeholder="e.g. 55"
                    min={1}
                  />
                )}
              />
            </PropertyRow>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-10 py-4 border-t border-[#2e323c] flex items-center justify-between gap-4 bg-[#17181d] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-medium text-content-muted hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Discard</span>
          </button>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting] as const}
            children={([canSubmit, isSubmitting]) => (
              <button
                type="submit"
                disabled={isSubmitting || !canSubmit}
                className="btn-primary px-5 py-2 text-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Saving...' : 'Add Episode'}</span>
              </button>
            )}
          />
        </div>
      </form>
    </div>
  )
}
