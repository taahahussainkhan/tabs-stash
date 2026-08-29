import { useState } from 'react'
import { useMovieWithSessionsQuery, useSessionCommentsQuery } from '../hooks/useMovieQueries'
import { CommentItem } from '../../../shared/components/common/CommentItem'
import { ChevronDown, ChevronRight, Calendar, Star, MessageCircle, Clock, Film, X } from 'lucide-react'
import { formatDateTime } from '../../../shared/utils/date'

interface MovieHistoryModalContentProps {
  movieId: string
  onClose: () => void
}

export function MovieHistoryModalContent({ movieId, onClose }: MovieHistoryModalContentProps) {
  const { data, isLoading, error } = useMovieWithSessionsQuery(movieId, true)
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set())

  const toggleSession = (sessionId: string) => {
    setExpandedSessions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId)
      } else {
        newSet.add(sessionId)
      }
      return newSet
    })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#2e323c] border-t-accent-cyan animate-spin" />
        <p className="text-xs font-mono text-content-muted">Retrieving cinematic timeline...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-[#271414] border border-danger/30 rounded-[4px] m-6">
        <p className="text-xs font-bold text-danger">Failed to load session timeline.</p>
        <button className="btn-danger text-xs px-3 py-1 mt-2" onClick={() => window.location.reload()}>Retry</button>
      </div>
    )
  }

  const movie = data?.movie
  const sessions = [...(data?.sessions || [])].sort((a, b) => 
    new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  )

  return (
    <div className="flex flex-col h-full bg-[#1e2026]">
      <div className="p-6 sm:p-10 flex-1 overflow-y-auto custom-scrollbar space-y-6">
        {/* Title */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2 font-mono">
            <span className="mono-badge mono-badge-cyan text-[9px]">TIMELINE</span>
            <span className="text-[10px] text-content-muted uppercase tracking-wider">{movie?.title}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight">
            Viewing History Archive
          </h2>
          <p className="text-xs text-content-secondary">
            Chronological records and observations across all viewing sessions.
          </p>
        </div>

        {/* Sessions list */}
        {sessions.length === 0 ? (
          <div className="py-12 bg-[#15161a] border border-[#2e323c] rounded-[6px] text-center">
            <p className="text-xs font-mono text-content-muted">No viewing sessions recorded in the archive yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session, index) => {
              const isExpanded = expandedSessions.has(session.public_id)
              const sessionNum = sessions.length - index

              return (
                <div 
                  key={session.public_id} 
                  className="bg-[#15161a] border border-[#2e323c] rounded-[4px] overflow-hidden"
                >
                  <div 
                    className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#1a1c22] transition-colors"
                    onClick={() => toggleSession(session.public_id)}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-accent-cyan shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-content-muted shrink-0" />
                      )}
                      <div>
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span className="font-bold text-content-primary">Session #{sessionNum}</span>
                          <span className="mono-badge mono-badge-cyan text-[9px] uppercase">{session.status}</span>
                        </div>
                        <div className="text-[11px] font-mono text-content-muted mt-0.5">
                          {formatDateTime(session.start_date)}
                          {session.end_date && ` — ${formatDateTime(session.end_date)}`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {session.rating && (
                        <div className="flex items-center gap-1 font-mono text-xs font-bold text-accent-ochre">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{session.rating.toFixed(1)}</span>
                        </div>
                      )}
                      {session.comments && session.comments.length > 0 && (
                        <div className="flex items-center gap-1 font-mono text-[10px] text-accent-cyan">
                          <MessageCircle className="w-3 h-3" />
                          <span>{session.comments.length}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 pt-0 border-t border-[#242730] space-y-3 bg-[#121316]">
                      {session.notes && (
                        <div className="mt-3 bg-[#17181d] border border-[#2e323c] rounded-[4px] p-2.5">
                          <div className="text-[10px] font-mono uppercase text-content-muted mb-1">Session Reflections</div>
                          <p className="text-xs text-content-secondary leading-relaxed font-sans">{session.notes}</p>
                        </div>
                      )}

                      <SessionCommentsList sessionId={session.public_id} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 sm:px-10 py-4 border-t border-[#2e323c] flex items-center justify-end bg-[#17181d] shrink-0">
        <button type="button" className="btn-secondary px-5 py-2 text-xs font-semibold" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}

function SessionCommentsList({ sessionId }: { sessionId: string }) {
  const { data: comments, isLoading } = useSessionCommentsQuery(sessionId)

  if (isLoading) {
    return <div className="text-[11px] font-mono text-content-muted py-2">Loading notes...</div>
  }

  if (!comments || comments.length === 0) {
    return <div className="text-[11px] font-mono text-content-muted py-2">No timestamped marginalia recorded.</div>
  }

  return (
    <div className="space-y-1.5 pt-2">
      <div className="text-[10px] font-mono uppercase text-content-muted">Marginalia ({comments.length})</div>
      <div className="space-y-1.5">
        {comments.map((comment) => (
          <CommentItem 
            key={comment.public_id} 
            comment={comment}
            showActions={false}
          />
        ))}
      </div>
    </div>
  )
}
