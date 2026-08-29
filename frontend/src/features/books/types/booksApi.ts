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
  total: number
  owned: number
  wishlist: number
  reading: number
  completed: number
}
