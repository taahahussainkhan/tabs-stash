import { useForm } from '@tanstack/react-form'
import type { SeasonCreate } from '../../types/seasonEpisode'
import { PropertyRow, GhostInput, GhostTextArea } from '../../../../shared/components/common/property-sheet'
import { addSeasonSchema, type AddSeasonSchemaData } from '../../schemas/addSeasonSchema'
import { Plus, Hash, Type, Calendar, AlignLeft, X } from 'lucide-react'

interface AddSeasonModalContentProps {
  onClose: () => void
  onSubmit: (seasonData: SeasonCreate) => Promise<void>
  existingSeasonNumbers: number[]
}

export function AddSeasonModalContent({ onClose, onSubmit, existingSeasonNumbers }: AddSeasonModalContentProps) {
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
              <span className="mono-badge mono-badge-ochre text-[9px]">SEASON STRUCTURE</span>
              <span className="text-[10px] text-content-muted uppercase tracking-wider">New Season</span>
            </div>

            <form.Field
              name="title"
              children={(field) => (
                <input
                  value={field.state.value || ''}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={`Season ${form.state.values.season_number}`}
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

            <PropertyRow icon={<Hash className="w-4 h-4" />} label="Season Number" required>
              <form.Field
                name="season_number"
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

            <PropertyRow icon={<Calendar className="w-4 h-4" />} label="Release Year">
              <form.Field
                name="year"
                children={(field) => (
                  <GhostInput
                    type="number"
                    value={field.state.value ?? ''}
                    onChange={(e) => field.handleChange(e.target.value === '' ? undefined : e.target.valueAsNumber)}
                    placeholder="e.g. 2024"
                    min={1900}
                    max={2030}
                  />
                )}
              />
            </PropertyRow>

            <PropertyRow icon={<Hash className="w-4 h-4" />} label="Episode Count">
              <form.Field
                name="episode_count"
                children={(field) => (
                  <GhostInput
                    type="number"
                    value={field.state.value ?? ''}
                    onChange={(e) => field.handleChange(e.target.value === '' ? undefined : e.target.valueAsNumber)}
                    placeholder="e.g. 10"
                    min={0}
                  />
                )}
              />
            </PropertyRow>
          </div>

          {/* Notes */}
          <div className="space-y-2 pt-4 border-t border-[#242730]">
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-content-muted/40 px-1">
              <AlignLeft className="w-3.5 h-3.5" />
              <span>Season Impressions &amp; Notes</span>
            </div>

            <form.Field
              name="notes"
              children={(field) => (
                <GhostTextArea
                  value={field.state.value || ''}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Broadcast notes, story arc reflections..."
                  rows={3}
                />
              )}
            />
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
                <span>{isSubmitting ? 'Adding...' : 'Add Season'}</span>
              </button>
            )}
          />
        </div>
      </form>
    </div>
  )
}
