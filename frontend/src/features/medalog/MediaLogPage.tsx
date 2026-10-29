import React, { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Film, Tv, Book, Smartphone, Clock, RefreshCw, CircleDot } from 'lucide-react'
import { medalogApi } from './api/medalogApi'
import type { MediaLogRecord, MediaLogType } from './api/medalogApi'

const TYPE_META: Record<MediaLogType, { label: string; icon: typeof Film; color: string; bg: string; border: string }> = {
  movie: { label: 'Movie', icon: Film, color: '#a992ff', bg: 'rgba(124,92,255,0.14)', border: 'rgba(124,92,255,0.4)' },
  series: { label: 'Series', icon: Tv, color: '#5fd6c4', bg: 'rgba(47,184,166,0.14)', border: 'rgba(47,184,166,0.4)' },
  book: { label: 'Book', icon: Book, color: '#f0b072', bg: 'rgba(224,128,58,0.14)', border: 'rgba(224,128,58,0.4)' },
}

function fmtDate(ms: number): string {
  const d = new Date(ms)
  const date = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true })
  return `${date} · ${time}`
}

type Filter = 'active' | 'dissolved' | 'all'

export const MediaLogPage: React.FC = () => {
  const [filter, setFilter] = useState<Filter>('active')

  const { data: records = [], isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['medalog-records'],
    queryFn: () => medalogApi.getRecords(true),
  })

  const shown = useMemo(() => {
    if (filter === 'all') return records
    return records.filter(r => r.status === filter)
  }, [records, filter])

  const totalLogs = records.reduce((acc, r) => acc + (r.logCount ?? r.logs?.length ?? 0), 0)
  const pendingAmp = records.filter(r => r.status === 'dissolved' && !r.ampedAt).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--border-color)] pb-5">
        <div>
          <div className="flex items-center gap-2 text-accent-terracotta">
            <Smartphone className="w-4 h-4" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Phone Captures</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-content-primary mt-1">MediaLog</h1>
          <p className="text-sm text-content-muted mt-1 max-w-2xl">
            Raw records and timestamped logs captured on your phone. Amp these into full entries when you have the time.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="self-start sm:self-auto flex items-center gap-2 px-3 py-2 rounded-[var(--radius-sm)] border border-[var(--border-color)] text-xs font-semibold text-content-secondary hover:text-content-primary hover:bg-[var(--surface)] transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Records" value={records.length} />
        <Stat label="Logs stamped" value={totalLogs} />
        <Stat label="Dissolved · to amp" value={pendingAmp} accent />
      </div>

      {/* Filter */}
      <div className="flex gap-1 p-1 rounded-[var(--radius-md)] bg-[#1a1c22] border border-[var(--border-color)] w-fit">
        {(['active', 'dissolved', 'all'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold capitalize transition ${
              filter === f ? 'bg-[var(--border-color)] text-white' : 'text-content-muted hover:text-content-secondary'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : isError ? (
        <Empty text="Couldn't load your MediaLog captures. Try refreshing." />
      ) : shown.length === 0 ? (
        <Empty text="No records here yet. Add some from the MediaLog app on your phone." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {shown.map(record => (
            <RecordCard key={record.id} record={record} />
          ))}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--surface)] border border-[var(--surface-high)] p-4">
      <div className={`text-2xl font-bold ${accent ? 'text-accent-ochre' : 'text-content-primary'}`}>{value}</div>
      <div className="text-[11px] font-mono uppercase tracking-wider text-content-muted mt-1">{label}</div>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--border-color)] p-12 text-center text-content-muted text-sm">
      {text}
    </div>
  )
}

function RecordCard({ record }: { record: MediaLogRecord }) {
  const meta = TYPE_META[record.mediaType] ?? TYPE_META.movie
  const Icon = meta.icon
  const logs = record.logs ?? []
  const dissolved = record.status === 'dissolved'

  return (
    <div className={`rounded-[var(--radius-md)] border p-5 ${dissolved ? 'bg-[#1a1c22] border-[#3a2a2a]' : 'bg-[var(--surface)] border-[var(--surface-high)]'}`}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-[var(--radius-md)] shrink-0" style={{ backgroundColor: meta.bg, border: `1px solid ${meta.border}` }}>
          <Icon className="w-4 h-4" style={{ color: meta.color }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ color: meta.color, backgroundColor: meta.bg }}>
              {meta.label}
            </span>
            {dissolved && (
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#3a1f1f] text-[#e08a8a]">
                Dissolved
              </span>
            )}
            {record.ampedAt && (
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#173226] text-[#5fd6c4]">
                Amped
              </span>
            )}
          </div>
          <h3 className="text-base font-semibold text-content-primary truncate mt-1.5">{record.title}</h3>
          <div className="flex items-center gap-1.5 text-[11px] text-content-muted mt-1">
            <CircleDot className="w-3 h-3" />
            {record.logCount ?? logs.length} log{(record.logCount ?? logs.length) === 1 ? '' : 's'}
            {record.createdAt ? <span className="text-content-muted">· created {fmtDate(record.createdAt)}</span> : null}
          </div>
        </div>
      </div>

      {/* Logs timeline */}
      {logs.length > 0 && (
        <ol className="mt-4 space-y-3 border-t border-[var(--border-color)] pt-4">
          {logs.map(log => (
            <li key={log.id} className="flex gap-3">
              <div className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: meta.color }} />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-content-muted">
                  <Clock className="w-3 h-3" />
                  {fmtDate(log.stampedAt)}
                </div>
                {log.note ? (
                  <div className="text-sm text-content-secondary mt-0.5 break-words">{log.note}</div>
                ) : (
                  <div className="text-sm text-content-muted/70 italic mt-0.5">(no note)</div>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
