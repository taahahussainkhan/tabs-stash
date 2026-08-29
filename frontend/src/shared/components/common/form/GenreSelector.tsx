import { useState, useId } from 'react'
import type { KeyboardEvent } from 'react'
import { Badge, type BadgeVariant } from '../Badge'
import { Hash } from 'lucide-react'

interface Props {
  value: string
  onChange: (value: string) => void
  error?: string
  helperText?: string
  maxGenres?: number
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  label?: string
  labelSize?: 'sm' | 'md'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const GENRE_VARIANTS: BadgeVariant[] = [
  'primary',
  'accent',
  'info',
  'success',
  'secondary',
]

export function GenreSelector({
  value,
  onChange,
  error,
  helperText,
  maxGenres = 6,
  size = 'md',
  label = 'Genres',
  labelSize = 'sm',
}: Props) {
  const [inputValue, setInputValue] = useState('')
  const generatedId = useId()
  const inputId = generatedId

  // Parse genres from comma-separated string
  const genres = value ? value.split(',').map(g => g.trim()).filter(Boolean) : []

  const sizeClass = 
    size === 'xs' ? 'h-7 px-2 text-xs' : 
    size === 'sm' ? 'h-8 px-2.5 text-xs' : 
    size === 'md' ? 'h-9 px-3 text-xs' : 
    size === 'lg' ? 'h-11 px-4 text-sm' : 
    'h-9 px-3 text-xs'

  const addGenre = (genre: string) => {
    const trimmedGenre = genre.trim()
    if (!trimmedGenre) return
    if (genres.includes(trimmedGenre)) {
      setInputValue('')
      return
    }
    if (genres.length >= maxGenres) {
      setInputValue('')
      return
    }
    const newGenres = [...genres, trimmedGenre]
    onChange(newGenres.join(', '))
    setInputValue('')
  }

  const removeGenre = (index: number) => {
    const newGenres = genres.filter((_, i) => i !== index)
    onChange(newGenres.join(', '))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addGenre(inputValue)
    } else if (e.key === 'Backspace' && !inputValue && genres.length > 0) {
      removeGenre(genres.length - 1)
    }
  }

  return (
    <div className="form-control w-full group">
      <label className={`label ${labelSize === 'sm' ? 'py-1' : 'pb-1.5'} px-0.5 flex justify-between`} htmlFor={inputId}>
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-content-muted">{label}</span>
        <span className="text-[10px] font-mono text-content-muted">{genres.length}/{maxGenres}</span>
      </label>

      <div className="relative flex flex-col gap-2">
        <div className="relative flex items-center">
          <Hash className="absolute left-3 z-10 pointer-events-none text-content-muted w-3.5 h-3.5" />
          <input
            id={inputId}
            type="text"
            className={`input-modern w-full bg-[#15161a] border border-[#2e323c] rounded-[4px] focus:border-accent-vermillion text-content-primary pl-8 text-xs ${sizeClass} ${error ? 'border-danger/60 focus:border-danger' : ''}`}
            placeholder={genres.length >= maxGenres ? 'Limit reached' : 'Type genre and press Enter...'}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={genres.length >= maxGenres}
          />
        </div>

        {genres.length > 0 && (
          <div className="flex flex-wrap gap-1.5 animate-in fade-in duration-200">
            {genres.map((genre, index) => (
              <Badge
                key={index}
                variant={GENRE_VARIANTS[index % GENRE_VARIANTS.length]}
                onRemove={() => removeGenre(index)}
                className="px-2 py-0.5"
              >
                {genre}
              </Badge>
            ))}
            <button
              type="button"
              onClick={() => onChange('')}
              className="px-2 py-0.5 rounded-[3px] bg-danger/10 text-danger hover:bg-danger/20 border border-danger/20 transition-colors text-[10px] font-mono font-bold uppercase tracking-wider"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {error && (
        <label className="label pt-1 px-0.5">
          <span className="text-[11px] font-mono text-danger">{error}</span>
        </label>
      )}

      {helperText && !error && (
        <label className="label pt-1 px-0.5">
          <span className="text-[11px] font-mono text-content-muted">{helperText}</span>
        </label>
      )}
    </div>
  )
}
