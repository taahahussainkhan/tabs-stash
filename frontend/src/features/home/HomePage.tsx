import { useNavigate } from 'react-router-dom'
import {
  Bookmark,
  BookOpen,
  Clock,
  Film,
  Layers,
  Plus,
  Play,
  Star,
  StickyNote,
  Tv,
} from 'lucide-react'
import { useDashboardQuery } from '../../services/dashboardService'
import { ItemSummaryCard } from './components/ItemSummaryCard'
import { useAddContentModal } from './hooks/useAddContentModal'
import { useCreateMovieMutation, useCreateWatchlistMovieMutation } from '../movies/hooks/useMoviesQuery'
import { useCreateSeriesMutation, useCreateWatchlistSeriesMutation } from '../series/hooks/useSeriesQuery'
import type { MovieSchemaData } from '../movies/schemas/movieSchema'
import type { WatchlistMovieData } from '../../shared/components/modals/AddToWatchlistModalContent'
import { mediaCatalogService } from '../../services/mediaCatalogService'
import { EmptyState } from '../../shared/components/common/EmptyState'
import { useAuth } from '../../app/auth'
import { Fab, PageHeader, SectionHeader, Skeleton, StatTile, type FabAction } from '../../design'

const STAT_ACCENT = {
  movie: 'var(--primary)',
  series: 'var(--accent-sage)',
  book: 'var(--accent-ochre)',
  vault: 'var(--accent-cyan)',
  progress: 'var(--accent-indigo)',
  done: 'var(--accent-sage)',
} as const

function DashboardSkeleton() {
  return (
    <div className="w-full space-y-8 page-fade-in">
      <div className="flex flex-col gap-4 pb-6 section-rule md:flex-row md:items-end md:justify-between">
        <div className="space-y-2.5">
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-3 w-56" />
        </div>
        <div className="flex gap-2.5">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-[74px]" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-28" />
        ))}
      </div>
    </div>
  )
}

