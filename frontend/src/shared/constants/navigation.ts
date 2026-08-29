import { Film, Tv, FileText, Book, BookOpen, Star, Clock, Bookmark, Layers } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavLink {
  value: string
  path: string
  label: string
  icon?: LucideIcon
}

export interface NavDropdown {
  id: string
  label: string
  icon: LucideIcon
  basePath: string
  links: NavLink[]
}

export const NAV_DROPDOWNS: NavDropdown[] = [
  {
    id: 'tabs',
    label: 'Tab Vault',
    icon: Layers,
    basePath: '/tabs',
    links: [
      { value: 'tabs', path: '/tabs', label: 'All Stashed Tabs', icon: Layers },
    ],
  },
  {
    id: 'movies',
    label: 'Movies',
    icon: Film,
    basePath: '/movies',
    links: [
      { value: 'movies', path: '/movies', label: 'All Movies' },
      { value: 'movies-recent', path: '/movies/recently-watched', label: 'Recently Watched', icon: Clock },
      { value: 'movies-fav', path: '/movies/favorites', label: 'Favorites', icon: Star },
      { value: 'movies-watch', path: '/movies/watchlist', label: 'Want to Watch', icon: Bookmark },
    ],
  },
  {
    id: 'series',
    label: 'Series',
    icon: Tv,
    basePath: '/series',
    links: [
      { value: 'series', path: '/series', label: 'All Series' },
      { value: 'series-watching', path: '/series/watching', label: 'Currently Watching' },
      { value: 'series-completed', path: '/series/completed', label: 'Completed' },
      { value: 'series-watch', path: '/series/watchlist', label: 'Want to Watch' },
    ],
  },
  {
    id: 'books',
    label: 'Books',
    icon: Book,
    basePath: '/books',
    links: [
      { value: 'books', path: '/books', label: 'All Books' },
      { value: 'books-reading', path: '/books/reading', label: 'Currently Reading' },
      { value: 'books-completed', path: '/books/completed', label: 'Completed' },
      { value: 'books-wish', path: '/books/wishlist', label: 'Want to Read' },
    ],
  },
  {
    id: 'magazines',
    label: 'Magazines',
    icon: BookOpen,
    basePath: '/magazines',
    links: [
      { value: 'magazines', path: '/magazines', label: 'All Magazines' },
      { value: 'magazines-sub', path: '/magazines/subscriptions', label: 'Subscriptions' },
      { value: 'magazines-archive', path: '/magazines/archive', label: 'Archive' },
    ],
  },
]

export const MOBILE_NAV_LINKS: Array<{ label: string; links: NavLink[] }> = [
  {
    label: 'Productivity',
    links: [
      { value: 'tabs', path: '/tabs', label: 'Tab Vault', icon: Layers },
    ],
  },
  {
    label: 'Entertainment',
    links: [
      { value: 'movies', path: '/movies', label: 'Movies', icon: Film },
      { value: 'series', path: '/series', label: 'Series', icon: Tv },
      { value: 'docs', path: '/documentaries', label: 'Documentaries', icon: FileText },
    ],
  },
  {
    label: 'Reading',
    links: [
      { value: 'books', path: '/books', label: 'Books', icon: Book },
      { value: 'magazines', path: '/magazines', label: 'Magazines', icon: BookOpen },
    ],
  },
]
