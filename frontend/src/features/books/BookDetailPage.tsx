import { useParams, useNavigate } from 'react-router-dom'
import { Breadcrumbs } from '../../shared/components/common/Breadcrumbs'
import { useQuery } from '@tanstack/react-query'
import { 
  ArrowLeft, 
  BookOpen, 
  User as UserIcon, 
  Calendar, 
  Globe, 
  Layers, 
  Hash, 
  Building2,
  Tag,
  Star,
  Clock,
  History, 
  MessageSquare
} from 'lucide-react'
import { booksApi } from './api/booksApi'
import { LoadingSpinner } from '../../shared/components/common/LoadingSpinner'
import type { BookWithDetails } from './types/book'
import { EmptyState } from '../../shared/components/common/EmptyState'

export function BookDetailPage() {
  const { bookId } = useParams<{ bookId: string }>()
  const navigate = useNavigate()

  const { data, isLoading, error } = useQuery<BookWithDetails>({
    queryKey: ['book', bookId],
    queryFn: () => booksApi.getOne(bookId!),
    enabled: !!bookId,
  })

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <LoadingSpinner />
        <p className="text-xs font-mono text-content-muted uppercase tracking-wider">Retrieving Volume Details...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-[#1e2026] border border-[#2e323c] p-6 rounded-[6px] max-w-md w-full">
          <p className="text-danger font-bold text-sm mb-4">Volume Not Found</p>
          <button 
            className="btn-secondary text-xs px-4 py-2 w-full flex items-center justify-center gap-2" 
            onClick={() => navigate('/books')}
          >
            <ArrowLeft size={14} />
            Return to Library
          </button>
        </div>
      </div>
    )
  }

  const { item, sessions, comments } = data
  const book = item.edition?.book
  const authors = book?.authors || []
  const authorNames = authors.map(a => a.name).join(', ')
  const edition = item.edition

  return (
    <div className="space-y-6 page-fade-in">
      <Breadcrumbs 
        backHref="/books"
        backLabel="Back to Library"
        items={[
          { label: 'Library', href: '/books' },
          { label: book?.title || 'Volume Details' }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Book Cover & Acquisition */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#1e2026] rounded-[6px] p-2 border border-[#2e323c] shadow-lg relative">
            <div className="aspect-[3/4] rounded-[4px] overflow-hidden bg-[#121316] relative border border-[#2e323c]">
              {edition?.cover_image ? (
                <img src={edition.cover_image} alt={book?.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-content-muted/20">
                  <BookOpen size={60} />
                </div>
              )}
            </div>
            
            {/* Status Badge */}
            <div className="absolute top-4 right-4">
              <span className="mono-badge mono-badge-indigo">
                {item.ownership_status}
              </span>
            </div>
          </div>

          {/* Acquisition Info */}
          <div className="bg-[#1e2026] rounded-[6px] p-4 border border-[#2e323c] space-y-3 font-mono">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent-indigo pb-2 border-b border-[#242730]">
              <Building2 size={14} /> Acquisition Record
            </div>
            <div className="space-y-2 text-xs">
              {item.store && (
                <div className="flex justify-between items-center">
                  <span className="text-content-muted">Source Store</span>
                  <span className="text-content-primary font-bold">{item.store.name}</span>
                </div>
              )}
              {item.purchase_channel && (
                <div className="flex justify-between items-center">
                  <span className="text-content-muted">Channel</span>
                  <span className="text-content-primary">{item.purchase_channel}</span>
                </div>
              )}
              {item.order_placed_date && (
                <div className="flex justify-between items-center">
                  <span className="text-content-muted">Acquired</span>
                  <span className="text-content-primary">{new Date(item.order_placed_date).toLocaleDateString()}</span>
                </div>
              )}
              {item.paid_price !== undefined && (
                <div className="flex justify-between items-center pt-2 border-t border-[#242730]">
                  <span className="text-content-muted">Purchase Cost</span>
                  <span className="text-accent-ochre font-bold">
                    {item.purchase_currency} {item.paid_price?.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Details & Timeline */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Details */}
          <div className="bg-[#1e2026] border border-[#2e323c] rounded-[6px] p-5 space-y-3">
            <div className="flex flex-wrap items-center gap-1.5 font-mono">
              <span className="mono-badge mono-badge-indigo">VOLUME</span>
              {book?.genres?.map(genre => (
                <span key={genre.slug} className="mono-badge mono-badge-neutral text-[10px]">
                  {genre.name}
                </span>
              ))}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight leading-tight">{book?.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-content-muted pt-1">
              {authorNames && (
                <div className="flex items-center gap-1.5">
                  <UserIcon size={14} className="text-accent-indigo" />
                  <span>{authorNames}</span>
                </div>
              )}
              {book?.original_year && (
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-accent-indigo" />
                  <span>{book.original_year}</span>
                </div>
              )}
            </div>
          </div>

          {/* Edition Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono">
            {[
              { icon: Building2, label: 'Publisher', value: edition?.publisher?.name },
              { icon: Clock, label: 'Published', value: edition?.publish_year },
              { icon: Layers, label: 'Format', value: edition?.format },
              { icon: Hash, label: 'ISBN', value: edition?.isbn },
              { icon: Globe, label: 'Language', value: edition?.language },
              { icon: Tag, label: 'Condition', value: item.condition },
            ].map((detail, idx) => detail.value && (
              <div key={idx} className="bg-[#1e2026] rounded-[4px] p-3 border border-[#2e323c]">
                <div className="text-[10px] uppercase text-content-muted mb-0.5">{detail.label}</div>
                <div className="text-xs font-bold text-content-primary truncate">{detail.value}</div>
              </div>
            ))}
          </div>

          {/* Reading Sessions & Comments */}
          <div className="space-y-6">
            {/* Reading History */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#2e323c] pb-2">
                <h2 className="text-sm font-bold text-content-primary flex items-center gap-2">
                  <History className="w-4 h-4 text-accent-vermillion" /> Reading Sessions
                </h2>
                <span className="text-[10px] font-mono text-content-muted uppercase">
                  {sessions.length} Recorded
                </span>
              </div>

              <div className="space-y-3">
                {sessions.length > 0 ? (
                  sessions.map((session) => (
                    <div key={session.public_id} className="bg-[#1e2026] border border-[#2e323c] border-l-[3px] border-l-accent-indigo rounded-[6px] p-4 space-y-2.5">
                      <div className="flex items-center justify-between gap-4 font-mono text-xs">
                        <div className="flex items-center gap-2">
                          <span className="mono-badge mono-badge-sage text-[10px]">
                            {session.status}
                          </span>
                          <span className="text-content-muted">
                            {new Date(session.start_date).toLocaleDateString()}
                            {session.end_date && ` — ${new Date(session.end_date).toLocaleDateString()}`}
                          </span>
                        </div>
                        {session.rating && (
                          <div className="flex items-center gap-1 text-accent-ochre font-bold">
                            <Star size={13} className="fill-current" />
                            <span>★ {session.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      {session.notes && (
                        <p className="text-xs text-content-secondary leading-relaxed bg-[#15161a] p-2 rounded-[4px] border border-[#2e323c] font-sans">
                          "{session.notes}"
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <EmptyState
                    icon={History}
                    badge="READING LOG"
                    title="No Reading Sessions Logged"
                    description="No reading intervals or completion dates tracked for this edition yet."
                    accent="indigo"
                    compact={true}
                  />
                )}
              </div>
            </div>

            {/* Reader Notes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#2e323c] pb-2">
                <h2 className="text-sm font-bold text-content-primary flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-accent-cyan" /> Marginalia &amp; Reader Notes
                </h2>
                <span className="text-[10px] font-mono text-content-muted uppercase">
                  {comments.length} Notes
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {comments.length > 0 ? (
                  comments.map(comment => (
                    <div key={comment.public_id} className="bg-[#1e2026] rounded-[4px] p-3 border border-[#2e323c] space-y-1.5">
                      <div className="flex items-center justify-between font-mono text-[10px] text-accent-cyan font-bold">
                        <span>{comment.chapter_or_episode ? `Chapter ${comment.chapter_or_episode}` : 'Note'}</span>
                        {comment.timestamp && <span>Page {comment.timestamp}</span>}
                      </div>
                      <p className="text-xs text-content-primary leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full">
                    <EmptyState
                      icon={MessageSquare}
                      badge="MARGINALIA"
                      title="No Reader Marginalia Recorded"
                      description="No chapter excerpts, quotes, or reader notes recorded for this volume."
                      accent="cyan"
                      compact={true}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
