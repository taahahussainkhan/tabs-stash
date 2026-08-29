export interface BookCreateData {
  title: string
  subtitle?: string
  author_ids?: number[]
  new_author_names?: string[]
  genre_names: string[]
  original_year?: number
  series_name?: string
  series_position?: number
  description?: string

  isbn?: string
  isbn13?: string
  publisher_id?: number
  new_publisher_name?: string
  publish_year?: number
  page_count?: number
  cover_image?: string
  language?: string
  original_language?: string
  is_translated?: boolean
  translator?: string
  translator_notes?: string
  format?: string
  edition_number?: number
  edition_notes?: string
  dimensions?: string
  weight?: string

  store_name?: string
  store_type?: string
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
  is_pirated?: boolean
  is_signed?: boolean
  signed_by?: string
  dedication?: string
  personal_notes?: string
  acquisition_story?: string
  ownership_status: string
}
