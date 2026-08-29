import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { SearchableMultiSelect, type AutocompleteOption } from '../../../shared/components/common/form/SearchableMultiSelect'
import { SearchableSingleSelect } from '../../../shared/components/common/form/SearchableSingleSelect'
import { Button } from '../../../shared/components/common/Button'
import { useModal } from '../../../shared/hooks/useModal'
import { authorsApi } from '../../authors/api/authorsApi'
import { publishersApi } from '../../publishers/api/publishersApi'
import type { BookCreateData } from '../types/payloads'
import { bookSchema } from '../schemas/bookSchema'
import {
  User,
  Calendar,
  Hash,
  Tag as TagIcon,
  AlignLeft,
  Building2,
  Type,
  Languages,
  DollarSign,
  ShoppingCart,
  Clock,
  Award,
  Plus,
  X,
  ChevronDown,
  Info
} from 'lucide-react'
import { tagsApi } from '../../tags/api/tagsApi'
import { useCreateTagMutation } from '../../tags/hooks/useTagsQuery'
import { cn } from '../../../lib/utils'

import {
  bookFormatOptions,
  bookOwnershipStatusOptions,
} from '../constants/bookOptions'

import { PropertyRow, GhostInput, GhostSelect, GhostTextArea, GhostToggle } from '../../../shared/components/common/property-sheet'

// --- Main Modal Content ---

interface AddBookModalContentProps {
  modalId: string
  onSubmit: (data: BookCreateData) => Promise<void>
  initialData?: Partial<any>
}

