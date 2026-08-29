import { useEffect } from 'react'
import { Clock, Star, Bookmark } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useMoviesPageController } from './hooks/useMoviesPageController'
import { MoviesView } from './MoviesView'

// Helper to get page config based on route
function getPageConfig(pathname: string) {
  switch (pathname) {
    case '/movies/recently-watched':
      return {
        title: 'Recently Watched',
        description: 'Movies you\'ve watched recently',
        icon: Clock,
        defaultFilters: { status: 'completed' },
        defaultSort: 'updated_at',
      }
    case '/movies/favorites':
      return {
        title: 'Favorite Movies',
        description: 'Your favorite movies',
        icon: Star,
        defaultFilters: { is_favorite: true },
        defaultSort: 'updated_at',
      }
    case '/movies/watchlist':
      return {
        title: 'Want to Watch',
        description: 'Movies on your watchlist',
        icon: Bookmark,
        defaultFilters: { is_watchlist: true },
        defaultSort: 'created_at',
      }
    default:
      return {
        title: 'Movies',
        description: 'Track and manage your movie collection',
        icon: null,
        defaultFilters: {},
        defaultSort: 'updated_at',
      }
  }
}

export function MoviesPage() {
  const location = useLocation()
  const pageConfig = getPageConfig(location.pathname)

  const controller = useMoviesPageController({ pathname: location.pathname, pageConfig })

  return <MoviesView {...controller} />
}
