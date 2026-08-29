import { useForm } from '@tanstack/react-form'
import type { MovieLog } from '../types/movie'
import { watchStatusOptions } from '../../../shared/constants/watchStatus'
import { updateProgressSchema, type UpdateProgressSchemaData } from '../schemas/updateProgressSchema'
import { PropertyRow, GhostInput, GhostSelect, GhostTextArea } from '../../../shared/components/common/property-sheet'
import { Save, Play, Clock, AlignLeft, X } from 'lucide-react'

interface UpdateProgressModalContentProps {
  onClose: () => void
  onSubmit: (data: UpdateProgressSchemaData) => Promise<void>
  movie: MovieLog
}

export function UpdateProgressModalContent({ onClose, onSubmit, movie }: UpdateProgressModalContentProps) {
  const form = useForm<UpdateProgressSchemaData>({
    defaultValues: {
      status: movie.status,
      current_timestamp: movie.current_timestamp ?? null,
      stop_reason: movie.stop_reason || '',
    },
    validators: {
      onChange: updateProgressSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value)
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
          {/* Title */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2 font-mono">
              <span className="mono-badge mono-badge-ochre text-[9px]">PROGRESS UPDATE</span>
              <span className="text-[10px] text-content-muted uppercase tracking-wider">{movie.title}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight">
              Update Progress
            </h2>
          </div>

          {/* Properties Sheet */}
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-content-muted/40 mb-2 px-1">
              Playback State
            </div>

            <PropertyRow icon={<Play className="w-4 h-4" />} label="Status" required>
              <form.Field
                name="status"
                children={(field) => (
                  <GhostSelect
                    options={watchStatusOptions}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value as UpdateProgressSchemaData['status'])}
                  />
                )}
              />
            </PropertyRow>

            <form.Subscribe
              selector={(state) => state.values.status}
              children={(status) => (status === 'paused' || status === 'watching') && (
                <PropertyRow icon={<Clock className="w-4 h-4" />} label="Current Timestamp (sec)">
                  <form.Field
                    name="current_timestamp"
                    children={(field) => (
                      <GhostInput
                        type="number"
                        placeholder="Seconds (e.g. 1800)"
                        min={0}
                        value={field.state.value ?? ''}
                        onChange={(e) => field.handleChange(e.target.value === '' ? null : parseInt(e.target.value))}
                      />
                    )}
                  />
                </PropertyRow>
              )}
            />
          </div>

          {/* Stop Reason */}
          <form.Subscribe
            selector={(state) => state.values.status}
            children={(status) => status === 'paused' && (
              <div className="space-y-2 pt-4 border-t border-[#242730] animate-in fade-in duration-150">
                <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-content-muted/40 px-1">
                  <AlignLeft className="w-3.5 h-3.5" />
                  <span>Pause Reason</span>
                </div>

                <form.Field
                  name="stop_reason"
                  children={(field) => (
                    <GhostTextArea
                      placeholder="Why was the session paused?"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      rows={2}
                    />
                  )}
                />
              </div>
            )}
          />
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-10 py-4 border-t border-[#2e323c] flex items-center justify-between gap-4 bg-[#17181d] shrink-0">
          <button 
            type="button" 
            className="text-xs font-medium text-content-muted hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer" 
            onClick={onClose}
          >
            <X className="w-3.5 h-3.5" />
            <span>Discard</span>
          </button>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting] as const}
            children={([canSubmit, isSubmitting]) => (
              <button 
                type="submit" 
                className="btn-primary px-5 py-2 text-xs flex items-center gap-1.5"
                disabled={!canSubmit || isSubmitting}
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Saving...' : 'Update Record'}</span>
              </button>
            )}
          />
        </div>
      </form>
    </div>
  )
}
