import { useNavigate } from 'react-router-dom'
import { useDashboardQuery } from '../../services/dashboardService'
import { ItemSummaryCard } from './components/ItemSummaryCard'
import { useAddContentModal } from './hooks/useAddContentModal'
import { useCreateMovieMutation, useCreateWatchlistMovieMutation } from '../movies/hooks/useMovieQueries'
import { useCreateSeriesMutation } from '../series/hooks/useSeriesQueries'
import { seriesService } from '../../services/seriesService'
import { Play, Star, Bookmark, Plus, BookOpen, Film, Tv, ArrowRight, Sparkles } from 'lucide-react'
import type { MovieSchemaData } from '../movies/schemas/movieSchema'
import { AddContentModal } from './components/AddContentModal'
import { AddSeriesWithStructureModal } from '../series/components/AddSeriesWithStructureModal'

export function HomePage() {
  const navigate = useNavigate()
  const { data: dashboardData, isLoading: loading, error, refetch } = useDashboardQuery()
  const { 
    isContentSelectorOpen,
    selectorMode,
    openContentSelector, 
    closeContentSelector,
    handleSelectMovie,
    handleSelectMovieWatchlist,
    handleSelectSeries,
    handleSelectSeriesWatchlist,
    handleSelectBook,
    showAddSeriesStructureModal,
    closeSeriesModal,
    seriesSubmitHandler
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
      director: data.creator,
      year: data.year,
      genre: data.genre,
      status: 'watching',
      start_date: new Date().toISOString().slice(0, 16),
      is_rewatch: false,
      seasons: data.seasons,
    } as any)
    refetch() 
  }

  const handleAddToWatchlist = async (data: any) => {
    await createWatchlistMovieMutation.mutateAsync(data)
    refetch() 
  }

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-pastel-blue/20 border-t-pastel-blue rounded-full animate-spin"></div>
          <p className="text-[10px] font-bold tracking-[0.3em] text-content-secondary uppercase">Accessing Archives</p>
        </div>
      </div>
    )
  }

  if (error || !dashboardData) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center soft-glass p-12 rounded-4xl max-w-md">
          <h2 className="text-3xl font-serif text-pastel-rose mb-4">Connection Lost</h2>
          <p className="text-content-secondary mb-8">We couldn't retrieve your logs from the archive.</p>
          <button className="btn-pastel-sage w-full justify-center" onClick={() => refetch()}>
            Reconnect
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen page-fade-in relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pastel-lavender/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pastel-blue/5 blur-[120px] rounded-full" />
      <div className="absolute top-[30%] right-[10%] w-[20%] h-[20%] bg-pastel-sage/5 blur-[100px] rounded-full" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <header className="mb-24 pt-8">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-4 h-4 text-pastel-blue" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-content-muted">Personal Collection</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-serif text-content-primary mb-8 leading-tight tracking-tight">
            Your <span className="text-pastel-blue italic">Narrative</span>.
          </h1>
          <p className="text-content-secondary text-lg max-w-xl font-light leading-relaxed">
            Curating the media that defines your journey, from the first page to the final frame.
          </p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {[
            { label: 'Library', value: dashboardData.stats.total_books, icon: BookOpen, color: 'text-pastel-sage', path: '/books' },
            { label: 'Cinema', value: dashboardData.stats.total_movies, icon: Film, color: 'text-pastel-blue', path: '/movies' },
            { label: 'Series', value: dashboardData.stats.total_series, icon: Tv, color: 'text-pastel-amber', path: '/series' },
            { label: 'Queue', value: dashboardData.stats.watchlist, icon: Bookmark, color: 'text-pastel-slate', path: '/watchlist' },
          ].map((stat, i) => (
            <div 
              key={i} 
              className="soft-glass p-8 rounded-4xl group cursor-pointer hover:bg-white/5 transition-all duration-500"
              onClick={() => navigate(stat.path)}
            >
               <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-10 transition-transform group-hover:scale-110 ${stat.color}`}>
                 <stat.icon className="w-6 h-6" />
               </div>
               <div>
                 <div className="text-[10px] uppercase tracking-[0.2em] text-content-muted font-bold mb-2">{stat.label}</div>
                 <div className="text-5xl font-serif text-content-primary">{stat.value}</div>
               </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
          <button
            onClick={() => openContentSelector()}
            className="group relative p-12 rounded-5xl bg-pastel-sage/10 hover:bg-pastel-sage/20 transition-all duration-500 flex items-center gap-8 overflow-hidden border border-pastel-sage/20"
          >
            <div className="p-6 bg-pastel-sage text-background rounded-3xl shadow-lg group-hover:rotate-90 transition-transform duration-700">
              <Plus className="w-8 h-8" />
            </div>
            <div className="text-left">
              <h3 className="text-4xl font-serif text-content-primary mb-1">Add Entry</h3>
              <p className="text-[10px] text-pastel-sage uppercase tracking-widest font-bold">New memory logged</p>
            </div>
          </button>

          <button
            onClick={() => openContentSelector('watchlist')}
            className="group relative p-12 rounded-5xl bg-pastel-slate/10 hover:bg-pastel-slate/20 transition-all duration-500 flex items-center gap-8 overflow-hidden border border-pastel-slate/20"
          >
            <div className="p-6 bg-pastel-slate text-background rounded-3xl shadow-lg group-hover:scale-110 transition-transform duration-500">
              <Bookmark className="w-8 h-8" />
            </div>
            <div className="text-left">
              <h3 className="text-4xl font-serif text-content-primary mb-1">The Queue</h3>
              <p className="text-[10px] text-pastel-slate uppercase tracking-widest font-bold">Future experiences</p>
            </div>
          </button>
        </div>

        {/* Content Sections */}
        {[
          { title: 'In Progress', items: dashboardData.continue_watching, icon: Play, navigateTo: '/books', subtitle: 'Currently exploring' },
          { title: 'Recent Completions', items: dashboardData.recently_completed, icon: Star, navigateTo: '/movies/recently-watched', subtitle: 'Closed chapters' },
          { title: 'Upcoming', items: dashboardData.watchlist_preview, icon: Bookmark, navigateTo: '/watchlist', subtitle: 'Next in line' }
        ].map((section, idx) => section.items.length > 0 && (
          <section key={idx} className="mb-32">
            <div className="flex items-end justify-between mb-12 border-b border-white/5 pb-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-1 rounded-full bg-pastel-blue" />
                  <span className="text-[10px] uppercase tracking-[0.3em] text-content-muted font-bold">{section.subtitle}</span>
                </div>
                <h2 className="text-5xl font-serif text-content-primary tracking-tight">{section.title}</h2>
              </div>
              <button
                onClick={() => navigate(section.navigateTo)}
                className="group flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-bold text-content-muted hover:text-pastel-blue transition-all"
              >
                <span>Full Archive</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {section.items.map((item) => (
                <ItemSummaryCard key={`${item.type}-${item.public_id}`} item={item} />
              ))}
            </div>
          </section>
        ))}

        {/* Empty State */}
        {dashboardData.continue_watching.length === 0 &&
          dashboardData.recently_completed.length === 0 &&
          dashboardData.watchlist_preview.length === 0 && (
            <div className="max-w-2xl mx-auto text-center py-40 px-12 rounded-5xl soft-glass border border-white/5">
              <div className="w-24 h-24 bg-white/5 text-content-muted rounded-full flex items-center justify-center mx-auto mb-10">
                <BookOpen className="w-10 h-10 opacity-20" />
              </div>
              <h3 className="text-4xl font-serif text-content-primary mb-4 tracking-tight">A Silent Library</h3>
              <p className="text-content-secondary mb-12 text-lg font-light italic max-w-sm mx-auto leading-relaxed">
                Your archive is waiting for its first entry. Every story begins with a single step.
              </p>
              <button
                onClick={() => openContentSelector('add')}
                className="btn-pastel-sage px-16 py-4 rounded-2xl"
              >
                Start Archiving
              </button>
            </div>
          )}
      </div>

      <AddContentModal
        isOpen={isContentSelectorOpen}
        onClose={closeContentSelector}
        mode={selectorMode}
        onSelectMovie={() => selectorMode === 'watchlist' ? handleSelectMovieWatchlist(handleAddToWatchlist) : handleSelectMovie(handleAddMovie)}
        onSelectSeries={() => selectorMode === 'watchlist' ? handleSelectSeriesWatchlist(handleAddToWatchlist) : handleSelectSeries(handleAddSeriesWithStructure)}
        onSelectBook={() => handleSelectBook()}
      />

      {showAddSeriesStructureModal && seriesSubmitHandler && (
        <AddSeriesWithStructureModal
          onClose={closeSeriesModal}
          onSubmit={seriesSubmitHandler}
        />
      )}
    </div>
  )
}
