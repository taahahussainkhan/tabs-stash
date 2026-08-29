import { MovieCard } from './components/MovieCard'
import { Table } from '../../shared/components/Table/Table'
import type { MovieLog } from '../types/movie'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid, Table as TableIcon, Film, Search, ArrowUpDown, Plus, ExternalLink, Filter } from 'lucide-react'
import { Pagination } from '../../shared/components/common/Pagination'
import { BulkActionsToolbar } from './components/BulkActionsToolbar'
import { formatDate } from '../../shared/utils/date'
import { getStatusColorClass } from '../../shared/utils/styles'
import type { MoviesPageController } from './hooks/useMoviesPageController'

import { EmptyState } from '../../shared/components/common/EmptyState'

export function MoviesView(props: MoviesPageController) {
  const navigate = useNavigate()
  const {
    settings,
    viewMode,
    setViewMode,
    activeFilters,
    selectedMovies,
    setSelectedMovies,
    openAddMovie,
    handleEditMovie,
    handleDeleteMovie,
    handleAddComments,
    handleRewatchMovie,
    handleViewHistory,
    handleMarkCompleted,
    handleToggleFavorite,
    handleToggleWatchlist,
    handleOpenFilterModal,
    handleBulkDelete,
    handleClearSelection,
    movies,
    loading,
    error,
    page,
    totalPages,
    hasNext,
    hasPrev,
    search,
    sortBy,
    sortOrder,
    stats,
    setPage,
    setSearch,
    setSortBy,
    setSortOrder,
  } = props

  const hasSearchOrFilters = Boolean(search || (activeFilters && Object.keys(activeFilters).length > 0))

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-[#2e323c] border-t-accent-cyan animate-spin mb-3" />
          <p className="text-xs font-mono text-content-muted">Loading film archive...</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="text-center py-12 bg-[#271414] border border-danger/30 rounded-[6px] p-6 max-w-md mx-auto">
          <p className="text-danger font-bold text-sm mb-3">{error}</p>
          <button className="btn-danger text-xs px-4 py-1.5" onClick={() => window.location.reload()}>Retry Archive</button>
        </div>
      )
    }

    if (movies.length === 0) {
      return (
        <EmptyState
          icon={Film}
          badge="CINEMA ARCHIVE"
          title={hasSearchOrFilters ? "No Matching Film Entries" : "Cinema Archive is Empty"}
          description={
            hasSearchOrFilters
              ? "No movie logs match your current search criteria or active filters. Try clearing your query."
              : "You haven't chronicled any movies yet. Begin building your cinematic vault by adding your first record."
          }
          accent="cyan"
          actionText="Add Movie Log"
          onAction={() => openAddMovie()}
          secondaryActionText={hasSearchOrFilters ? "Clear Search" : undefined}
          onSecondaryAction={hasSearchOrFilters ? () => setSearch('') : undefined}
        />
      )
    }

    if (viewMode === 'table') {
      const columns = [
        {
          key: 'title' as keyof MovieLog,
          header: 'Title',
          render: (value: unknown, movie: MovieLog) => (
            <div 
              className="cursor-pointer group/title"
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/movies/${movie.id}`)
              }}
            >
              <div className="font-semibold text-content-primary group-hover/title:text-accent-cyan transition-colors flex items-center gap-1.5">
                <span>{value as string}</span>
                <ExternalLink size={11} className="opacity-0 group-hover/title:opacity-100 transition-opacity" />
              </div>
              <div className="flex gap-1 mt-1 font-mono">
                {movie.is_rewatch && <span className="mono-badge mono-badge-vermillion text-[9px]">Rewatch</span>}
                {movie.is_favorite && <span className="mono-badge mono-badge-ochre text-[9px]">Favorite</span>}
              </div>
            </div>
          )
        },
        {
          key: 'status' as keyof MovieLog,
          header: 'Status',
          render: (value: unknown) => {
            const status = (value as string) || 'watched'
            return (
              <span className={`px-2 py-0.5 rounded-[3px] text-[10px] font-mono font-bold uppercase tracking-wider border ${getStatusColorClass(status)}`}>
                {status}
              </span>
            )
          }
        },
        {
          key: 'rating' as keyof MovieLog,
          header: 'Rating',
          render: (value: unknown) => {
            const rating = value as number | undefined
            if (!rating) return <span className="text-content-muted font-mono">-</span>
            return (
              <div className="flex items-center gap-1 font-mono text-accent-ochre font-bold text-xs">
                <span>★ {rating.toFixed(1)}</span>
              </div>
            )
          }
        },
        {
          key: 'year' as keyof MovieLog,
          header: 'Year',
          render: (value: unknown) => <span className="text-content-muted font-mono text-xs">{value as string || '-'}</span>
        },
        {
          key: 'updated_at' as keyof MovieLog,
          header: 'Activity',
          render: (value: unknown) => <span className="text-content-muted font-mono text-xs">{formatDate(value as string)}</span>
        }
      ]

      const actions = [
        { label: 'View', onClick: (movie: MovieLog) => navigate(`/movies/${movie.id}`) },
        { label: 'Edit', onClick: (movie: MovieLog) => handleEditMovie(movie) },
        { label: 'History', onClick: (movie: MovieLog) => handleViewHistory(movie) },
        { label: 'Delete', onClick: (movie: MovieLog) => handleDeleteMovie(movie.id), className: 'text-danger' },
      ]

      return (
        <Table<MovieLog>
          data={movies}
          columns={columns}
          actions={actions}
          selectable={true}
          selectedRows={selectedMovies}
          onSelectionChange={setSelectedMovies}
        />
      )
    }

    const getGridClasses = () => {
      if (settings.card_layout === 'list') return 'flex flex-col gap-3'
      if (settings.card_layout === 'compact') return 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3'
      return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
    }

    return (
      <div className={getGridClasses()}>
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onEdit={handleEditMovie}
            onAddComments={handleAddComments}
            onRewatch={handleRewatchMovie}
            onViewHistory={handleViewHistory}
            onMarkCompleted={handleMarkCompleted}
            onDelete={handleDeleteMovie}
            onToggleFavorite={handleToggleFavorite}
            onToggleWatchlist={handleToggleWatchlist}
            size={settings.card_size}
            layout={settings.card_layout}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 page-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#2e323c]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="mono-badge mono-badge-cyan">CINEMA</span>
            <span className="text-[11px] font-mono text-content-muted uppercase tracking-wider">Log Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight">Film Archive</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-[#1e2026] p-0.5 rounded-[4px] border border-[#2e323c]">
            <button
              className={`p-1.5 rounded-[3px] transition-colors ${viewMode === 'tiles' ? 'bg-[#121316] text-accent-cyan border border-[#2e323c]' : 'text-content-muted hover:text-white'}`}
              onClick={() => setViewMode('tiles')}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              className={`p-1.5 rounded-[3px] transition-colors ${viewMode === 'table' ? 'bg-[#121316] text-accent-cyan border border-[#2e323c]' : 'text-content-muted hover:text-white'}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          <button 
            onClick={handleOpenFilterModal} 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#1e2026] border border-[#2e323c] text-xs font-semibold text-content-secondary hover:text-white hover:bg-[#262830] transition-colors relative"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
            {Object.keys(activeFilters).length > 0 && (
              <span className="w-4 h-4 bg-accent-vermillion text-[9px] font-mono font-bold text-white rounded-full flex items-center justify-center">
                {Object.keys(activeFilters).length}
              </span>
            )}
          </button>
          
          <button className="btn-primary px-3 py-1.5 text-xs flex items-center gap-1.5" onClick={() => openAddMovie()}>
            <Plus className="w-4 h-4" />
            <span>Add Movie</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
          <div className="bg-[#1e2026] border border-[#2e323c] rounded-[6px] p-3">
            <div className="text-[10px] uppercase text-content-muted mb-0.5">Total Films</div>
            <div className="text-xl font-bold text-content-primary">{stats.total}</div>
          </div>
          <div className="bg-[#1e2026] border border-[#2e323c] border-l-[3px] border-l-accent-cyan rounded-[6px] p-3">
            <div className="text-[10px] uppercase text-accent-cyan mb-0.5">Watching</div>
            <div className="text-xl font-bold text-content-primary">{stats.watching}</div>
          </div>
          <div className="bg-[#1e2026] border border-[#2e323c] border-l-[3px] border-l-accent-sage rounded-[6px] p-3">
            <div className="text-[10px] uppercase text-accent-sage mb-0.5">Completed</div>
            <div className="text-xl font-bold text-content-primary">{stats.completed}</div>
          </div>
          <div className="bg-[#1e2026] border border-[#2e323c] border-l-[3px] border-l-accent-ochre rounded-[6px] p-3">
            <div className="text-[10px] uppercase text-accent-ochre mb-0.5">Paused</div>
            <div className="text-xl font-bold text-content-primary">{stats.paused}</div>
          </div>
        </div>
      )}

      {/* Search & Sort Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-content-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, director, or genre..."
            className="w-full bg-[#15161a] border border-[#2e323c] rounded-[4px] py-1.5 pl-8 pr-4 text-xs text-content-primary placeholder:text-content-muted focus:border-accent-vermillion outline-none transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0">
          <select
            className="bg-[#15161a] border border-[#2e323c] rounded-[4px] py-1.5 px-2 text-xs font-mono text-content-secondary focus:border-accent-vermillion outline-none cursor-pointer"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="updated_at">Sort: Updated</option>
            <option value="created_at">Sort: Added</option>
            <option value="title">Sort: Title</option>
            <option value="year">Sort: Year</option>
          </select>
          <button
            className="p-1.5 rounded-[4px] bg-[#15161a] border border-[#2e323c] text-content-muted hover:text-white transition-colors"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            title="Toggle sort order"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="space-y-6">
        {renderContent()}

        {!loading && !error && movies.length > 0 && (
          <div className="pt-6 border-t border-[#2e323c]">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              hasNext={hasNext}
              hasPrev={hasPrev}
            />
          </div>
        )}
      </div>

      <BulkActionsToolbar
        selectedCount={selectedMovies.length}
        selectedMovies={selectedMovies}
        onDelete={handleBulkDelete}
        onClearSelection={handleClearSelection}
      />
    </div>
  )
}
