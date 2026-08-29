import { useState, useEffect } from 'react'
import { Select } from '../../../shared/components/common/form/Select'
import { useUpdateSettingsMutation } from '../../../services/settingsService'
import { useSettingsStore } from '../../../store/settingsStore'
import { watchingLimitOptions } from '../constants/watchingLimitOptions'
import { Info, Save, ShieldCheck } from 'lucide-react'

export function WatchingLimitsSelector() {
  const settings = useSettingsStore((state) => state.settings)
  const updateSettingsMutation = useUpdateSettingsMutation()

  const [movieLimit, setMovieLimit] = useState<string>(
    settings.max_concurrent_watching_movies?.toString() || ''
  )
  const [seriesLimit, setSeriesLimit] = useState<string>(
    settings.max_concurrent_watching_series?.toString() || ''
  )

  useEffect(() => {
    setMovieLimit(settings.max_concurrent_watching_movies?.toString() || '')
    setSeriesLimit(settings.max_concurrent_watching_series?.toString() || '')
  }, [settings])

  const handleSave = async () => {
    const movieValue = movieLimit === '' ? null : parseInt(movieLimit)
    const seriesValue = seriesLimit === '' ? null : parseInt(seriesLimit)

    await updateSettingsMutation.mutateAsync({
      max_concurrent_watching_movies: movieValue,
      max_concurrent_watching_series: seriesValue,
    })
  }

  const hasChanges =
    movieLimit !== (settings.max_concurrent_watching_movies?.toString() || '') ||
    seriesLimit !== (settings.max_concurrent_watching_series?.toString() || '')

  return (
    <div className="space-y-6">
      <p className="text-content-secondary text-xs leading-relaxed">
        Establish concurrent in-progress limits to maintain intentional logging focus across film and television.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-[11px] font-mono font-bold uppercase text-content-muted">Cinematic Active Limit</div>
          <Select
            options={watchingLimitOptions}
            value={movieLimit}
            onChange={(e) => setMovieLimit(e.target.value)}
          />
          <p className="text-[10px] font-mono text-content-muted">
            {movieLimit === '' || movieLimit === '0'
              ? 'Unlimited concurrent films'
              : `Maximum ${movieLimit} active film${parseInt(movieLimit) > 1 ? 's' : ''}`
            }
          </p>
        </div>

        <div className="space-y-2">
          <div className="text-[11px] font-mono font-bold uppercase text-content-muted">Television Active Limit</div>
          <Select
            options={watchingLimitOptions}
            value={seriesLimit}
            onChange={(e) => setSeriesLimit(e.target.value)}
          />
          <p className="text-[10px] font-mono text-content-muted">
            {seriesLimit === '' || seriesLimit === '0'
              ? 'Unlimited concurrent series'
              : `Maximum ${seriesLimit} concurrent series`
            }
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-[#242730] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-accent-sage font-mono text-xs">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Active Ceilings Monitored</span>
        </div>

        {hasChanges && (
          <button
            className="btn-primary px-4 py-2 text-xs flex items-center justify-center gap-1.5"
            onClick={handleSave}
            disabled={updateSettingsMutation.isPending}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{updateSettingsMutation.isPending ? 'Saving...' : 'Save Limits'}</span>
          </button>
        )}
      </div>

      <div className="p-3.5 bg-[#15161a] border border-[#2e323c] rounded-[4px] flex gap-3 items-start">
        <Info className="w-4 h-4 text-accent-cyan shrink-0 mt-0.5" />
        <p className="text-xs text-content-secondary leading-relaxed font-sans">
          When the limit is reached, adding another active entry will prompt you to conclude or mark an existing item on pause first.
        </p>
      </div>
    </div>
  )
}
