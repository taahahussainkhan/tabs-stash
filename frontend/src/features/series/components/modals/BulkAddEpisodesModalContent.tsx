import { useForm } from '@tanstack/react-form'
import { useBulkCreateEpisodesMutation, type EpisodeBulkCreate } from '../../../services/seasonEpisodeService'
import { PropertyRow, GhostInput } from '../../../../shared/components/common/property-sheet'
import { bulkAddEpisodesSchema, type BulkAddEpisodesSchemaData } from '../schemas/bulkAddEpisodesSchema'
import { Plus, Hash, Layers, X } from 'lucide-react'

interface BulkAddEpisodesModalContentProps {
  seasonPublicId: string
  seriesPublicId: string
  onClose: () => void
}

export function BulkAddEpisodesModalContent({ seasonPublicId, seriesPublicId, onClose }: BulkAddEpisodesModalContentProps) {
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
              <span className="mono-badge mono-badge-ochre text-[9px]">BATCH GENERATOR</span>
              <span className="text-[10px] text-content-muted uppercase tracking-wider">Episodes</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight">
              Bulk Add Episodes
            </h2>
          </div>

          <div className="p-3 rounded-[4px] bg-[#15161a] border border-[#2e323c] text-xs font-mono text-content-secondary flex items-center gap-2">
            <Layers className="w-4 h-4 text-accent-ochre shrink-0" />
            <span>
              Batch creating <span className="text-accent-ochre font-bold">{episodeCount > 0 ? episodeCount : 0} episode{episodeCount !== 1 ? 's' : ''}</span> (from episode {form.state.values.start_episode} to {form.state.values.end_episode}).
            </span>
          </div>

          {/* Properties Sheet */}
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-content-muted/40 mb-2 px-1">
              Range Properties
            </div>

            <PropertyRow icon={<Hash className="w-4 h-4" />} label="Start Episode #" required>
              <form.Field
                name="start_episode"
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

            <PropertyRow icon={<Hash className="w-4 h-4" />} label="End Episode #" required>
              <form.Field
                name="end_episode"
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
                disabled={bulkCreateMutation.isPending || isSubmitting || !canSubmit}
                className="btn-primary px-5 py-2 text-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>
                  {bulkCreateMutation.isPending || isSubmitting
                    ? 'Generating...'
                    : `Generate ${episodeCount} Episode${episodeCount !== 1 ? 's' : ''}`}
                </span>
              </button>
            )}
          />
        </div>
      </form>
    </div>
  )
}