export function AddBookModalContent({
  modalId,
  onSubmit,
  initialData,
}: AddBookModalContentProps) {
  const { closeModal } = useModal()

  // Tag Management
  // We use the query hook just to trigger fetches if needed, but the SearchableMultiSelect uses onSearch prop
  // which we implement directly using the API to match the component's expected interface.
  const createTagMutation = useCreateTagMutation()

  const searchTags = async (query: string): Promise<AutocompleteOption[]> => {
    try {
      const results = await tagsApi.search(query)
      return results.map(t => ({
        id: t.public_id,
        label: t.name,
        color: t.color
      }))
    } catch (e) {
      console.error("Error searching tags", e)
      return []
    }
  }

  const createTag = async (name: string): Promise<AutocompleteOption> => {
    // Generate a random pastel color
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
      '#D4A5A5', '#9B59B6', '#3498DB', '#E74C3C', '#2ECC71'
    ]
    const color = colors[Math.floor(Math.random() * colors.length)]

    const newTag = await createTagMutation.mutateAsync({ name, color })
    return {
      id: newTag.public_id,
      label: newTag.name,
      color: newTag.color
    }
  }

  const form = useForm({
    defaultValues: {
      title: initialData?.title || '',
      subtitle: initialData?.subtitle || '',
      authors: initialData?.authors || [],
      new_author_names: initialData?.new_author_names || [],
      genre_names: initialData?.genre_names || [],
      tags: initialData?.tags || [],
      original_year: initialData?.original_year,
      series_name: initialData?.series_name || '',
      series_position: initialData?.series_position,
      description: initialData?.description || '',

      isbn: initialData?.isbn || '',
      isbn13: initialData?.isbn13 || '',
      publisher: initialData?.publisher || null,
      new_publisher_name: initialData?.new_publisher_name || '',
      publish_year: initialData?.publish_year,
      page_count: initialData?.page_count,
      cover_image: initialData?.cover_image || '',
      language: initialData?.language || '',
      original_language: initialData?.original_language || '',
      is_translated: initialData?.is_translated || false,
      translator: initialData?.translator || '',
      translator_notes: initialData?.translator_notes || '',
      format: initialData?.format,
      edition_number: initialData?.edition_number,
      edition_notes: initialData?.edition_notes || '',
      dimensions: initialData?.dimensions || '',
      weight: initialData?.weight || '',

      store_name: initialData?.store_name || '',
      store_type: initialData?.store_type || 'PhysicalOnly',
      purchase_channel: initialData?.purchase_channel,
      order_placed_date: initialData?.order_placed_date || '',
      order_received_date: initialData?.order_received_date || '',
      payment_method: initialData?.payment_method,
      payment_platform: initialData?.payment_platform || '',
      purchase_currency: initialData?.purchase_currency || 'USD',
      list_price: initialData?.list_price,
      paid_price: initialData?.paid_price,
      discount_info: initialData?.discount_info || '',

      condition: initialData?.condition,
      is_pirated: initialData?.is_pirated || false,
      is_signed: initialData?.is_signed || false,
      signed_by: initialData?.signed_by || '',
      dedication: initialData?.dedication || '',
      personal_notes: initialData?.personal_notes || '',
      acquisition_story: initialData?.acquisition_story || '',
      ownership_status: initialData?.ownership_status || 'Owned',
    },
    validators: {
      onChange: bookSchema as any,
    },
    onSubmit: async ({ value }) => {
      const cleanValue = Object.entries(value).reduce((acc, [key, val]) => {
        // @ts-ignore
        acc[key] = val === '' ? undefined : val
        return acc
      }, {} as any)

      const payload: BookCreateData = {
        ...cleanValue,
        author_ids: value.authors?.map((a: AutocompleteOption) => a.id) || [],
        publisher_id: value.publisher?.id
      }

      delete (payload as any).authors
      delete (payload as any).publisher

      await onSubmit(payload)
      closeModal(modalId)
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...form.state.values,
        ...initialData
      } as any)
    }
  }, [initialData])


  return (
    <div className="flex flex-col h-full bg-surface overflow-hidden">
      <div className="relative flex flex-col items-center pt-10 px-4 sm:px-8 pb-12 flex-1 overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-3xl space-y-8">

          {/* Page Title - Notion Style */}
          <div className="space-y-2">
            <form.Field
              name="title"
              children={(field) => (
                <input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Untitled Archive"
                  className="w-full text-4xl sm:text-5xl font-bold bg-transparent border-none focus:ring-0 p-0 text-content-primary placeholder:text-content-muted/20"
                  autoFocus
                />
              )}
            />
            <form.Field
              name="subtitle"
              children={(field) => (
                <input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Subtitle or edition name..."
                  className="w-full text-lg bg-transparent border-none focus:ring-0 p-0 text-content-muted placeholder:text-content-muted/20 mt-2"
                />
              )}
            />
          </div>

          {/* Properties Section */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-content-muted/40 mb-4 px-1">
              Properties
            </div>

            <PropertyRow icon={<User size={16} />} label="Authors" required>
              <form.Field
                name="authors"
                children={(field) => (
                  <SearchableMultiSelect
                    value={field.state.value || []}
                    onChange={(options: AutocompleteOption[]) => field.handleChange(options)}
                    onSearch={async (q: string) => {
                      const results = await authorsApi.search(q)
                      return results.map(r => ({ id: r.id, label: r.name, sublabel: r.country }))
                    }}
                    onCreate={async (name: string) => {
                      const newAuthor = await authorsApi.create({ name })
                      return { id: newAuthor.id, label: newAuthor.name }
                    }}
                    placeholder="Empty"
                    minimalist
                  />
                )}
              />
            </PropertyRow>

            <PropertyRow icon={<Calendar size={16} />} label="Original Year">
              <form.Field
                name="original_year"
                children={(field) => (
                  <GhostInput
                    type="number"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                )}
              />
            </PropertyRow>

            <PropertyRow icon={<Hash size={16} />} label="Genres">
              <form.Field
                name="genre_names"
                children={(field) => (
                  <GhostInput
                    value={(field.state.value || []).join(', ')}
                    onChange={(e) => field.handleChange(e.target.value.split(',').map(v => v.trim()).filter(Boolean))}
                    placeholder="Select genres..."
                  />
                )}
              />
            </PropertyRow>

            <PropertyRow icon={<Building2 size={16} />} label="Publisher">
              <form.Field
                name="publisher"
                children={(field) => (
                  <SearchableSingleSelect
                    value={field.state.value}
                    onChange={(option: AutocompleteOption | null) => field.handleChange(option)}
                    onSearch={async (q: string) => {
                      const results = await publishersApi.search(q)
                      return results.map(r => ({ id: r.id, label: r.name }))
                    }}
                    onCreate={async (name: string) => {
                      const newPub = await publishersApi.create({ name })
                      return { id: newPub.id, label: newPub.name }
                    }}
                    placeholder="Empty"
                    minimalist
                  />
                )}
              />
            </PropertyRow>

            <PropertyRow icon={<Type size={16} />} label="Format">
              <form.Field
                name="format"
                children={(field) => (
                  <GhostSelect
                    value={field.state.value}
                    onChange={(e: any) => field.handleChange(e.target.value)}
                    options={bookFormatOptions}
                  />
                )}
              />
            </PropertyRow>

            <PropertyRow icon={<Hash size={16} />} label="Page Count">
              <form.Field
                name="page_count"
                children={(field) => (
                  <GhostInput
                    type="number"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                )}
              />
            </PropertyRow>

            <PropertyRow icon={<Languages size={16} />} label="Language">
              <form.Field
                name="language"
                children={(field) => (
                  <GhostInput
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              />
            </PropertyRow>

            <PropertyRow icon={<Award size={16} />} label="Acquisition">
              <form.Field
                name="ownership_status"
                children={(field) => (
                  <GhostSelect
                    value={field.state.value}
                    onChange={(e: any) => field.handleChange(e.target.value)}
                    options={bookOwnershipStatusOptions}
                  />
                )}
              />
            </PropertyRow>

            <PropertyRow icon={<DollarSign size={16} />} label="Price">
              <div className="flex gap-2">
                <form.Field
                  name="paid_price"
                  children={(field) => (
                    <GhostInput
                      type="number"
                      step="0.01"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-20"
                    />
                  )}
                />
                <form.Field
                  name="purchase_currency"
                  children={(field) => (
                    <GhostInput
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-16"
                    />
                  )}
                />
              </div>
            </PropertyRow>

            <PropertyRow icon={<Clock size={16} />} label="Date Purchased">
              <form.Field
                name="order_placed_date"
                children={(field) => (
                  <GhostInput
                    type="date"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              />
            </PropertyRow>

            <PropertyRow icon={<Info size={16} />} label="ISBN-13">
              <form.Field
                name="isbn13"
                children={(field) => (
                  <GhostInput
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              />
            </PropertyRow>

            <PropertyRow icon={<Award size={16} />} label="Signatures">
              <div className="flex items-center gap-6">
                <form.Field
                  name="is_signed"
                  children={(field) => (
                    <GhostToggle
                      value={field.state.value}
                      onChange={field.handleChange}
                      label="Signed Copy"
                    />
                  )}
                />
                <form.Subscribe
                  selector={(state) => state.values.is_signed}
                  children={(isSigned) => isSigned && (
                    <form.Field
                      name="signed_by"
                      children={(field) => (
                        <GhostInput
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Signed by..."
                          className="flex-1 min-w-[150px]"
                        />
                      )}
                    />
                  )}
                />
              </div>
            </PropertyRow>

            <PropertyRow icon={<Languages size={16} />} label="Translation">
              <form.Field
                name="is_translated"
                children={(field) => (
                  <GhostToggle
                    value={field.state.value}
                    onChange={field.handleChange}
                    label="Is Translated Work"
                  />
                )}
              />
            </PropertyRow>

            <form.Subscribe
              selector={(state) => state.values.is_translated}
              children={(isTranslated) => isTranslated && (
                <div className="mt-2 ml-10 pl-4 border-l border-white/5 space-y-1 animate-in fade-in slide-in-from-left-2 duration-300">
                  <PropertyRow icon={<Languages size={14} />} label="Original Lang">
                    <form.Field
                      name="original_language"
                      children={(field) => (
                        <GhostInput
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="e.g. Japanese"
                        />
                      )}
                    />
                  </PropertyRow>
                  <PropertyRow icon={<User size={14} />} label="Translator">
                    <form.Field
                      name="translator"
                      children={(field) => (
                        <GhostInput
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Translator name"
                        />
                      )}
                    />
                  </PropertyRow>
                  <PropertyRow icon={<AlignLeft size={14} />} label="Translator Notes">
                    <form.Field
                      name="translator_notes"
                      children={(field) => (
                        <GhostInput
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Notes about translation"
                        />
                      )}
                    />
                  </PropertyRow>
                </div>
              )}
            />
          </div>

          {/* Content / Comments Section */}
          <div className="space-y-6 pt-4 border-t border-white/5">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-content-muted/40 px-1">
              Synopsis & Notes
            </div>

            <form.Field
              name="description"
              children={(field) => (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[13px] text-content-muted opacity-60">
                    <AlignLeft size={14} />
                    <span>Summary</span>
                  </label>
                  <GhostTextArea
                    value={field.state.value}
                    onChange={(e: any) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            />

            {/* Tags */}
            <PropertyRow icon={<TagIcon size={16} />} label="Tags">
              <form.Field
                name="tags"
                children={(field) => (
                  <SearchableMultiSelect
                    placeholder="Add tags..."
                    value={field.state.value || []}
                    onChange={(selected) => field.handleChange(selected)}
                    onSearch={searchTags}
                    onCreate={createTag}
                    minimalist
                  />
                )}
              />
            </PropertyRow>

            {/* Notes */}
            <div className="col-span-2 space-y-2 mt-2">
              <label className="text-xs font-bold uppercase tracking-widest text-content-muted">
                Private Notes
              </label>
              <form.Field
                name="personal_notes"
                children={(field) => (
                  <GhostTextArea
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Add private notes about this book..."
                    rows={3}
                  />
                )}
              />
            </div>

            {/* Acquisition Story */}
            <div className="col-span-2 space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-content-muted">
                Acquisition Story
              </label>
              <form.Field
                name="acquisition_story"
                children={(field) => (
                  <GhostTextArea
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="How did you acquire this book?"
                    rows={2}
                  />
                )}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-6 sm:px-12 py-5 border-t border-white/5 flex items-center justify-between gap-4 bg-surface/80 backdrop-blur-xl shrink-0">
        <button
          type="button"
          onClick={() => closeModal(modalId)}
          className="text-sm font-medium text-content-muted hover:text-content-primary transition-colors flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-lg"
        >
          <X size={16} />
          Discard
        </button>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting] as const}
          children={([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={!canSubmit}
              onClick={() => form.handleSubmit()}
              leftIcon={<Plus size={18} />}
              className="px-8 h-10 rounded-lg text-sm"
            >
              {initialData ? 'Update Specs' : 'Archive Work'}
            </Button>
          )}
        />
      </div>
    </div>
  )
}
