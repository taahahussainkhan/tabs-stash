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
        icon: <Clock className="w-5 h-5" />,
        defaultFilters: { status: 'completed' },
        defaultSort: 'updated_at',
      }
    case '/movies/favorites':
      return {
        title: 'Favorite Movies',
        description: 'Your favorite movies',
        icon: <Star className="w-5 h-5" />,
        defaultFilters: { is_favorite: true },
        defaultSort: 'updated_at',
      }
    case '/movies/watchlist':
      return {
        title: 'Want to Watch',
        description: 'Movies on your watchlist',
        icon: <Bookmark className="w-5 h-5" />,
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

  // Apply default filters when route changes
  useEffect(() => {
    controller.applyDefaultRouteFilters()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  return <MoviesView {...controller} />
}
