import { Plus, LayoutGrid, Table as TableIcon, BookOpen, Search, ArrowUpDown } from 'lucide-react'
import { BookCard } from './components/BookCard'
import { BookTable } from './components/BookTable'
import { Pagination } from '../../shared/components/common/Pagination'
import type { BooksPageController } from './hooks/useBooksPageController'

import { EmptyState } from '../../shared/components/common/EmptyState'

export function BooksView(props: BooksPageController) {
  const {
    settings,
    viewMode,
    setViewMode,
    handleOpenAddModal,
    handleEditBook,
    handleDeleteBook,
    handleViewDetails,
    books,
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

  const hasSearch = Boolean(search)

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-[#2e323c] border-t-accent-indigo animate-spin mb-3" />
          <p className="text-xs font-mono text-content-muted">Loading literature collection...</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="text-center py-12 bg-[#271414] border border-danger/30 rounded-[6px] p-6 max-w-md mx-auto">
          <p className="text-danger font-bold text-sm mb-3">{error}</p>
          <button
            className="btn-danger text-xs px-4 py-1.5"
            onClick={() => window.location.reload()}
          >
            Retry Archive
          </button>
        </div>
      )
    }

    if (books.length === 0) {
      return (
        <EmptyState
          icon={BookOpen}
          badge="LIBRARY COLLECTION"
          title={hasSearch ? "No Matching Volumes Found" : "Personal Library is Empty"}
          description={
            hasSearch
              ? "No books in your catalog match your search query. Try searching for a different title or author."
              : "Your literature archive contains no books yet. Add editions, authors, genres, and page counts to start your library."
          }
          accent="indigo"
          actionText="Add Book Edition"
          onAction={handleOpenAddModal}
          secondaryActionText={hasSearch ? "Clear Search" : undefined}
          onSecondaryAction={hasSearch ? () => setSearch('') : undefined}
        />
      )
    }

    if (viewMode === 'table') {
      return (
        <BookTable
          books={books}
          onEdit={handleEditBook}
          onDelete={handleDeleteBook}
          onViewDetails={handleViewDetails}
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
        {books.map((item) => (
          <BookCard
            key={item.id}
            item={item}
            size={settings.card_size}
            layout={settings.card_layout}
            onEdit={handleEditBook}
            onDelete={handleDeleteBook}
            onViewDetails={handleViewDetails}
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
            <span className="mono-badge mono-badge-indigo">LIBRARY</span>
            <span className="text-[11px] font-mono text-content-muted uppercase tracking-wider">Literature Archive</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight">Book Collection</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-[#1e2026] p-0.5 rounded-[4px] border border-[#2e323c]">
            <button
              className={`p-1.5 rounded-[3px] transition-colors ${viewMode === 'tiles' ? 'bg-[#121316] text-accent-indigo border border-[#2e323c]' : 'text-content-muted hover:text-white'}`}
              onClick={() => setViewMode('tiles')}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              className={`p-1.5 rounded-[3px] transition-colors ${viewMode === 'table' ? 'bg-[#121316] text-accent-indigo border border-[#2e323c]' : 'text-content-muted hover:text-white'}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          <button
            className="btn-primary px-3 py-1.5 text-xs flex items-center gap-1.5"
            onClick={handleOpenAddModal}
          >
            <Plus className="w-4 h-4" />
            <span>Add Book</span>
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
          <div className="bg-[#1e2026] border border-[#2e323c] rounded-[6px] p-3">
            <div className="text-[10px] uppercase text-content-muted mb-0.5">Total Volumes</div>
            <div className="text-xl font-bold text-content-primary">{stats.total}</div>
          </div>
          <div className="bg-[#1e2026] border border-[#2e323c] border-l-[3px] border-l-accent-indigo rounded-[6px] p-3">
            <div className="text-[10px] uppercase text-accent-indigo mb-0.5">Owned</div>
            <div className="text-xl font-bold text-content-primary">{stats.owned}</div>
          </div>
          <div className="bg-[#1e2026] border border-[#2e323c] border-l-[3px] border-l-accent-cyan rounded-[6px] p-3">
            <div className="text-[10px] uppercase text-accent-cyan mb-0.5">Reading</div>
            <div className="text-xl font-bold text-content-primary">{stats.reading}</div>
          </div>
          <div className="bg-[#1e2026] border border-[#2e323c] border-l-[3px] border-l-accent-ochre rounded-[6px] p-3">
            <div className="text-[10px] uppercase text-accent-ochre mb-0.5">Wishlist</div>
            <div className="text-xl font-bold text-content-primary">{stats.wishlist}</div>
          </div>
        </div>
      )}

      {/* Search & Sort Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-content-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search books by title, author, publisher..."
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
            <option value="created_at">Sort: Acquired</option>
            <option value="title">Sort: Title</option>
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

        {!loading && !error && books.length > 0 && (
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
    </div>
  )
}
