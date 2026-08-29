import { Pen, Trash2, UserPlus, BookOpen, Network, UserCircle, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Author } from './types/author'
import type { AuthorWithBooks } from './api/authorsApi'
import { AuthorNetworkGraph } from './components/AuthorNetworkGraph'
import { EmptyState } from '../../shared/components/common/EmptyState'

interface AuthorsViewProps {
  authors: Author[] | undefined
  networkData: AuthorWithBooks[] | undefined
  isLoading: boolean
  handleAddAuthor: () => void
  handleEditAuthor: (author: Author) => void
  handleDeleteAuthor: (author: Author) => void
}

export function AuthorsView({
  authors,
  networkData,
  isLoading,
  handleAddAuthor,
  handleEditAuthor,
  handleDeleteAuthor
}: AuthorsViewProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-[#2e323c] border-t-accent-indigo animate-spin mb-3" />
        <p className="text-xs font-mono text-content-muted">Loading author registry...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 page-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#2e323c]">
        <div>
          <div className="flex items-center gap-2 mb-1.5 font-mono">
            <span className="mono-badge mono-badge-indigo">AUTHORS</span>
            <span className="text-[11px] text-content-muted uppercase tracking-wider">Literary Figures</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight">Author Registry</h1>
          <p className="text-xs text-content-secondary mt-1">
            Writers, creators, and intellectual contributors in your catalog.
          </p>
        </div>

        <button
          onClick={handleAddAuthor}
          className="btn-primary px-4 py-2 text-xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Author</span>
        </button>
      </div>

      {/* Network Visualization */}
      {networkData && networkData.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-wider text-content-muted">
            <Network className="w-3.5 h-3.5 text-accent-indigo" />
            <span>Author Connections Nexus</span>
          </div>
          <div className="rounded-[6px] overflow-hidden border border-[#2e323c] bg-[#1e2026] p-1">
            <AuthorNetworkGraph data={networkData} />
          </div>
        </section>
      )}

      {/* Main Content */}
      <div className="space-y-4">
        {authors && authors.length > 0 ? (
          <div className="bg-[#1e2026] rounded-[6px] border border-[#2e323c] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#2e323c] bg-[#17181d]">
                    <th className="py-3 px-4 text-[10px] font-mono font-bold uppercase tracking-wider text-content-muted">Name</th>
                    <th className="hidden md:table-cell py-3 px-4 text-[10px] font-mono font-bold uppercase tracking-wider text-content-muted">Language</th>
                    <th className="hidden lg:table-cell py-3 px-4 text-[10px] font-mono font-bold uppercase tracking-wider text-content-muted">Country</th>
                    <th className="hidden sm:table-cell py-3 px-4 text-[10px] font-mono font-bold uppercase tracking-wider text-content-muted">Era</th>
                    <th className="text-center py-3 px-4 text-[10px] font-mono font-bold uppercase tracking-wider text-content-muted">Volumes</th>
                    <th className="text-right py-3 px-4 text-[10px] font-mono font-bold uppercase tracking-wider text-content-muted">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#242730] text-xs">
                  {authors.map((author) => (
                    <tr key={author.id} className="hover:bg-[#262830] transition-colors group">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-content-primary group-hover:text-accent-indigo transition-colors">{author.name}</div>
                        {author.bio && (
                          <div className="text-[11px] text-content-muted truncate max-w-sm mt-0.5 font-sans">
                            {author.bio}
                          </div>
                        )}
                      </td>
                      <td className="hidden md:table-cell py-3 px-4 text-content-secondary font-mono">
                        {author.language || '—'}
                      </td>
                      <td className="hidden lg:table-cell py-3 px-4 text-content-secondary">
                        {author.country || '—'}
                      </td>
                      <td className="hidden sm:table-cell py-3 px-4 text-content-muted font-mono">
                        {author.birth_year || '—'}
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className="mono-badge mono-badge-indigo text-[10px]">
                          {author.book_count}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link to={`/authors/${author.id}`}>
                            <button className="p-1 rounded-[3px] text-content-muted hover:text-white bg-[#15161a] border border-[#2e323c]" title="View Profile">
                              <UserCircle className="w-3.5 h-3.5" />
                            </button>
                          </Link>
                          <button
                            className="p-1 rounded-[3px] text-content-muted hover:text-white bg-[#15161a] border border-[#2e323c]"
                            onClick={() => handleEditAuthor(author)}
                            title="Edit"
                          >
                            <Pen className="w-3.5 h-3.5" />
                          </button>
                          <button
                            className="p-1 rounded-[3px] text-danger hover:bg-danger/10 bg-[#15161a] border border-danger/30"
                            onClick={() => handleDeleteAuthor(author)}
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={UserPlus}
            badge="AUTHOR ARCHIVE"
            title="Author Registry is Empty"
            description="No authors or writers cataloged yet. Register your first author to connect books to their creators."
            accent="indigo"
            actionText="Register First Author"
            onAction={handleAddAuthor}
          />
        )}
      </div>
    </div>
  )
}