export function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
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
  const createWatchlistSeriesMutation = useCreateWatchlistSeriesMutation()

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
      status: data.status || 'to_watch',
      start_date: new Date().toISOString().slice(0, 16),
      is_rewatch: false,
      seasons: data.seasons,
    } as any)
    refetch()
  }

  const handleAddMovieToWatchlist = async (data: WatchlistMovieData) => {
    await createWatchlistMovieMutation.mutateAsync({
      title: data.title,
      director: data.director || '',
      year: data.year ?? null,
      genre: data.genre || '',
      posterImage: data.posterImage,
      externalId: data.externalId,
    })
    refetch()
  }

  const handleAddSeriesToWatchlist = async (data: WatchlistMovieData) => {
    let seasons = data.seasons?.map((s) => ({
      seasonNumber: s.seasonNumber,
      episodeCount: s.episodeCount,
      title: s.title || `Season ${s.seasonNumber}`,
      year: s.year || data.year,
      episodes: s.episodes,
    }))

    let posterImage = data.posterImage
    let externalId = data.externalId

    if (!seasons || seasons.length === 0) {
      try {
        const searchResults = await mediaCatalogService.search(data.title, 'series')
        if (searchResults && searchResults.length > 0) {
          const match = searchResults.find(r => r.title.toLowerCase() === data.title.toLowerCase()) || searchResults[0]
          const details = await mediaCatalogService.getDetails(match.id, 'series')
          if (details?.seasons && details.seasons.length > 0) {
            seasons = details.seasons.map((s) => ({
              seasonNumber: s.seasonNumber,
              episodeCount: s.episodeCount,
              title: s.title || `Season ${s.seasonNumber}`,
              year: s.year || data.year,
              episodes: s.episodes,
            }))
          }
          if (!posterImage && details?.posterUrl) {
            posterImage = details.posterUrl
          }
          if (!externalId && details?.id) {
            externalId = details.id
          }
        }
      } catch (err) {
        console.warn('[HomePage] Auto-fetch seasons fallback error:', err)
      }
    }

    await createWatchlistSeriesMutation.mutateAsync({
      title: data.title,
      creator: data.director,
      year: data.year,
      genre: data.genre,
      posterImage,
      externalId,
      seasons: seasons && seasons.length > 0 ? seasons : undefined,
    })
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
        () => handleSelectMovieWatchlist(handleAddMovieToWatchlist),
        () => handleSelectSeriesWatchlist(handleAddSeriesToWatchlist),
        () => handleSelectBook()
      )
    }
  }

  const fabActions: FabAction[] = [
    { key: 'card', label: 'Quick card', icon: StickyNote, accent: 'var(--accent-indigo)', onSelect: () => navigate('/cards') },
    { key: 'vault', label: 'Tab vault', icon: Layers, accent: 'var(--accent-cyan)', onSelect: () => navigate('/tabs') },
    { key: 'queue', label: 'Add to queue', icon: Bookmark, accent: 'var(--accent-ochre)', onSelect: () => openAddSelector('watchlist') },
    { key: 'log', label: 'Log content', icon: Plus, accent: 'var(--primary)', onSelect: () => openAddSelector('add') },
  ]

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error || !dashboardData) {
    return (
      <div className="flex w-full items-center justify-center py-20">
        <div className="w-full max-w-md rounded-[var(--radius-lg)] border border-border-main bg-surface p-8 text-center">
          <h2 className="mb-2 text-lg font-bold text-danger">Connection lost</h2>
          <p className="mb-6 text-xs text-content-secondary">Unable to reach the archive. Check the server and try again.</p>
          <button className="btn-primary w-full py-2 text-xs" onClick={() => refetch()}>
            Reconnect
          </button>
        </div>
      </div>
    )
  }

  const { stats } = dashboardData
  const greetingName = user?.first_name || user?.username || user?.email?.split('@')[0] || 'there'
  const isEmpty =
    dashboardData.continue_watching.length === 0 &&
    dashboardData.recently_completed.length === 0 &&
    dashboardData.watchlist_preview.length === 0

  return (
    <div className="w-full space-y-8 page-fade-in">
      <PageHeader
        eyebrow="Lore archive / dashboard"
        tone="ochre"
        title={`Hi, ${greetingName}`}
        description="Everything you have watched, read and saved — across cinema, series, books and the tab vault."
        actions={
          <>
            <button onClick={() => openAddSelector('add')} className="btn-primary flex items-center gap-2 px-4 py-2 text-xs">
              <Plus className="h-4 w-4" />
              <span>Log content</span>
            </button>
            <button onClick={() => openAddSelector('watchlist')} className="btn-secondary flex items-center gap-2 px-4 py-2 text-xs">
              <Bookmark className="h-4 w-4" style={{ color: 'var(--accent-ochre)' }} />
              <span>Add to queue</span>
            </button>
          </>
        }
      />

      {/* Counters — one indexed stats document, never a full collection scan */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <StatTile label="Movies" value={stats.total_movies} icon={Film} accent={STAT_ACCENT.movie} to="/movies" />
        <StatTile label="Series" value={stats.total_series} icon={Tv} accent={STAT_ACCENT.series} to="/series" />
        <StatTile label="Books" value={stats.total_books} icon={BookOpen} accent={STAT_ACCENT.book} to="/books" />
        <StatTile label="Stashed tabs" value={stats.total_stashed_tabs} icon={Layers} accent={STAT_ACCENT.vault} to="/tabs" />
        <StatTile label="In progress" value={stats.watching + stats.reading} icon={Play} accent={STAT_ACCENT.progress} hint={`${stats.watching} watching · ${stats.reading} reading`} />
        <StatTile label="Completed" value={stats.completed} icon={Star} accent={STAT_ACCENT.done} hint={`${stats.completed_this_month} this month`} />
      </section>

      {/* Highlight: this month's wins plus the queue in one glance */}
      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div
          className="rounded-[var(--radius-lg)] border border-[var(--border-color)] p-5"
          style={{ background: 'linear-gradient(135deg, var(--primary-soft), transparent 70%)' }}
        >
          <div className="eyebrow" style={{ color: 'var(--primary)' }}>Finished this month</div>
          <div className="mt-2 text-3xl font-extrabold tracking-tight text-content-primary">
            {stats.completed_this_month}
          </div>
          <p className="mt-1 text-[11px] text-content-secondary">
            {stats.completed_this_month === 0
              ? 'Nothing closed out yet — the month is young.'
              : 'Titles marked complete since the 1st.'}
          </p>
        </div>

        <div className="tile p-5">
          <div className="flex items-center justify-between">
            <div className="eyebrow">Queue</div>
            <Bookmark className="h-4 w-4" style={{ color: 'var(--accent-ochre)' }} />
          </div>
          <div className="mt-2 text-3xl font-extrabold tracking-tight text-content-primary">{stats.watchlist}</div>
          <button
            onClick={() => navigate('/movies/watchlist')}
            className="mt-1 text-[11px] font-semibold text-content-secondary transition-colors hover:text-content-primary"
          >
            Open watchlist →
          </button>
        </div>

        <div className="tile p-5">
          <div className="flex items-center justify-between">
            <div className="eyebrow">Captured</div>
            <Clock className="h-4 w-4" style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <div className="mt-2 text-3xl font-extrabold tracking-tight text-content-primary">
            {(stats.total_cards ?? 0) + (stats.total_links ?? 0)}
          </div>
          <p className="mt-1 text-[11px] text-content-secondary">
            {stats.total_cards ?? 0} cards · {stats.total_links ?? 0} links
          </p>
        </div>
      </section>

      {[
        { title: 'In progress', items: dashboardData.continue_watching, icon: Play, navigateTo: '/books', subtitle: 'Active logs' },
        { title: 'Recently finished', items: dashboardData.recently_completed, icon: Star, navigateTo: '/movies/recently-watched', subtitle: 'Closed out' },
        { title: 'Queue & watchlist', items: dashboardData.watchlist_preview, icon: Bookmark, navigateTo: '/movies/watchlist', subtitle: 'Up next' },
      ].map((section) => section.items.length > 0 && (
        <section key={section.title} className="space-y-4">
          <SectionHeader
            title={section.title}
            subtitle={section.subtitle}
            icon={section.icon}
            count={section.items.length}
            viewAllTo={section.navigateTo}
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {section.items.map((item) => (
              <ItemSummaryCard key={`${item.type}-${item.id}`} item={item} />
            ))}
          </div>
        </section>
      ))}

      {isEmpty && (
        <EmptyState
          icon={Layers}
          badge="DASHBOARD ARCHIVE"
          title="Your archive is waiting"
          description="Nothing is in progress, completed or queued yet. Start from the button in the corner, or log something directly."
          accent="vermillion"
          actionText="Log content"
          onAction={() => openAddSelector('add')}
          secondaryActionText="Add to queue"
          onSecondaryAction={() => openAddSelector('watchlist')}
        />
      )}

      <Fab actions={fabActions} label="New entry" />
    </div>
  )
}
