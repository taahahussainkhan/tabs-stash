import { useForm } from '@tanstack/react-form'
import { ShoppingCart, Globe, MapPin, AlignLeft, Plus, X } from 'lucide-react'
import { PropertyRow, GhostInput, GhostSelect, GhostTextArea } from '../../../shared/components/common/property-sheet'
import { useModal } from '../../../shared/hooks/useModal'
import { storeSchema, type StoreSchemaData } from '../schemas/storeSchema'
import { storeTypeOptions } from '../constants/storeOptions'

interface AddStoreModalContentProps {
  modalId: string
  onSubmit: (data: StoreSchemaData) => Promise<void>
  initialData?: StoreSchemaData
}

export function AddStoreModalContent({ modalId, onSubmit, initialData }: AddStoreModalContentProps) {
  const { closeModal } = useModal()

  const form = useForm<StoreSchemaData>({
    defaultValues: {
      name: initialData?.name || '',
      type: initialData?.type || 'PhysicalOnly',
      website: initialData?.website || '',
      physical_address: initialData?.physical_address || '',
      country: initialData?.country || '',
      notes: initialData?.notes || '',
    },
    validators: {
      onChange: storeSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value)
      closeModal(modalId)
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
              <span className="mono-badge mono-badge-indigo text-[9px]">MERCHANT / STORE</span>
              <span className="text-[10px] text-content-muted uppercase tracking-wider">
                {initialData ? 'Edit Merchant' : 'New Merchant'}
              </span>
            </div>

            <form.Field
              name="name"
              children={(field) => (
                <input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Untitled Store / Merchant"
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

            <PropertyRow icon={<ShoppingCart className="w-4 h-4" />} label="Store Format">
              <form.Field
                name="type"
                children={(field) => (
                  <GhostSelect
                    value={field.state.value}
                    options={storeTypeOptions}
                    onChange={(e) => field.handleChange(e.target.value as any)}
                  />
                )}
              />
            </PropertyRow>

            <PropertyRow icon={<Globe className="w-4 h-4" />} label="Website URL">
              <form.Field
                name="website"
                children={(field) => (
                  <GhostInput
                    value={field.state.value || ''}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="https://store.example.com"
                  />
                )}
              />
            </PropertyRow>

            <PropertyRow icon={<Globe className="w-4 h-4" />} label="Country">
              <form.Field
                name="country"
                children={(field) => (
                  <GhostInput
                    value={field.state.value || ''}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g. United States"
                  />
                )}
              />
            </PropertyRow>

            <PropertyRow icon={<MapPin className="w-4 h-4" />} label="Physical Address">
              <form.Field
                name="physical_address"
                children={(field) => (
                  <GhostInput
                    value={field.state.value || ''}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Street, City, Postal Code"
                  />
                )}
              />
            </PropertyRow>
          </div>

          {/* Notes */}
          <div className="space-y-2 pt-4 border-t border-[#242730]">
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-content-muted/40 px-1">
              <AlignLeft className="w-3.5 h-3.5" />
              <span>Merchant Notes</span>
            </div>

            <form.Field
              name="notes"
              children={(field) => (
                <GhostTextArea
                  value={field.state.value || ''}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Loyalty program info, favorite branches, notes..."
                  rows={3}
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
                <span>{isSubmitting ? 'Saving...' : initialData ? 'Update Merchant' : 'Save Merchant'}</span>
              </button>
            )}
          />
        </div>
      </form>
    </div>
  )
}
