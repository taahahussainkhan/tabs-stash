import { Plus, Network, BookOpen, Hash } from 'lucide-react'
import { GenreNetworkGraph } from './components/GenreNetworkGraph'
import type { GenreWithBooks } from './api/genresApi'
import { EmptyState } from '../../shared/components/common/EmptyState'

interface GenresViewProps {
  networkData: GenreWithBooks[] | undefined
  isLoading: boolean
  newGenreName: string
  setNewGenreName: (name: string) => void
  handleCreate: (e: React.FormEvent) => void
  isCreating: boolean
}

export function GenresView({
  networkData,
  isLoading,
  newGenreName,
  setNewGenreName,
  handleCreate,
  isCreating
}: GenresViewProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-[#2e323c] border-t-accent-indigo animate-spin mb-3" />
        <p className="text-xs font-mono text-content-muted">Loading genres taxonomy...</p>
      </div>
    )
  }

  const displayData = networkData || []

  return (
    <div className="space-y-6 page-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#2e323c]">
        <div>
          <div className="flex items-center gap-2 mb-1.5 font-mono">
            <span className="mono-badge mono-badge-indigo">TAXONOMY</span>
            <span className="text-[11px] text-content-muted uppercase tracking-wider">Classification &amp; Themes</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight">Genre &amp; Theme Registry</h1>
          <p className="text-xs text-content-secondary mt-1">
            Categorize and explore literary styles and narrative themes across your collection.
          </p>
        </div>

        <form onSubmit={handleCreate} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="New genre or theme..."
            className="input-modern bg-[#15161a] border border-[#2e323c] rounded-[4px] px-3 py-1.5 text-xs text-content-primary placeholder:text-content-muted focus:border-accent-indigo outline-none w-48 sm:w-60"
            value={newGenreName}
            onChange={e => setNewGenreName(e.target.value)}
          />
          <button
            type="submit"
            disabled={!newGenreName.trim() || isCreating}
            className="btn-primary px-3.5 py-1.5 text-xs flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isCreating ? 'Adding...' : 'Add'}</span>
          </button>
        </form>
      </div>

      {/* Network Visualization */}
      {displayData.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-wider text-content-muted">
            <Network className="w-3.5 h-3.5 text-accent-indigo" />
            <span>Thematic Classification Graph</span>
          </div>
          <div className="rounded-[6px] overflow-hidden border border-[#2e323c] bg-[#1e2026] p-1">
            <GenreNetworkGraph data={displayData} />
          </div>
        </section>
      )}

      {/* Main Content */}
      <div className="space-y-4">
        {displayData.length > 0 ? (
          <div className="bg-[#1e2026] rounded-[6px] border border-[#2e323c] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#2e323c] bg-[#17181d]">
                    <th className="py-3 px-4 text-[10px] font-mono font-bold uppercase tracking-wider text-content-muted">Genre Name</th>
                    <th className="hidden sm:table-cell py-3 px-4 text-[10px] font-mono font-bold uppercase tracking-wider text-content-muted">Identifier Slug</th>
                    <th className="text-center py-3 px-4 text-[10px] font-mono font-bold uppercase tracking-wider text-content-muted">Volumes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#242730] text-xs">
                  {displayData.map((item) => (
                    <tr key={item.genre.id} className="hover:bg-[#262830] transition-colors group">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-content-primary group-hover:text-accent-indigo transition-colors flex items-center gap-1.5">
                          <Hash className="w-3 h-3 text-content-muted" />
                          <span>{item.genre.name}</span>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell py-3 px-4 font-mono text-content-secondary">
                        <span className="bg-[#15161a] border border-[#2e323c] px-2 py-0.5 rounded-[3px] text-[11px]">
                          {item.genre.slug}
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className="mono-badge mono-badge-indigo text-[10px]">
                          {item.books.length}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={BookOpen}
            badge="GENRE REGISTRY"
            title="No Genres in Taxonomy"
            description="Your library has no genres or theme classifications yet. Create a genre above to start organizing your books."
            accent="indigo"
          />
        )}
      </div>
    </div>
  )
}
