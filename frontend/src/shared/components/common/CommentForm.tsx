import { useForm } from '@tanstack/react-form'
import { Plus } from 'lucide-react'
import { Input } from './form/Input'
import { Textarea } from './form/Textarea'
import { commentEntrySchema, type CommentEntrySchemaData } from '../../../features/movies/schemas/commentEntrySchema'

interface Props {
  onAdd: (comment: { timestamp: number; duration?: number; text: string }) => void
  disabled?: boolean
}

export function CommentForm({ onAdd, disabled = false }: Props) {
  const form = useForm<CommentEntrySchemaData>({
    defaultValues: {
      timestamp: '',
      duration: '',
      text: '',
    } satisfies CommentEntrySchemaData,
    validators: {
      onChange: commentEntrySchema,
    },
    onSubmit: async ({ value }) => {
      const trimmed = value.text.trim()
      if (!trimmed) return

      onAdd({
        timestamp: parseFloat(value.timestamp) || 0,
        duration: value.duration ? parseFloat(value.duration) : undefined,
        text: trimmed,
      })

      form.reset()
    },
  })

  return (
    <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
      <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-content-muted mb-6">Create New Note</h4>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <form.Field
            name="timestamp"
            children={(field) => {
              const error = field.state.meta.isTouched && !field.state.meta.isValid
                ? field.state.meta.errors.map(String).join(', ')
                : undefined

              return (
                <Input
                  type="number"
                  label="Position (seconds)"
                  labelSize="sm"
                  size="sm"
                  placeholder="0"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  disabled={disabled}
                  error={error}
                  className="bg-white/5 border-white/5 focus:bg-white/10"
                />
              )
            }}
          />
          <form.Field
            name="duration"
            children={(field) => {
              const error = field.state.meta.isTouched && !field.state.meta.isValid
                ? field.state.meta.errors.map(String).join(', ')
                : undefined

              return (
                <Input
                  type="number"
                  label="Context / Duration"
                  labelSize="sm"
                  size="sm"
                  placeholder="Optional"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  disabled={disabled}
                  error={error}
                  className="bg-white/5 border-white/5 focus:bg-white/10"
                />
              )
            }}
          />
        </div>

        <form.Field
          name="text"
          children={(field) => {
            const error = field.state.meta.isTouched && !field.state.meta.isValid
              ? field.state.meta.errors.map(String).join(', ')
              : undefined

            return (
              <Textarea
                label="Your Note"
                labelSize="sm"
                size="sm"
                rows={3}
                placeholder="Share your thoughts..."
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                disabled={disabled}
                error={error}
                className="bg-white/5 border-white/5 focus:bg-white/10 min-h-[100px]"
              />
            )
          }}
        />

        <div className="flex justify-end pt-2">
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting] as const}
            children={([canSubmit, isSubmitting]) => (
              <button
                type="button"
                onClick={() => void form.handleSubmit()}
                className="btn-pastel-blue h-10 px-6 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 group"
                disabled={disabled || isSubmitting || !canSubmit}
              >
                <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                Add to Log
              </button>
            )}
          />
        </div>
      </div>
    </div>
  )
}
