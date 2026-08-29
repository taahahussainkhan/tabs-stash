import { useMemo, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Plus, Trash2, ArrowRight, Save, User, Calendar, Tag, Layers, X } from 'lucide-react'
import type { SeasonStructure } from '../../types/series'
import { PropertyRow, GhostInput } from '../../../../shared/components/common/property-sheet'
import { GenreSelector } from '../../../../shared/components/common/form/GenreSelector'
import { addSeriesWithStructureSchema, type AddSeriesWithStructureSchemaData } from '../../schemas/addSeriesWithStructureSchema'

export interface AddSeriesModalContentProps {
  onClose: () => void
  onSubmit: (data: {
    title: string
    creator?: string
    year?: number
    genre?: string
    seasons: SeasonStructure[]
  }) => Promise<void>
}

export function AddSeriesModalContent({ onClose, onSubmit }: AddSeriesModalContentProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const initialYear = useMemo(() => new Date().getFullYear(), [])

  const form = useForm<AddSeriesWithStructureSchemaData>({
    defaultValues: {
      title: '',
      creator: '',
      year: initialYear,
      genre: '',
      seasons: [
        { season_number: 1, episode_count: 10, title: '', year: initialYear },
      ],
    } as AddSeriesWithStructureSchemaData,
    validators: {
      onChange: addSeriesWithStructureSchema,
    },
    onSubmit: async ({ value }) => {
      if (step === 1) {
        setStep(2)
        return
      }

      await onSubmit({
        title: value.title,
        creator: value.creator || undefined,
        year: value.year || undefined,
        genre: value.genre || undefined,
        seasons: value.seasons.map((s) => ({
          season_number: s.season_number,
          episode_count: s.episode_count,
          title: s.title || undefined,
          year: s.year || undefined,
        })) as SeasonStructure[],
      })

      onClose()
    },
  })

  const totalEpisodes = form.state.values.seasons.reduce((sum, s) => sum + s.episode_count, 0)

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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono">
                <span className="mono-badge mono-badge-ochre text-[9px]">TELEVISION</span>
                <span className="text-[10px] text-content-muted uppercase tracking-wider">Series Registration</span>
              </div>
              <div className="flex items-center gap-1.5 p-0.5 bg-[#15161a] rounded-[4px] border border-[#2e323c] font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className={`px-2.5 py-0.5 rounded-[3px] font-semibold transition-colors cursor-pointer ${
                    step === 1
                      ? 'bg-[#1e2026] text-accent-ochre border border-accent-ochre/30'
                      : 'text-content-muted hover:text-white'
                  }`}
                >
                  1. Info
                </button>
                <button
                  type="button"
                  disabled={!form.state.canSubmit}
                  onClick={() => setStep(2)}
                  className={`px-2.5 py-0.5 rounded-[3px] font-semibold transition-colors cursor-pointer ${
                    step === 2
                      ? 'bg-[#1e2026] text-accent-ochre border border-accent-ochre/30'
                      : 'text-content-muted hover:text-white disabled:opacity-40'
                  }`}
                >
                  2. Seasons ({form.state.values.seasons.length})
                </button>
              </div>
            </div>

            <form.Field
              name="title"
              children={(field) => (
                <input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Untitled Television Series"
                  className="w-full text-2xl sm:text-4xl font-bold bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-0 text-content-primary placeholder:text-content-muted/20"
                  autoFocus
                  required
                />
              )}
            />
          </div>

          {step === 1 ? (
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-content-muted/40 mb-2 px-1">
                Properties
              </div>

              <PropertyRow icon={<User className="w-4 h-4" />} label="Creator / Showrunner">
                <form.Field
                  name="creator"
                  children={(field) => (
                    <GhostInput
                      value={field.state.value || ''}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g. Dan Erickson"
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
                      placeholder="e.g. 2022"
                      min={1900}
                      max={2030}
                    />
                  )}
                />
              </PropertyRow>

              <PropertyRow icon={<Tag className="w-4 h-4" />} label="Genre">
                <form.Field
                  name="genre"
                  children={(field) => (
                    <div className="py-1">
                      <GenreSelector
                        value={field.state.value || ''}
                        onChange={(v) => field.handleChange(v)}
                      />
                    </div>
                  )}
                />
              </PropertyRow>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 rounded-[4px] bg-[#15161a] border border-[#2e323c] font-mono text-xs">
                <div className="flex items-center gap-2 text-accent-ochre font-bold mb-0.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Season Architecture</span>
                </div>
                <p className="text-[11px] text-content-muted">
                  Auto-creating {form.state.values.seasons.length} season{form.state.values.seasons.length !== 1 ? 's' : ''}, {totalEpisodes} episode{totalEpisodes !== 1 ? 's' : ''}.
                </p>
              </div>

              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
                <form.Field
                  name="seasons"
                  children={(field) => (
                    <div className="space-y-2">
                      {field.state.value.map((season, index) => (
                        <div key={index} className="p-3 rounded-[4px] bg-[#15161a] border border-[#2e323c] space-y-2 relative group">
                          <div className="grid grid-cols-2 gap-3">
                            <PropertyRow label="Season #">
                              <GhostInput
                                type="number"
                                value={season.season_number}
                                onChange={(e) => {
                                  const next = [...field.state.value]
                                  next[index] = { ...next[index], season_number: Number(e.target.value) }
                                  field.handleChange(next)
                                }}
                                min={1}
                              />
                            </PropertyRow>

                            <PropertyRow label="Episodes">
                              <GhostInput
                                type="number"
                                value={season.episode_count}
                                onChange={(e) => {
                                  const next = [...field.state.value]
                                  next[index] = { ...next[index], episode_count: Number(e.target.value) }
                                  field.handleChange(next)
                                }}
                                min={1}
                              />
                            </PropertyRow>
                          </div>

                          <PropertyRow label="Subtitle (opt)">
                            <GhostInput
                              placeholder={`Season ${season.season_number}`}
                              value={season.title || ''}
                              onChange={(e) => {
                                const next = [...field.state.value]
                                next[index] = { ...next[index], title: e.target.value }
                                field.handleChange(next)
                              }}
                            />
                          </PropertyRow>

                          {field.state.value.length > 1 && (
                            <button
                              type="button"
                              className="absolute top-2 right-2 p-1 text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => {
                                field.handleChange(field.state.value.filter((_, i) => i !== index))
                              }}
                              title="Remove season"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}

                      <button
                        type="button"
                        className="w-full py-2.5 rounded-[4px] border border-dashed border-[#2e323c] text-content-secondary hover:text-white hover:border-[#424856] bg-[#15161a] transition-colors flex items-center justify-center gap-1.5 text-xs font-mono"
                        onClick={() => {
                          const maxSeason = Math.max(...field.state.value.map((s) => s.season_number), 0)
                          field.handleChange([
                            ...field.state.value,
                            { season_number: maxSeason + 1, episode_count: 10, title: '', year: initialYear },
                          ])
                        }}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Season</span>
                      </button>
                    </div>
                  )}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="px-6 sm:px-10 py-4 border-t border-[#2e323c] flex items-center justify-between gap-4 bg-[#17181d] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-medium text-content-muted hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Discard</span>
          </button>

          <div className="flex items-center gap-2">
            {step === 2 && (
              <button
                type="button"
                className="btn-secondary px-3.5 py-1.5 text-xs font-semibold"
                onClick={() => setStep(1)}
              >
                Back
              </button>
            )}
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting] as const}
              children={([canSubmit, isSubmitting]) => (
                <button
                  type="submit"
                  disabled={isSubmitting || !canSubmit}
                  className="btn-primary px-5 py-2 text-xs flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    'Saving...'
                  ) : step === 1 ? (
                    <>
                      <span>Next: Seasons</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Create Series</span>
                    </>
                  )}
                </button>
              )}
            />
          </div>
        </div>
      </form>
    </div>
  )
}
