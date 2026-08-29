import { useState } from 'react'
import { RotateCcw, Filter, Check, Play, Monitor, User, Tag, Calendar, Star, X } from 'lucide-react'
import { PropertyRow, GhostInput, GhostSelect } from '../common/property-sheet'
import { watchStatusOptions } from '../../constants/watchStatus'
import { platformOptions } from '../../constants/platformOptions'

export interface FilterOptions {
  status?: string
  director?: string
  yearReleased?: { min?: number; max?: number }
  yearWatched?: { min?: number; max?: number }
  rating?: { min?: number; max?: number }
  genre?: string
  platform?: string
}

interface FilterModalContentProps {
  onClose: () => void
  onApply: (filters: FilterOptions) => void
  currentFilters: FilterOptions
  type?: 'movie' | 'series'
}

export function FilterModalContent({ onClose, onApply, currentFilters }: FilterModalContentProps) {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters)
  const currentYear = new Date().getFullYear()

  const handleApply = () => {
    onApply(filters)
    onClose()
  }

  const handleReset = () => {
    const emptyFilters: FilterOptions = {}
    setFilters(emptyFilters)
    onApply(emptyFilters)
  }

  return (
    <div className="flex flex-col h-full bg-[#1e2026]">
      <div className="p-6 sm:p-10 flex-1 overflow-y-auto custom-scrollbar space-y-6">
        {/* Title */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2 font-mono">
            <span className="mono-badge mono-badge-vermillion text-[9px]">QUERY</span>
            <span className="text-[10px] text-content-muted uppercase tracking-wider">Catalog Filtering</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight">
            Filter Archive
          </h2>
        </div>

        {/* Properties Sheet */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-content-muted/40 mb-2 px-1">
            Filter Rules
          </div>

          <PropertyRow icon={<Play className="w-4 h-4" />} label="Status">
            <GhostSelect
              value={filters.status || ''}
              options={[{ value: '', label: 'All Statuses' }, ...watchStatusOptions]}
              onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
              placeholder="All Statuses"
            />
          </PropertyRow>

          <PropertyRow icon={<Monitor className="w-4 h-4" />} label="Platform">
            <GhostSelect
              value={filters.platform || ''}
              options={[{ value: '', label: 'All Platforms' }, ...platformOptions]}
              onChange={(e) => setFilters({ ...filters, platform: e.target.value || undefined })}
              placeholder="All Platforms"
            />
          </PropertyRow>

          <PropertyRow icon={<User className="w-4 h-4" />} label="Director / Creator">
            <GhostInput
              value={filters.director || ''}
              onChange={(e) => setFilters({ ...filters, director: e.target.value || undefined })}
              placeholder="Search by name..."
            />
          </PropertyRow>

          <PropertyRow icon={<Tag className="w-4 h-4" />} label="Genre">
            <GhostInput
              value={filters.genre || ''}
              onChange={(e) => setFilters({ ...filters, genre: e.target.value || undefined })}
              placeholder="e.g. Sci-Fi, Noir"
            />
          </PropertyRow>

          <PropertyRow icon={<Calendar className="w-4 h-4" />} label="Year Released">
            <div className="flex items-center gap-2">
              <GhostInput
                type="number"
                placeholder="From (1900)"
                min={1900}
                max={currentYear}
                value={filters.yearReleased?.min ?? ''}
                onChange={(e) => setFilters({
                  ...filters,
                  yearReleased: {
                    ...filters.yearReleased,
                    min: e.target.value ? parseInt(e.target.value) : undefined
                  }
                })}
                className="w-24"
              />
              <span className="text-content-muted text-xs">&mdash;</span>
              <GhostInput
                type="number"
                placeholder="To"
                min={1900}
                max={currentYear}
                value={filters.yearReleased?.max ?? ''}
                onChange={(e) => setFilters({
                  ...filters,
                  yearReleased: {
                    ...filters.yearReleased,
                    max: e.target.value ? parseInt(e.target.value) : undefined
                  }
                })}
                className="w-24"
              />
            </div>
          </PropertyRow>

          <PropertyRow icon={<Star className="w-4 h-4" />} label="Rating Range">
            <div className="flex items-center gap-2">
              <GhostInput
                type="number"
                placeholder="Min (1.0)"
                min={1}
                max={10}
                step={0.1}
                value={filters.rating?.min ?? ''}
                onChange={(e) => setFilters({
                  ...filters,
                  rating: {
                    ...filters.rating,
                    min: e.target.value ? parseFloat(e.target.value) : undefined
                  }
                })}
                className="w-24"
              />
              <span className="text-content-muted text-xs">&mdash;</span>
              <GhostInput
                type="number"
                placeholder="Max (10.0)"
                min={1}
                max={10}
                step={0.1}
                value={filters.rating?.max ?? ''}
                onChange={(e) => setFilters({
                  ...filters,
                  rating: {
                    ...filters.rating,
                    max: e.target.value ? parseFloat(e.target.value) : undefined
                  }
                })}
                className="w-24"
              />
            </div>
          </PropertyRow>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 sm:px-10 py-4 border-t border-[#2e323c] flex items-center justify-between gap-4 bg-[#17181d] shrink-0">
        <button
          type="button"
          onClick={handleReset}
          className="text-xs font-mono text-content-muted hover:text-white flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset All</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-medium text-content-muted hover:text-white transition-colors px-3 py-1.5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="btn-primary px-5 py-2 text-xs flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Filters</span>
          </button>
        </div>
      </div>
    </div>
  )
}
