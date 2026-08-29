import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBooks } from './useBooks'
import { useSettings } from '../../../shared/hooks/useSettings'
import { useConfirmation } from '../../../shared/hooks/useConfirmation'
import { useModal } from '../../../shared/hooks/useModal'
import { AddBookModalContent } from '../components/AddBookModalContent'
import type { BookCreateData } from '../types/payloads'
import type { BookItem } from '../types/book'

const BOOK_MODAL_ID = 'add-book-modal'

export function useBooksPageController() {
  const navigate = useNavigate()
  const { settings } = useSettings()
  const { confirm } = useConfirmation()
  const { openModal } = useModal()

  const booksState = useBooks()
  const [viewMode, setViewMode] = useState<'tiles' | 'table'>('tiles')

  const handleCreateBook = useCallback(async (data: BookCreateData) => {
    try {
      await booksState.createBook(data)
    } catch (error) {
      console.error('Failed to create book:', error)
      throw error
    }
  }, [booksState])

  const handleEditBook = useCallback((item: BookItem) => {
    openModal({
      id: BOOK_MODAL_ID,
      content: AddBookModalContent,
      size: '3xl',
      position: 'center',
      props: {
        modalId: BOOK_MODAL_ID,
        onSubmit: async (data: BookCreateData) => {
          try {
            await booksState.updateBook(item.public_id, data)
          } catch (error) {
            console.error('Failed to update book:', error)
            throw error
          }
        },
        initialData: {
          title: item.edition?.book?.title || '',
          subtitle: item.edition?.book?.subtitle || '',
          authors: item.edition?.book?.authors?.map(a => ({
            id: a.id,
            label: a.name,
            sublabel: a.country
          })) || [],
          genre_names: item.edition?.book?.genres?.map(g => g.name) || [],
          original_year: item.edition?.book?.original_year,
          series_name: item.edition?.book?.series_name || '',
          series_position: item.edition?.book?.series_position,
          description: item.edition?.book?.description || '',

          isbn: item.edition?.isbn,
          isbn13: item.edition?.isbn13,
          publisher: item.edition?.publisher ? {
            id: item.edition.publisher.id,
            label: item.edition.publisher.name
          } : null,
          publish_year: item.edition?.publish_year,
          page_count: item.edition?.page_count,
          cover_image: item.edition?.cover_image,
          language: item.edition?.language,
          original_language: item.edition?.original_language,
          translator: item.edition?.translator,
          translator_notes: item.edition?.translator_notes,
          format: item.edition?.format as any,
          edition_number: item.edition?.edition_number,
          edition_notes: item.edition?.edition_notes,
          dimensions: item.edition?.dimensions,
          weight: item.edition?.weight,

          store_name: item.store?.name,
          store_type: item.store?.type as any,
          purchase_channel: item.purchase_channel as any,
          order_placed_date: item.order_placed_date,
          order_received_date: item.order_received_date,
          payment_method: item.payment_method as any,
          payment_platform: item.payment_platform,
          purchase_currency: item.purchase_currency,
          list_price: item.list_price,
          paid_price: item.paid_price,
          discount_info: item.discount_info,
          condition: item.condition as any,
          is_pirated: item.is_pirated,
          is_signed: item.is_signed,
          signed_by: item.signed_by,
          dedication: item.dedication,
          personal_notes: item.personal_notes,
          acquisition_story: item.acquisition_story,
          ownership_status: item.ownership_status as any,
        },
      },
    })
  }, [booksState, openModal])

  const handleDeleteBook = useCallback((item: BookItem) => {
    confirm({
      title: 'Delete Book',
      message: 'Are you sure you want to delete this book? This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await booksState.deleteBook(item.public_id)
        } catch (error) {
          console.error('Failed to delete book:', error)
        }
      },
    })
  }, [booksState, confirm])

  const handleViewDetails = useCallback((item: BookItem) => {
    navigate(`/books/${item.public_id}`)
  }, [navigate])

  const handleOpenAddModal = useCallback(() => {
    openModal({
      id: BOOK_MODAL_ID,
      content: AddBookModalContent,
      size: '3xl',
      position: 'center',
      props: {
        modalId: BOOK_MODAL_ID,
        onSubmit: handleCreateBook,
      },
    })
  }, [handleCreateBook, openModal])

  const navigateToAuthors = useCallback(() => {
    navigate('/authors')
  }, [navigate])

  const navigateToGenres = useCallback(() => {
    navigate('/genres')
  }, [navigate])

  return {
    settings,
    viewMode,
    setViewMode,
    navigateToAuthors,
    navigateToGenres,
    handleOpenAddModal,
    handleEditBook,
    handleDeleteBook,
    handleViewDetails,
    ...booksState,
  }
}

export type BooksPageController = ReturnType<typeof useBooksPageController>
