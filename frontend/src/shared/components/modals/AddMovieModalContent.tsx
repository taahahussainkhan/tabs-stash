import { useForm } from '@tanstack/react-form'
import { Trash2, Play, CheckCircle, Pause, RotateCcw, Plus, Film, User, Calendar, Image, Monitor, Tag, Star, Clock, AlignLeft, X } from 'lucide-react'
import { movieSchema, type MovieSchemaData, getDefaultMovieValues } from '../../../features/movies/schemas/movieSchema'
import { platformOptions } from '../../../shared/constants/platformOptions'
import { buildYearOptions } from '../../../shared/constants/yearOptions'
import type { MovieLog } from '../../../features/movies/types/movie'
import { useConfirmation } from '../../hooks/useConfirmation'
import { PropertyRow, GhostInput, GhostSelect, GhostTextArea } from '../common/property-sheet'
import { RatingSlider } from '../common/form/RatingSlider'
import { GenreSelector } from '../common/form/GenreSelector'

interface AddMovieModalContentProps {
  onClose: () => void
  onSubmit: (movie: MovieSchemaData) => Promise<void>
  onDelete?: (movieId: string) => Promise<void>
  editingMovie?: MovieLog
  mode?: 'add' | 'edit' | 'rewatch'
  type?: 'movie' | 'series'
}

