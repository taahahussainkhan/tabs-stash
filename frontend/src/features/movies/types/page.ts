import type { LucideIcon } from 'lucide-react'

export interface MoviePageFilters {
  status?: string
  director?: string
  genre?: string
  platform?: string
  year_min?: number
  year_max?: number
  rating_min?: number
  rating_max?: number
}

export interface MoviePageConfig {
  title: string
  description: string
  icon: LucideIcon
  defaultFilters: MoviePageFilters
  defaultSort: string
}
