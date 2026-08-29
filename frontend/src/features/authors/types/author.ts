export interface Author {
  id: number
  name: string
  bio?: string
  country?: string
  language?: string
  birth_year?: number
  is_predefined: boolean
  book_count: number
  created_at: string
  updated_at: string
}

export interface AuthorCreate {
  name: string
  bio?: string
  country?: string
  language?: string
  birth_year?: number
}
