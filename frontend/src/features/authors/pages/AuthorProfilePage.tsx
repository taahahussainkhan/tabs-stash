import { useParams, Link } from 'react-router-dom'
import { useSingleAuthorNetworkQuery } from '../hooks/useAuthorsQuery'
import { AuthorNetworkGraph } from '../components/AuthorNetworkGraph'
import { User, Calendar, Globe, ExternalLink, ArrowLeft, BarChart3, Database } from 'lucide-react'

export function AuthorProfilePage() {
    const { authorId } = useParams<{ authorId: string }>()
    const { data, isLoading } = useSingleAuthorNetworkQuery(Number(authorId))

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-bold">Author not found</h1>
                <Link to="/authors" className="btn btn-ghost gap-2 mt-4 text-primary">
                    <ArrowLeft size={16} />
                    Back to Authors
                </Link>
            </div>
        )
    }

    const { author, books } = data

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-700">
            {/* Navigation & Header */}
            <div className="flex flex-col gap-4">
                <Link to="/authors" className="flex items-center gap-2 text-sm text-base-content/60 hover:text-primary transition-colors group w-fit">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Authors Registry
                </Link>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-base-100 p-8 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <User size={120} />
                    </div>

                    <div className="space-y-4 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                <User size={32} />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight">{author.name}</h1>
                                <div className="flex flex-wrap gap-4 mt-2">
                                    {author.country && (
                                        <div className="flex items-center gap-1.5 text-sm text-base-content/60 bg-base-200 px-3 py-1 rounded-full border border-white/5">
                                            <Globe size={14} />
                                            {author.country}
                                        </div>
                                    )}
                                    {author.language && (
                                        <div className="flex items-center gap-1.5 text-sm text-base-content/60 bg-base-200 px-3 py-1 rounded-full border border-white/5">
                                            <Globe size={14} />
                                            {author.language}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {author.bio && (
                            <p className="text-base-content/70 max-w-2xl leading-relaxed italic border-l-4 border-primary/20 pl-4 py-1">
                                {author.bio}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-2 relative z-10">
                        {author.website && (
                            <a href={author.website} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm gap-2 opacity-60 hover:opacity-100">
                                <ExternalLink size={14} />
                                Website
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card bg-base-100 border border-white/5 p-6 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-widest text-base-content/40">Total Books</span>
                        <Database className="text-primary opacity-40" size={18} />
                    </div>
                    <div className="text-3xl font-black">{books.length}</div>
                    <div className="text-[10px] text-content-muted">Cataloged work</div>
                </div>

                <div className="card bg-base-100 border border-white/5 p-6 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-widest text-base-content/40">Birth Year</span>
                        <Calendar className="text-primary opacity-40" size={18} />
                    </div>
                    <div className="text-3xl font-black">{author.birth_year || '—'}</div>
                    {author.death_year && <div className="text-[10px] text-content-muted">To {author.death_year}</div>}
                </div>

                {/* Additional Stats Placeholders */}
                <div className="card bg-base-100 border border-white/5 p-6 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-widest text-base-content/40">Collaborations</span>
                        <BarChart3 className="text-primary opacity-40" size={18} />
                    </div>
                    <div className="text-3xl font-black">0</div>
                    <div className="text-[10px] text-content-muted">Co-authored books</div>
                </div>

                <div className="card bg-base-100 border border-white/5 p-6 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-widest text-base-content/40">Genres</span>
                        <BarChart3 className="text-primary opacity-40" size={18} />
                    </div>
                    <div className="text-3xl font-black">{Array.from(new Set(books.flatMap(b => b.genres?.map(g => g.name) || []))).length}</div>
                    <div className="text-[10px] text-content-muted">Diverse categories</div>
                </div>
            </div>

            {/* Network Visualization */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-base-content/40">
                    <div className="w-1 h-4 bg-primary rounded-full" />
                    Bibliography Network
                </div>
                <AuthorNetworkGraph data={[{ author, books }]} />
            </section>

            {/* Bibliography Table */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-base-content/40">
                    <div className="w-1 h-4 bg-primary rounded-full" />
                    Complete Registry
                </div>
                <div className="card bg-base-100 border border-white/5 overflow-hidden shadow-sm">
                    <table className="table w-full">
                        <thead className="bg-base-200/50">
                            <tr>
                                <th>Title</th>
                                <th>Published</th>
                                <th>Genres</th>
                                <th className="text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {books.map(book => (
                                <tr key={book.public_id} className="hover:bg-base-200/30 transition-colors group">
                                    <td className="font-bold">{book.title}</td>
                                    <td className="opacity-70">{book.original_year || '—'}</td>
                                    <td>
                                        <div className="flex flex-wrap gap-1">
                                            {book.genres?.map(g => (
                                                <span key={g.id} className="badge badge-sm badge-outline opacity-40 group-hover:opacity-100 transition-opacity">
                                                    {g.name}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="text-right">
                                        <Link
                                            to={`/books/${book.public_id}`}
                                            className="btn btn-ghost btn-xs text-primary"
                                        >
                                            View Details
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    )
}
