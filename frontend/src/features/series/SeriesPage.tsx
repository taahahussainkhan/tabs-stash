import { useEffect } from 'react'
import { Clock, Star, Bookmark } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useSeriesPageController } from './hooks/useSeriesPageController'
import { SeriesView } from './SeriesView'

// Helper to get page config based on route
function getPageConfig(pathname: string) {
  switch (pathname) {
    case '/series/watching':
      return {
        title: 'Currently Watching',
        description: 'Series you\'re currently watching',
        icon: <Clock className="w-5 h-5" />,
        defaultFilters: { status: 'watching' },
        defaultSort: 'updated_at',
      }
    case '/series/completed':
      return {
        title: 'Completed Series',
        description: 'Series you\'ve finished watching',
        icon: <Star className="w-5 h-5" />,
        defaultFilters: { status: 'completed' },
        defaultSort: 'updated_at',
      }
    case '/series/watchlist':
      return {
        title: 'Want to Watch',
        description: 'Series on your watchlist',
        icon: <Bookmark className="w-5 h-5" />,
        defaultFilters: { is_watchlist: true },
        defaultSort: 'created_at',
      }
    default:
      return {
        title: 'Series',
        description: 'Track and manage your series collection',
        icon: null,
        defaultFilters: {},
        defaultSort: 'updated_at',
      }
  }
}

export function SeriesPage() {
  const location = useLocation()
  const pageConfig = getPageConfig(location.pathname)

  const controller = useSeriesPageController({ pathname: location.pathname, pageConfig })

  return <SeriesView {...controller} />
}
