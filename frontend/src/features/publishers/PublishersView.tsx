import { Plus, Network, Building2, BookOpen, Globe } from 'lucide-react'
import { PublisherNetworkGraph } from './components/PublisherNetworkGraph'
import type { PublisherWithBooks } from './api/publishersApi'
import { EmptyState } from '../../shared/components/common/EmptyState'

interface PublishersViewProps {
  networkData: PublisherWithBooks[] | undefined
  isLoading: boolean
  newPublisherName: string
  setNewPublisherName: (name: string) => void
  handleCreate: (e: React.FormEvent) => void
  isCreating: boolean
}

export function PublishersView({
  networkData,
  isLoading,
  newPublisherName,
  setNewPublisherName,
  handleCreate,
  isCreating
}: PublishersViewProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-[#2e323c] border-t-accent-indigo animate-spin mb-3" />
        <p className="text-xs font-mono text-content-muted">Loading publishing houses...</p>
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
            <span className="mono-badge mono-badge-indigo">PUBLISHERS</span>
            <span className="text-[11px] text-content-muted uppercase tracking-wider">Presses &amp; Houses</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight">Publishing Houses</h1>
          <p className="text-xs text-content-secondary mt-1">
            Manage publishing organizations, imprints, and their editions in your library.
          </p>
        </div>

        <form onSubmit={handleCreate} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="New publisher name..."
            className="input-modern bg-[#15161a] border border-[#2e323c] rounded-[4px] px-3 py-1.5 text-xs text-content-primary placeholder:text-content-muted focus:border-accent-indigo outline-none w-48 sm:w-60"
            value={newPublisherName}
            onChange={e => setNewPublisherName(e.target.value)}
          />
          <button
            type="submit"
            disabled={!newPublisherName.trim() || isCreating}
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
            <span>Publisher Distribution Graph</span>
          </div>
          <div className="rounded-[6px] overflow-hidden border border-[#2e323c] bg-[#1e2026] p-1">
            <PublisherNetworkGraph data={displayData} />
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
                    <th className="py-3 px-4 text-[10px] font-mono font-bold uppercase tracking-wider text-content-muted">Publisher Name</th>
                    <th className="hidden sm:table-cell py-3 px-4 text-[10px] font-mono font-bold uppercase tracking-wider text-content-muted">Country</th>
                    <th className="hidden md:table-cell py-3 px-4 text-[10px] font-mono font-bold uppercase tracking-wider text-content-muted">Founded</th>
                    <th className="hidden lg:table-cell py-3 px-4 text-[10px] font-mono font-bold uppercase tracking-wider text-content-muted">Website</th>
                    <th className="text-center py-3 px-4 text-[10px] font-mono font-bold uppercase tracking-wider text-content-muted">Editions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#242730] text-xs">
                  {displayData.map((item) => (
                    <tr key={item.publisher.id} className="hover:bg-[#262830] transition-colors group">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-content-primary group-hover:text-accent-indigo transition-colors">{item.publisher.name}</div>
                        {item.publisher.description && (
                          <div className="text-[11px] text-content-muted truncate max-w-sm mt-0.5 font-sans">
                            {item.publisher.description}
                          </div>
                        )}
                      </td>
                      <td className="hidden sm:table-cell py-3 px-4 text-content-secondary">
                        {item.publisher.country || '—'}
                      </td>
                      <td className="hidden md:table-cell py-3 px-4 text-content-muted font-mono">
                        {item.publisher.founded_year || '—'}
                      </td>
                      <td className="hidden lg:table-cell py-3 px-4">
                        {item.publisher.website ? (
                          <a 
                            href={item.publisher.website} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-accent-cyan hover:underline flex items-center gap-1 font-mono text-[11px]"
                          >
                            <Globe className="w-3 h-3" />
                            <span>Visit</span>
                          </a>
                        ) : (
                          <span className="text-content-muted font-mono">—</span>
                        )}
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
            icon={Building2}
            badge="PUBLISHER DIRECTORY"
            title="No Publishers in Registry"
            description="Your library has no publishing houses cataloged yet. Add a publisher above to categorize your editions."
            accent="indigo"
          />
        )}
      </div>
    </div>
  )
}
