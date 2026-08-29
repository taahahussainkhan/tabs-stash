import type { WatchStatus } from '../../../shared/constants/watchStatus'

export interface Author {
  id: number
  name: string
  bio?: string
  country?: string
  language?: string
  birth_year?: number
  death_year?: number
  website?: string
  image_url?: string
  is_predefined: boolean
  book_count: number
  created_at: string
  updated_at: string
}

export interface Publisher {
  id: number
  name: string
  country?: string
  founded_year?: number
  website?: string
  description?: string
  is_predefined: boolean
  book_count: number
  created_at: string
  updated_at: string
}

export interface Store {
  id: number
  name: string
  type: string
  created_at: string
}

export interface Genre {
  id: number
  slug: string
  name: string
}

export interface Book {
  id: number
  public_id: string
  title: string
  subtitle?: string
  original_year?: number
  series_name?: string
  series_position?: number
  description?: string
  authors: Author[]
  genres: Genre[]
}

export interface BookEdition {
  id: number
  public_id: string
  isbn?: string
  isbn13?: string
  publisher?: Publisher
  publish_year?: number
  page_count?: number
  cover_image?: string
  language?: string
  original_language?: string
  is_translated: boolean
  translator?: string
  translator_notes?: string
  format?: string
  edition_number?: number
  edition_notes?: string
  dimensions?: string
  weight?: string
  book: Book
}

export interface BookItem {
  id: number
  public_id: string
  edition_id: number
  store_id?: number
  purchase_channel?: string
  order_placed_date?: string
  order_received_date?: string
  payment_method?: string
  payment_platform?: string
  purchase_currency?: string
  list_price?: number
  paid_price?: number
  discount_info?: string
  condition?: string
  is_pirated: boolean
  is_signed: boolean
  signed_by?: string
  dedication?: string
  personal_notes?: string
  acquisition_story?: string
  ownership_status: string
  is_lent: boolean
  lent_to?: string
  lent_date?: string
  expected_return_date?: string

  edition?: BookEdition
  store?: Store
  created_at: string
  updated_at: string
}

export interface BookSession {
  public_id: string
  status: WatchStatus
  start_date: string
  end_date?: string | null
  current_position?: number
  stop_reason?: string
  is_rewatch: boolean
  rating?: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface BookComment {
  public_id: string
  loggable_type: string
  content: string
  timestamp?: number
  chapter_or_episode?: string
  is_spoiler: boolean
  created_at: string
  updated_at: string
}

export interface BookWithDetails {
  item: BookItem
  sessions: BookSession[]
  comments: BookComment[]
}

export interface BooksQueryParams {
  page?: number
  page_size?: number
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  ownership_status?: string
  format?: string
  language?: string
  author?: string
  publisher?: string
}

export interface BooksStats {
  total_books: number
  total_items: number
  total_pages_read: number
  reading_now: number
  completed: number
  total: number
  owned: number
  wishlist: number
}
