import { useNavigate } from 'react-router-dom'
import { useDashboardQuery } from '../../services/dashboardService'
import { ItemSummaryCard } from './components/ItemSummaryCard'
import { useAddContentModal } from './hooks/useAddContentModal'
import { useCreateMovieMutation, useCreateWatchlistMovieMutation } from '../movies/hooks/useMovieQueries'
import { useCreateSeriesMutation } from '../series/hooks/useSeriesQueries'
import { Play, Star, Bookmark, Plus, BookOpen, Film, Tv, ArrowRight, Layers } from 'lucide-react'
import type { MovieSchemaData } from '../movies/schemas/movieSchema'
import { AddContentModal } from './components/AddContentModal'
import type { AddToWatchlistSchemaData } from '../movies/schemas/addToWatchlistSchema'
import { EmptyState } from '../../shared/components/common/EmptyState'

export function HomePage() {
  const navigate = useNavigate()
  const { data: dashboardData, isLoading: loading, error, refetch } = useDashboardQuery()
  const { 
    openContentSelector, 
    handleSelectMovie,
    handleSelectMovieWatchlist,
    handleSelectSeries,
    handleSelectSeriesWatchlist,
    handleSelectBook,
  } = useAddContentModal()

  const createMovieMutation = useCreateMovieMutation()
  const createSeriesMutation = useCreateSeriesMutation()
  const createWatchlistMovieMutation = useCreateWatchlistMovieMutation()

  const handleAddMovie = async (movieData: MovieSchemaData) => {
    await createMovieMutation.mutateAsync(movieData)
    refetch()
  }

  const handleAddSeriesWithStructure = async (data: any) => {
    await createSeriesMutation.mutateAsync({
      title: data.title,
      creator: data.creator,
      year: data.year,
      genre: data.genre,
      status: 'watching',
      start_date: new Date().toISOString().slice(0, 16),
      is_rewatch: false,
      seasons: data.seasons,
    } as any)
    refetch() 
  }

  const handleAddToWatchlist = async (data: AddToWatchlistSchemaData) => {
    await createWatchlistMovieMutation.mutateAsync(data)
    refetch() 
  }

  const openAddSelector = (mode: 'add' | 'watchlist' = 'add') => {
    if (mode === 'add') {
      openContentSelector(
        'add',
        () => handleSelectMovie(handleAddMovie),
        () => handleSelectSeries(handleAddSeriesWithStructure),
        () => handleSelectBook()
      )
    } else {
      openContentSelector(
        'watchlist',
        () => handleSelectMovieWatchlist(handleAddToWatchlist),
        () => handleSelectSeriesWatchlist(handleAddToWatchlist),
        () => handleSelectBook()
      )
    }
  }

  if (loading) {
    return (
      <div className="w-full py-32 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2e323c] border-t-accent-vermillion rounded-full animate-spin mb-4" />
        <p className="text-xs font-mono text-content-muted uppercase tracking-widest">Accessing Archives...</p>
      </div>
    )
  }

  if (error || !dashboardData) {
    return (
      <div className="w-full py-20 flex items-center justify-center">
        <div className="text-center bg-[#1e2026] border border-[#2e323c] p-8 rounded-[6px] max-w-md w-full">
          <h2 className="text-lg font-bold text-danger mb-2">Connection Lost</h2>
          <p className="text-xs text-content-secondary mb-6">Unable to retrieve logs from local archive.</p>
          <button className="btn-primary w-full py-2 text-xs" onClick={() => refetch()}>
            Reconnect
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-8 page-fade-in">
      {/* Top Banner / Hero Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#2e323c]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-accent-vermillion"></span>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-accent-ochre">
              Chronicle Archive &bull; Dashboard
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-content-primary">
            Media & Reading Collection
          </h1>
          <p className="text-xs text-content-secondary mt-1 font-sans">
            Personal records of cinema, episodic television, and literature.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => openAddSelector('add')}
            className="btn-primary px-4 py-2 text-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Log Content</span>
          </button>

          <button
            onClick={() => openAddSelector('watchlist')}
            className="btn-secondary px-4 py-2 text-xs flex items-center gap-2"
          >
            <Bookmark className="w-4 h-4 text-accent-ochre" />
            <span>Add to Queue</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Books Logged', value: dashboardData.stats.total_books, icon: BookOpen, accent: 'card-accent-indigo', badge: 'mono-badge-indigo', path: '/books' },
          { label: 'Cinema Watched', value: dashboardData.stats.total_movies, icon: Film, accent: 'card-accent-cyan', badge: 'mono-badge-cyan', path: '/movies' },
          { label: 'Series Tracked', value: dashboardData.stats.total_series, icon: Tv, accent: 'card-accent-ochre', badge: 'mono-badge-ochre', path: '/series' },
          { label: 'Queue / Watchlist', value: dashboardData.stats.watchlist, icon: Layers, accent: 'card-accent-vermillion', badge: 'mono-badge-vermillion', path: '/movies/watchlist' },
        ].map((stat, i) => (
          <div 
            key={i} 
            className={`bg-[#1e2026] border border-[#2e323c] rounded-[6px] p-4 cursor-pointer hover:bg-[#262830] transition-all duration-150 flex items-center justify-between ${stat.accent}`}
            onClick={() => navigate(stat.path)}
          >
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-content-muted font-bold mb-1">{stat.label}</div>
              <div className="text-2xl font-mono font-bold text-content-primary">{stat.value}</div>
            </div>
            <div className="w-9 h-9 rounded-[4px] bg-[#121316] border border-[#2e323c] flex items-center justify-center">
              <stat.icon className="w-4 h-4 text-content-secondary" />
            </div>
          </div>
        ))}
      </div>

      {/* Content Sections */}
      {[
        { title: 'In Progress', items: dashboardData.continue_watching, icon: Play, navigateTo: '/books', subtitle: 'Currently active logs' },
        { title: 'Recent Completions', items: dashboardData.recently_completed, icon: Star, navigateTo: '/movies/recently-watched', subtitle: 'Recently finished' },
        { title: 'Queue & Watchlist', items: dashboardData.watchlist_preview, icon: Bookmark, navigateTo: '/movies/watchlist', subtitle: 'Queued next' }
      ].map((section, idx) => section.items.length > 0 && (
        <section key={idx} className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#2e323c] pb-2.5">
            <div className="flex items-center gap-2.5">
              <section.icon className="w-4 h-4 text-accent-vermillion" />
              <div>
                <h2 className="text-base font-bold text-content-primary tracking-tight">{section.title}</h2>
              </div>
              <span className="text-[10px] font-mono text-content-muted">/ {section.subtitle}</span>
            </div>
            <button
              onClick={() => navigate(section.navigateTo)}
              className="flex items-center gap-1.5 text-xs font-mono font-bold text-content-secondary hover:text-white transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {section.items.map((item) => (
              <ItemSummaryCard key={`${item.type}-${item.id}`} item={item} />
            ))}
          </div>
        </section>
      ))}

      {/* Empty State */}
      {dashboardData.continue_watching.length === 0 &&
        dashboardData.recently_completed.length === 0 &&
        dashboardData.watchlist_preview.length === 0 && (
          <EmptyState
            icon={Layers}
            badge="DASHBOARD ARCHIVE"
            title="Your Chronicle is Waiting"
            description="Your media vault currently has no active in-progress sessions, completions, or queued items. Begin chronicling your collection across books, films, and series."
            accent="vermillion"
            actionText="Log Content"
            onAction={() => openAddSelector('add')}
            secondaryActionText="Add to Queue"
            onSecondaryAction={() => openAddSelector('watchlist')}
          />
      )}
    </div>
  )
}
