import React from 'react';
import { Pin, Clock, Laptop, ExternalLink, Copy, Check, Trash2 } from 'lucide-react';
import type { StashedSession, TabItem } from '../../../services/tabService';
import { TabItemRow } from './TabItemRow';

interface SessionCardProps {
  session: StashedSession;
  isCopied: boolean;
  onOpenAll: (tabs: TabItem[]) => void;
  onCopyLinks: (session: StashedSession) => void;
  onDeleteSession: (sessionId: string) => void;
}

export const SessionCard: React.FC<SessionCardProps> = ({
  session,
  isCopied,
  onOpenAll,
  onCopyLinks,
  onDeleteSession,
}) => {
  const sessionId = session.id || session.sessionId || '';
  const isRestored =
    (session as any).isRestored ||
    (session.tabs && session.tabs.length > 0 && session.tabs.every((t) => t.isPopped));

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      onDeleteSession(sessionId);
    }
  };

  return (
    <div
      className={`bg-[#17181d] border rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-md ${
        isRestored
          ? 'border-[#2e323c]/80 opacity-90'
          : 'border-[#2e323c] hover:border-[#3e4350]'
      }`}
    >
      {/* Card Header */}
      <div className="p-5 border-b border-[#2e323c]/60 bg-[#1e2026]/40">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {session.isPinned && (
                <Pin className="w-3.5 h-3.5 text-[#e05a47] fill-[#e05a47] shrink-0" />
              )}
              <h3 className="text-sm font-semibold text-content-primary truncate">
                {session.title || 'Untitled Session'}
              </h3>
            </div>

            <div className="flex items-center gap-3 mt-2 text-[11px] text-content-muted">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(session.timestamp).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              {session.deviceInfo?.deviceName && (
                <span className="flex items-center gap-1">
                  <Laptop className="w-3 h-3" />
                  {session.deviceInfo.deviceName}
                </span>
              )}
            </div>
          </div>

          {isRestored ? (
            <span className="px-2 py-0.5 bg-amber-950/60 text-amber-400 border border-amber-800/40 rounded text-[11px] font-mono font-medium">
              Restored
            </span>
          ) : (
            <span className="px-2 py-0.5 bg-[#252830] text-content-secondary border border-[#2e323c] rounded text-[11px] font-mono font-medium">
              {session.tabs?.length || 0} tabs
            </span>
          )}
        </div>
      </div>

      {/* Tabs List */}
      <div className="p-4 space-y-2 max-h-64 overflow-y-auto divide-y divide-[#2e323c]/40">
        {session.tabs?.map((tab, idx) => (
          <TabItemRow
            key={tab.id || `${sessionId}-tab-${idx}`}
            tab={tab}
            sessionId={sessionId}
            index={idx}
          />
        ))}
      </div>

      {/* Card Footer Actions */}
      <div className="p-4 border-t border-[#2e323c]/60 bg-[#17181d] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onOpenAll(session.tabs)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#e05a47]/10 hover:bg-[#e05a47]/20 border border-[#e05a47]/30 text-[#e05a47] rounded text-xs font-semibold transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open All
          </button>

          <button
            onClick={() => onCopyLinks(session)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1e2026] hover:bg-[#252830] border border-[#2e323c] text-content-secondary hover:text-content-primary rounded text-xs font-medium transition-all"
            title="Copy all links"
          >
            {isCopied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        <button
          onClick={handleDelete}
          className="p-1.5 text-content-muted hover:text-red-400 rounded transition-colors"
          title="Delete Session"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