export function AddMovieModalContent({ onClose, onSubmit, onDelete, editingMovie, mode = 'add', type = 'movie' }: AddMovieModalContentProps) {
  const { confirm } = useConfirmation()
  const form = useForm<MovieSchemaData>({
    defaultValues: getDefaultMovieValues(editingMovie),
    validators: {
      onChange: movieSchema,
    },
    onSubmit: async ({ value }) => {
      const submissionData = {
        ...value,
        is_rewatch: value.status === 'rewatching',
      }
      await onSubmit(submissionData as MovieSchemaData)
      if (!editingMovie) {
        form.reset()
      }
      onClose()
    },
  })

  const yearOptions = buildYearOptions({ startYear: 1900 })

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
          {/* Top Title - Notion Style */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2 font-mono">
              <span className="mono-badge mono-badge-cyan text-[9px]">
                {type === 'series' ? 'TELEVISION' : 'CINEMA'}
              </span>
              <span className="text-[10px] text-content-muted uppercase tracking-wider">
                {editingMovie ? 'Edit Record' : 'New Entry'}
              </span>
            </div>

            <form.Field
              name="title"
              children={(field) => (
                <input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Untitled Cinema Log"
                  className="w-full text-2xl sm:text-4xl font-bold bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-0 text-content-primary placeholder:text-content-muted/20"
                  autoFocus
                  required
                />
              )}
            />
          </div>

          {/* Properties Sheet */}
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-content-muted/40 mb-2 px-1">
              Properties
            </div>

            {/* Status Selector */}
            <PropertyRow icon={<Play className="w-4 h-4" />} label="Status" required>
              <form.Field
                name="status"
                children={(field) => {
                  const status = field.state.value
                  const options = [
                    { value: 'watching', label: 'Watching', icon: Play, active: 'bg-[#0f2e2b] text-[#2dd4bf] border-[#134e4a]' },
                    { value: 'completed', label: 'Completed', icon: CheckCircle, active: 'bg-[#143324] text-[#4ade80] border-[#1e593a]' },
                    { value: 'paused', label: 'Paused', icon: Pause, active: 'bg-[#3b2c12] text-[#fbbf24] border-[#78350f]' },
                    { value: 'rewatching', label: 'Rewatch', icon: RotateCcw, active: 'bg-[#3b1c18] text-[#ff7b68] border-[#991b1b]' },
                  ]

                  return (
                    <div className="flex flex-wrap gap-1.5 py-1">
                      {options.map((opt) => {
                        const Icon = opt.icon
                        const isActive = status === opt.value
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => field.handleChange(opt.value as any)}
                            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-[3px] border font-mono text-xs transition-colors cursor-pointer ${
                              isActive
                                ? opt.active
                                : 'bg-[#15161a] border-[#2e323c] text-content-muted hover:text-white'
                            }`}
                          >
                            <Icon className="w-3 h-3" />
                            <span>{opt.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  )
                }}
              />
            </PropertyRow>

            {/* Year */}
            <PropertyRow icon={<Calendar className="w-4 h-4" />} label="Release Year">
              <form.Field
                name="year"
                children={(field) => (
                  <GhostSelect
                    value={field.state.value == null ? '' : String(field.state.value)}
                    options={yearOptions}
                    onChange={(e) => field.handleChange(e.target.value === '' ? null : Number(e.target.value))}
                    placeholder="Empty (Select Year)"
                  />
                )}
              />
            </PropertyRow>

            {/* Director / Creator */}
            <PropertyRow icon={<User className="w-4 h-4" />} label={type === 'series' ? 'Creator' : 'Director'}>
              <form.Field
                name="director"
                children={(field) => (
                  <GhostInput
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g. Christopher Nolan"
                  />
                )}
              />
            </PropertyRow>

            {/* Platform */}
            <PropertyRow icon={<Monitor className="w-4 h-4" />} label="Platform">
              <form.Field
                name="platform"
                children={(field) => (
                  <GhostSelect
                    value={field.state.value}
                    options={platformOptions}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Empty (Service / Medium)"
                  />
                )}
              />
            </PropertyRow>

            {/* Genre */}
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

            {/* Start Date */}
            <PropertyRow icon={<Clock className="w-4 h-4" />} label="Date Started">
              <form.Field
                name="start_date"
                children={(field) => (
                  <GhostInput
                    type="datetime-local"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              />
            </PropertyRow>

            {/* Poster URL */}
            <PropertyRow icon={<Image className="w-4 h-4" />} label="Poster Image">
              <form.Field
                name="poster_image"
                children={(field) => (
                  <GhostInput
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="https://images.example.com/poster.jpg"
                  />
                )}
              />
            </PropertyRow>

            {/* End Date & Rating for completed */}
            <form.Subscribe
              selector={(state) => state.values.status}
              children={(status) => (status === 'completed' || status === 'rewatching') && (
                <div className="space-y-0.5 animate-in fade-in duration-150">
                  <PropertyRow icon={<Clock className="w-4 h-4" />} label="Date Finished">
                    <form.Field
                      name="end_date"
                      children={(field) => (
                        <GhostInput
                          type="datetime-local"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      )}
                    />
                  </PropertyRow>

                  <PropertyRow icon={<Star className="w-4 h-4" />} label="Rating">
                    <form.Field
                      name="rating"
                      children={(field) => (
                        <div className="py-1">
                          <RatingSlider
                            value={field.state.value ?? 0}
                            onChange={(v) => field.handleChange(v)}
                          />
                        </div>
                      )}
                    />
                  </PropertyRow>
                </div>
              )}
            />
          </div>

          {/* Notes / Marginalia Section */}
          <div className="space-y-2 pt-4 border-t border-[#242730]">
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-content-muted/40 px-1">
              <AlignLeft className="w-3.5 h-3.5" />
              <span>Notes &amp; Marginalia</span>
            </div>

            <form.Field
              name="notes"
              children={(field) => (
                <GhostTextArea
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Capture reflections, memorable dialogue, thoughts..."
                  rows={3}
                />
              )}
            />
          </div>
        </div>

        {/* Action Footer */}
        <div className="px-6 sm:px-10 py-4 border-t border-[#2e323c] flex items-center justify-between gap-4 bg-[#17181d] shrink-0">
          {editingMovie && onDelete ? (
            <button
              type="button"
              onClick={() => confirm({
                title: 'Delete Entry',
                message: 'Are you sure you want to delete this archive log?',
                confirmText: 'Delete Log',
                variant: 'danger',
                onConfirm: () => onDelete(editingMovie.public_id || editingMovie.id).then(onClose)
              })}
              className="text-xs font-mono font-bold text-danger hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Log</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-medium text-content-muted hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Discard</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="btn-primary px-5 py-2 text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{mode === 'edit' ? 'Update Record' : 'Save Record'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
