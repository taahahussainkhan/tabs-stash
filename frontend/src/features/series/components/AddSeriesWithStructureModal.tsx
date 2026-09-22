import { useMemo, useState, useRef } from 'react'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import { X, Plus, Trash2, Sparkles } from 'lucide-react'
import type { SeasonStructure } from '../types/series'
import { Input } from '../../../shared/components/common/form/Input'
import { addSeriesWithStructureSchema, type AddSeriesWithStructureSchemaData } from '../schemas/addSeriesWithStructureSchema'
import { MediaCatalogAutocomplete } from '../../../shared/components/common/catalog/MediaCatalogAutocomplete'
import type { MediaCatalogItemDetails } from '../../../services/mediaCatalogService'

interface AddSeriesWithStructureModalProps {
  onClose: () => void
  onSubmit: (data: {
    title: string
    creator?: string
    year?: number
    genre?: string
    seasons: SeasonStructure[]
  }) => Promise<void>
}

export function AddSeriesWithStructureModal({ onClose, onSubmit }: AddSeriesWithStructureModalProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false)
  const titleContainerRef = useRef<HTMLDivElement>(null)

  const initialYear = useMemo(() => new Date().getFullYear(), [])

  const form = useForm({
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

  const handleCatalogSelect = (details: MediaCatalogItemDetails) => {
    form.setFieldValue('title', details.title)
    setSearchQuery(details.title)
    if (details.creator) {
      form.setFieldValue('creator', details.creator)
    }
    if (details.year) {
      form.setFieldValue('year', details.year)
    }
    if (details.genres && details.genres.length > 0) {
      form.setFieldValue('genre', details.genres.join(', '))
    }
    if (details.seasons && details.seasons.length > 0) {
      form.setFieldValue(
        'seasons',
        details.seasons.map((s) => ({
          season_number: s.seasonNumber,
          episode_count: s.episodeCount,
          title: s.title || '',
          year: s.year || details.year || initialYear,
        }))
      )
    }
    setIsAutocompleteOpen(false)
    toast.success(
      `Populated "${details.title}" with ${details.seasons?.length || 0} seasons from catalog`,
      { icon: '✨' }
    )
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">
            {step === 1 ? 'Add New Series - Basic Info' : 'Add New Series - Season Structure'}
          </h3>
          <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`badge ${step === 1 ? 'badge-primary' : 'badge-success'}`}>
            1. Basic Info
          </div>
          <div className="flex-1 h-px bg-base-300" />
          <div className={`badge ${step === 2 ? 'badge-primary' : 'badge-ghost'}`}>
            2. Season Structure
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            void form.handleSubmit()
          }}
        >
        {step === 1 ? (
          /* Step 1: Series Metadata */
          <div className="space-y-4">
            <div ref={titleContainerRef} className="relative z-30">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <form.Field
                    name="title"
                    children={(field) => {
                      const error = field.state.meta.isTouched && !field.state.meta.isValid
                        ? field.state.meta.errors.map(String).join(', ')
                        : undefined

                      return (
                        <Input
                          label="Series Title *"
                          type="text"
                          value={field.state.value}
                          onChange={(e) => {
                            field.handleChange(e.target.value)
                            setSearchQuery(e.target.value)
                            setIsAutocompleteOpen(true)
                          }}
                          onFocus={() => {
                            if (field.state.value && field.state.value.length >= 2) {
                              setSearchQuery(field.state.value)
                              setIsAutocompleteOpen(true)
                            }
                          }}
                          onBlur={field.handleBlur}
                          placeholder="e.g., Breaking Bad"
                          autoFocus
                          error={error}
                        />
                      )
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (searchQuery.length >= 2) {
                      setIsAutocompleteOpen((prev) => !prev)
                    } else {
                      toast.info('Type at least 2 characters to search catalog')
                    }
                  }}
                  className="mb-1 flex items-center gap-1.5 px-3 py-2 rounded-[6px] bg-[#14232a] hover:bg-[#1a2f38] border border-accent-cyan/30 text-accent-cyan text-xs font-mono transition-colors shrink-0 cursor-pointer shadow-sm"
                  title="Search catalog to auto-fill details and seasons"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">Auto-fill</span>
                </button>
              </div>

              <MediaCatalogAutocomplete
                query={searchQuery}
                type="series"
                isOpen={isAutocompleteOpen && step === 1}
                anchorRef={titleContainerRef}
                onClose={() => setIsAutocompleteOpen(false)}
                onSelect={handleCatalogSelect}
              />
            </div>

            <form.Field
              name="creator"
              children={(field) => (
                <Input
                  label="Creator"
                  type="text"
                  value={field.state.value || ''}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="e.g., Vince Gilligan"
                />
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <form.Field
                name="year"
                children={(field) => (
                  <Input
                    label="Year"
                    type="number"
                    value={field.state.value ?? ''}
                    onChange={(e) => field.handleChange(e.target.value === '' ? undefined : e.target.valueAsNumber)}
                    onBlur={field.handleBlur}
                    min={1900}
                    max={2030}
                  />
                )}
              />

              <form.Field
                name="genre"
                children={(field) => (
                  <Input
                    label="Genre"
                    type="text"
                    value={field.state.value || ''}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="e.g., Crime Drama"
                  />
                )}
              />
            </div>
          </div>
        ) : (
          /* Step 2: Season Structure */
          <div className="space-y-4">
            <div className="alert alert-info">
              <span className="text-sm">
                Define your season structure. The system will auto-generate all episodes for you.
                <br />
                <strong>Total: {form.state.values.seasons.length} season{form.state.values.seasons.length !== 1 ? 's' : ''}, {totalEpisodes} episode{totalEpisodes !== 1 ? 's' : ''}</strong>
              </span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              <form.Field
                name="seasons"
                children={(field) => (
                  <>
                    {field.state.value.map((season, index) => (
                      <div key={index} className="card bg-base-200 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <Input
                                label="Season Number *"
                                labelSize="sm"
                                size="sm"
                                type="number"
                                value={season.season_number}
                                onChange={(e) => {
                                  const next = [...field.state.value]
                                  next[index] = { ...next[index], season_number: e.target.valueAsNumber }
                                  field.handleChange(next)
                                }}
                                min={1}
                              />

                              <Input
                                label="Episodes *"
                                labelSize="sm"
                                size="sm"
                                type="number"
                                value={season.episode_count}
                                onChange={(e) => {
                                  const next = [...field.state.value]
                                  next[index] = { ...next[index], episode_count: e.target.valueAsNumber }
                                  field.handleChange(next)
                                }}
                                min={1}
                              />
                            </div>

                            <Input
                              label="Title (Optional)"
                              labelSize="sm"
                              size="sm"
                              type="text"
                              value={season.title || ''}
                              onChange={(e) => {
                                const next = [...field.state.value]
                                next[index] = { ...next[index], title: e.target.value }
                                field.handleChange(next)
                              }}
                              placeholder={`Season ${season.season_number}`}
                            />
                          </div>

                          {field.state.value.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm btn-circle text-error"
                              onClick={() => {
                                field.handleChange(field.state.value.filter((_, i) => i !== index))
                              }}
                              title="Remove season"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="btn btn-outline btn-sm w-full gap-2"
                      onClick={() => {
                        const nextSeasonNumber = Math.max(...field.state.value.map((s) => s.season_number)) + 1
                        field.handleChange([
                          ...field.state.value,
                          { season_number: nextSeasonNumber, episode_count: 10, title: '', year: initialYear },
                        ])
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Add Another Season
                    </button>
                  </>
                )}
              />
            </div>
          </div>
        )}

        <div className="modal-action">
          {step === 2 && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setStep(1)}
            >
              Back
            </button>
          )}
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting] as const}
            children={([canSubmit, isSubmitting]) => (
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || !canSubmit}
              >
                {isSubmitting ? 'Creating...' : step === 1 ? 'Next' : `Create Series (${totalEpisodes} episodes)`}
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
