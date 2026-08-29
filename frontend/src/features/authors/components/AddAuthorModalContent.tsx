import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { PropertyRow, GhostInput, GhostTextArea } from '../../../shared/components/common/property-sheet'
import { useModal } from '../../../shared/hooks/useModal'
import { authorSchema, type AuthorSchemaData } from '../schemas/authorSchema'
import { User, AlignLeft, Globe, Languages, Calendar, Plus, X } from 'lucide-react'

interface AddAuthorModalContentProps {
  modalId: string
  onSubmit: (data: AuthorSchemaData) => Promise<void>
  initialData?: AuthorSchemaData
}

export function AddAuthorModalContent({ modalId, onSubmit, initialData }: AddAuthorModalContentProps) {
  const { closeModal } = useModal()

  const form = useForm<AuthorSchemaData>({
    defaultValues: {
      name: initialData?.name || '',
      bio: initialData?.bio ?? '',
      country: initialData?.country ?? '',
      language: initialData?.language ?? '',
      birth_year: initialData?.birth_year,
    },
    validators: {
      onChange: authorSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value)
      closeModal(modalId)
    },
  })

  useEffect(() => {
    if (initialData) {
      form.setFieldValue('name', initialData.name || '')
      form.setFieldValue('bio', initialData.bio ?? undefined)
      form.setFieldValue('country', initialData.country ?? undefined)
      form.setFieldValue('language', initialData.language ?? undefined)
      form.setFieldValue('birth_year', initialData.birth_year)
    }
  }, [initialData, form])

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
              <span className="mono-badge mono-badge-indigo text-[9px]">AUTHOR REGISTRY</span>
              <span className="text-[10px] text-content-muted uppercase tracking-wider">
                {initialData ? 'Edit Author' : 'New Author'}
              </span>
            </div>

            <form.Field
              name="name"
              children={(field) => (
                <input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Untitled Author"
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

            <PropertyRow icon={<Globe className="w-4 h-4" />} label="Country / Origin">
              <form.Field
                name="country"
                children={(field) => (
                  <GhostInput
                    value={field.state.value || ''}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g. United Kingdom"
                  />
                )}
              />
            </PropertyRow>

            <PropertyRow icon={<Languages className="w-4 h-4" />} label="Primary Language">
              <form.Field
                name="language"
                children={(field) => (
                  <GhostInput
                    value={field.state.value || ''}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g. English"
                  />
                )}
              />
            </PropertyRow>

            <PropertyRow icon={<Calendar className="w-4 h-4" />} label="Birth Era / Year">
              <form.Field
                name="birth_year"
                children={(field) => (
                  <GhostInput
                    type="number"
                    value={field.state.value ?? ''}
                    onChange={(e) => field.handleChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="e.g. 1928"
                    min={1000}
                    max={2030}
                  />
                )}
              />
            </PropertyRow>
          </div>

          {/* Biography & Notes */}
          <div className="space-y-2 pt-4 border-t border-[#242730]">
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-content-muted/40 px-1">
              <AlignLeft className="w-3.5 h-3.5" />
              <span>Biography &amp; Notes</span>
            </div>

            <form.Field
              name="bio"
              children={(field) => (
                <GhostTextArea
                  value={field.state.value || ''}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Biographical notes, major awards, literary influence..."
                  rows={4}
                />
              )}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-10 py-4 border-t border-[#2e323c] flex items-center justify-between gap-4 bg-[#17181d] shrink-0">
          <button
            type="button"
            onClick={() => closeModal(modalId)}
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
                <Plus className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Saving...' : initialData ? 'Update Author' : 'Save Author'}</span>
              </button>
            )}
          />
        </div>
      </form>
    </div>
  )
}
