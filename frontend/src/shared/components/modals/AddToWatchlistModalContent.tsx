import { useState, useRef } from 'react'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import { Bookmark, User, Calendar, Tag, Plus, X, Sparkles } from 'lucide-react'
import { PropertyRow, GhostInput } from '../common/property-sheet'
import { addToWatchlistSchema, type AddToWatchlistSchemaData } from '../../../features/movies/schemas/addToWatchlistSchema'
import { MediaCatalogAutocomplete } from '../common/catalog/MediaCatalogAutocomplete'
import type { MediaCatalogItemDetails, MediaCatalogSeasonStructure } from '../../../services/mediaCatalogService'

interface AddToWatchlistModalContentProps {
  onClose: () => void
  onSubmit: (data: WatchlistMovieData) => Promise<void>
  type?: 'movie' | 'series'
}

export interface WatchlistMovieData {
  title: string
  director?: string
  year?: number
  genre?: string
  posterImage?: string
  overview?: string
  externalId?: string
  seasons?: MediaCatalogSeasonStructure[]
}

export function AddToWatchlistModalContent({ onClose, onSubmit, type = 'movie' }: AddToWatchlistModalContentProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false)
  const [catalogSeasons, setCatalogSeasons] = useState<MediaCatalogSeasonStructure[]>([])
  const [posterUrl, setPosterUrl] = useState<string | null>(null)
  const [overview, setOverview] = useState<string | null>(null)
  const [catalogExternalId, setCatalogExternalId] = useState<string | null>(null)
  const titleContainerRef = useRef<HTMLDivElement>(null)

  const handleCatalogSelect = (details: MediaCatalogItemDetails) => {
    form.setFieldValue('title', details.title)
    setSearchQuery(details.title)
    setCatalogExternalId(details.id)
    if (details.creator) {
      form.setFieldValue('director', details.creator)
    }
    if (details.year) {
      form.setFieldValue('year', details.year)
    }
    if (details.genres && details.genres.length > 0) {
      form.setFieldValue('genre', details.genres.join(', '))
    }
    if (details.seasons && details.seasons.length > 0) {
      setCatalogSeasons(details.seasons)
    }
    if (details.posterUrl) {
      setPosterUrl(details.posterUrl)
    }
    if (details.overview) {
      setOverview(details.overview)
    }
    setIsAutocompleteOpen(false)
    const seasonsCount = details.seasons?.length || 0
    const suffix = type === 'series' && seasonsCount > 0 ? ` with ${seasonsCount} seasons` : ''
    toast.success(`Populated "${details.title}"${suffix} from catalog`, { icon: '✨' })
  }

  const form = useForm({
    defaultValues: {
      title: '',
      director: '',
      year: null,
      genre: '',
    } as AddToWatchlistSchemaData,
    validators: {
      onChange: addToWatchlistSchema,
    },
    onSubmit: async ({ value }) => {
      const payload: WatchlistMovieData = {
        title: value.title,
        director: value.director || undefined,
        year: value.year ?? undefined,
        genre: value.genre || undefined,
        posterImage: posterUrl || undefined,
        overview: overview || undefined,
        externalId: catalogExternalId || undefined,
        seasons: catalogSeasons.length > 0 ? catalogSeasons : undefined,
      }
      await onSubmit(payload)
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
              <span className="mono-badge mono-badge-vermillion text-[9px]">
                QUEUE &bull; {type === 'series' ? 'TELEVISION' : 'CINEMA'}
              </span>
              <span className="text-[10px] text-content-muted uppercase tracking-wider">
                Watchlist Queue
              </span>
            </div>

            <div ref={titleContainerRef} className="relative z-30">
              <div className="flex items-center justify-between gap-2">
                <form.Field
                  name="title"
                  children={(field) => (
                    <input
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
                      placeholder={type === 'series' ? 'Untitled Series to Watch' : 'Untitled Movie to Watch'}
                      className="w-full text-2xl sm:text-4xl font-bold bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-0 text-content-primary placeholder:text-content-muted/20"
                      autoFocus
                      required
                    />
                  )}
                />

                <button
                  type="button"
                  onClick={() => {
                    if (searchQuery.length >= 2) {
                      setIsAutocompleteOpen((prev) => !prev)
                    } else {
                      toast.info('Type at least 2 characters to search catalog')
                    }
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#14232a] hover:bg-[#1a2f38] border border-accent-cyan/30 text-accent-cyan text-[11px] font-mono transition-colors shrink-0 cursor-pointer shadow-sm"
                  title="Search catalog to auto-fill details"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Auto-fill</span>
                </button>
              </div>

              <MediaCatalogAutocomplete
                query={searchQuery}
                type={type === 'series' ? 'series' : 'movie'}
                isOpen={isAutocompleteOpen}
                anchorRef={titleContainerRef}
                onClose={() => setIsAutocompleteOpen(false)}
                onSelect={handleCatalogSelect}
              />
            </div>
          </div>



          {type === 'series' && catalogSeasons.length > 0 && (
            <div className="p-3 rounded-[4px] bg-[#14232a] border border-accent-cyan/30 flex items-center justify-between font-mono text-xs text-accent-cyan">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
                <span>
                  {catalogSeasons.length} Seasons Cataloged ({catalogSeasons.reduce((acc, s) => acc + s.episodeCount, 0)} Total Episodes)
                </span>
              </div>
              <span className="text-[10px] text-content-muted uppercase tracking-wider">Ready to Import</span>
            </div>
          )}

          {/* Properties Sheet */}
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-content-muted/40 mb-2 px-1">
              Properties
            </div>

            <PropertyRow icon={<User className="w-4 h-4" />} label={type === 'series' ? 'Creator' : 'Director'}>
              <form.Field
                name="director"
                children={(field) => (
                  <GhostInput
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g. Denis Villeneuve"
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
                    onChange={(e) => {
                      const next = e.target.value === '' ? null : e.target.valueAsNumber
                      field.handleChange(Number.isNaN(next as number) ? null : (next as number | null))
                    }}
                    placeholder="e.g. 2024"
                    min={1900}
                    max={new Date().getFullYear() + 5}
                  />
                )}
              />
            </PropertyRow>

            <PropertyRow icon={<Tag className="w-4 h-4" />} label="Genre">
              <form.Field
                name="genre"
                children={(field) => (
                  <GhostInput
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g. Sci-Fi, Drama"
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
                <Bookmark className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Queueing...' : 'Add to Queue'}</span>
              </button>
            )}
          />
        </div>
      </form>
    </div>
  )
}
