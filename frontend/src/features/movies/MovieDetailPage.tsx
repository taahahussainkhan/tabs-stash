import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Breadcrumbs } from '../../shared/components/common/Breadcrumbs'
import { 
  ArrowLeft, 
  Film, 
  User as UserIcon, 
  Calendar, 
  Star, 
  Clock, 
  History, 
  MessageSquare
} from 'lucide-react'
import { useMovieSessionsWithCommentsQuery } from './hooks/useMoviesQuery'
import { LoadingSpinner } from '../../shared/components/common/LoadingSpinner'
import { formatDate } from '../../shared/utils/date'
import { formatSecondsAsHoursMinutes } from '../../shared/utils/time'
import { getStatusColorClass } from '../../shared/utils/styles'
import { EmptyState } from '../../shared/components/common/EmptyState'

export function MovieDetailPage() {
  const { movieId } = useParams<{ movieId: string }>()
  const navigate = useNavigate()

  const { data, isLoading, error } = useMovieSessionsWithCommentsQuery(movieId!)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <LoadingSpinner />
        <p className="text-xs font-mono text-content-muted uppercase tracking-wider">Retrieving Cinema Details...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 bg-danger/10 rounded-[var(--radius-sm)] border border-danger/20 flex items-center justify-center mb-4">
          <Film className="w-6 h-6 text-danger" />
        </div>
        <h2 className="text-lg font-bold text-content-primary mb-1">Movie Not Found</h2>
        <p className="text-xs text-content-muted mb-6 max-w-sm">The requested film could not be found in your archives.</p>
        <button onClick={() => navigate('/movies')} className="btn-secondary text-xs px-4 py-2 flex items-center gap-2">
          <ArrowLeft size={14} />
          Return to Film Archive
        </button>
      </div>
    )
  }

  const { movie, sessions } = data

  return (
    <div className="space-y-8 page-fade-in">
      <Breadcrumbs 
        backHref="/movies"
        backLabel="Back to Film Archive"
        items={[
          { label: 'Movie Archive', href: '/movies' },
          { label: movie.title }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Poster & Tracking Stats */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[var(--surface)] rounded-[var(--radius-md)] p-2 border border-[var(--border-color)] shadow-lg relative">
            <div className="aspect-[2/3] rounded-[var(--radius-sm)] overflow-hidden bg-[var(--background)] relative border border-[var(--border-color)]">
              {movie.poster_image ? (
                <img src={movie.poster_image} alt={movie.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-content-muted/20">
                  <Film size={60} />
                </div>
              )}
            </div>
            
            {/* Status Badge */}
            <div className="absolute top-4 right-4">
              <span className={`px-2 py-0.5 rounded-[var(--radius-xs)] text-[10px] font-mono font-bold uppercase tracking-wider border ${getStatusColorClass(movie.status)}`}>
                {movie.status}
              </span>
            </div>
          </div>

          {/* Quick Tracking Stats */}
          <div className="bg-[var(--surface)] rounded-[var(--radius-md)] p-4 border border-[var(--border-color)] space-y-4 font-mono">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent-cyan pb-2 border-b border-[var(--border-subtle)]">
              <Clock size={14} /> Tracking Metrics
            </div>
            
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-content-muted">Rewatches</span>
                <span className="text-content-primary font-bold">{movie.rewatch_count || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-content-muted">Added On</span>
                <span className="text-content-primary">{formatDate(movie.created_at)}</span>
              </div>
              {movie.is_favorite && (
                <div className="flex justify-between items-center pt-2 border-t border-[var(--border-subtle)] text-accent-ochre font-bold">
                  <span>Favorite Status</span>
                  <div className="flex items-center gap-1">
                    <Star size={13} className="fill-current" />
                    <span>Starred</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Details & History */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Details */}
          <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-[var(--radius-md)] p-5 space-y-3">
            <div className="flex flex-wrap items-center gap-1.5 font-mono">
              {movie.genre?.split(',').map(g => (
                <span key={g} className="mono-badge mono-badge-cyan text-[10px]">
                  {g.trim()}
                </span>
              ))}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight leading-tight">{movie.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-content-muted pt-1">
              {movie.director && (
                <div className="flex items-center gap-1.5">
                  <UserIcon size={14} className="text-accent-cyan" />
                  <span>{movie.director}</span>
                </div>
              )}
              {movie.year && (
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-accent-cyan" />
                  <span>{movie.year}</span>
                </div>
              )}
            </div>
          </div>

          {/* Viewing History Timeline */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
              <h2 className="text-sm font-bold text-content-primary flex items-center gap-2 tracking-tight">
                <History className="w-4 h-4 text-accent-vermillion" /> Viewing Sessions
              </h2>
              <span className="text-[10px] font-mono text-content-muted uppercase">
                {sessions.length} Recorded
              </span>
            </div>

            <div className="space-y-3">
              {sessions.length > 0 ? (
                sessions.map((session) => (
                  <div key={session.sessionId} className="bg-[var(--surface)] border border-[var(--border-color)] border-l-[3px] border-l-accent-cyan rounded-[var(--radius-md)] p-4 space-y-3">
                    <div className="flex items-center justify-between gap-4 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-[var(--radius-xs)] text-[10px] font-bold uppercase tracking-wider border ${getStatusColorClass(session.status)}`}>
                          {session.status}
                        </span>
                        <span className="text-content-muted">
                          {formatDate(session.startDate)}
                          {session.endDate && ` — ${formatDate(session.endDate)}`}
                        </span>
                      </div>
                      
                      {session.rating != null && (
                        <div className="flex items-center gap-1 text-accent-ochre font-bold">
                          <Star size={13} className="fill-current" />
                          <span>{session.rating.toFixed(1)}/10</span>
                        </div>
                      )}
                    </div>

                    {session.notes && (
                      <p className="text-xs text-content-secondary leading-relaxed bg-[var(--surface-input)] p-2.5 rounded-[var(--radius-sm)] border border-[var(--border-color)] font-sans">
                        "{session.notes}"
                      </p>
                    )}

                    {/* Session Comments */}
                    {session.comments.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-[var(--border-subtle)]">
                        {session.comments.map(comment => (
                          <div key={comment.public_id} className="bg-[var(--surface-input)] rounded-[var(--radius-sm)] p-2.5 border border-[var(--border-color)]">
                            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-accent-cyan mb-1">
                              <MessageSquare size={11} />
                              <span>{comment.timestamp ? formatSecondsAsHoursMinutes(comment.timestamp) : 'General Note'}</span>
                            </div>
                            <p className="text-xs text-content-primary">
                              {comment.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <EmptyState
                  icon={History}
                  badge="SESSION TIMELINE"
                  title="No Viewing Sessions Logged"
                  description="No viewing sessions recorded for this movie yet."
                  accent="cyan"
                  compact={true}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
