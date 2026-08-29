import { useEffect, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Bookmark, User, Calendar, Tag, Plus, X } from 'lucide-react'
import { PropertyRow, GhostInput } from '../common/property-sheet'
import { useCheckMovieExistsMutation } from '../../../features/movies/hooks/useMoviesQuery'
import { addToWatchlistSchema, type AddToWatchlistSchemaData } from '../../../features/movies/schemas/addToWatchlistSchema'

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
}

export function AddToWatchlistModalContent({ onClose, onSubmit, type = 'movie' }: AddToWatchlistModalContentProps) {
  const [existsWarning, setExistsWarning] = useState<string | null>(null)
  const checkMovieExistsMutation = useCheckMovieExistsMutation()

  const form = useForm<AddToWatchlistSchemaData>({
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
      }
      await onSubmit(payload)
      onClose()
    },
  })

  useEffect(() => {
    const title = form.state.values.title

    if (!title || title.trim().length < 2) {
      if (existsWarning !== null) {
        const clearTimer = setTimeout(() => setExistsWarning(null), 0)
        return () => clearTimeout(clearTimer)
      }
      return
    }

    const timer = setTimeout(async () => {
      const trimmed = title.trim()
      checkMovieExistsMutation.mutateAsync(trimmed).then(
        (result) => {
          setExistsWarning(result.exists ? `Already exists in archive (status: ${result.status})` : null)
        },
        () => {
          setExistsWarning(null)
        },
      )
    }, 500)

    return () => clearTimeout(timer)
  }, [form.state.values.title, checkMovieExistsMutation, existsWarning])

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

            <form.Field
              name="title"
              children={(field) => (
                <input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Untitled to Watch"
                  className="w-full text-2xl sm:text-4xl font-bold bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-0 text-content-primary placeholder:text-content-muted/20"
                  autoFocus
                  required
                />
              )}
            />
          </div>

          {existsWarning && (
            <div className="p-2.5 rounded-[4px] bg-[#3b2c12] border border-[#78350f] flex items-center gap-2 font-mono text-xs text-accent-ochre">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-ochre" />
              <span>{existsWarning}</span>
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
