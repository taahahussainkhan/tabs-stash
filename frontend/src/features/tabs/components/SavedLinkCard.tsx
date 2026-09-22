import React from 'react';
import { ExternalLink, Trash2, CheckCircle2, CircleDot, Copy } from 'lucide-react';
import type { SavedLink } from '../../../services/tabService';

interface SavedLinkCardProps {
  link: SavedLink;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onToggleRead: (id: string, isRead: boolean) => void;
  onDelete: (id: string) => void;
  onCopyUrl: (url: string) => void;
}

export const SavedLinkCard: React.FC<SavedLinkCardProps> = ({
  link,
  isSelected,
  onToggleSelect,
  onToggleRead,
  onDelete,
  onCopyUrl,
}) => {
  return (
    <div
      className={`bg-[#17181d] border rounded-xl p-4 flex items-center justify-between gap-3 transition-all ${
        isSelected
          ? 'border-indigo-500 bg-[#1e1f2b]'
          : link.isRead
          ? 'border-[#2e323c]/60 opacity-75'
          : 'border-[#2e323c] hover:border-[#3e4350]'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(link.id)}
          className="rounded border-[#2e323c] bg-[#1e2026] text-indigo-600 focus:ring-0 w-4 h-4 cursor-pointer"
        />

        <img
          src={`https://www.google.com/s2/favicons?domain=${link.hostname}&sz=32`}
          alt=""
          className="w-5 h-5 rounded shrink-0 object-contain"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        <div className="min-w-0 flex-1">
          <a
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-content-primary hover:text-indigo-400 truncate block transition-colors"
            title={link.url}
          >
            {link.title || link.hostname || 'Saved Link'}
          </a>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-content-muted">
            <span className="px-1.5 py-0.5 bg-[#1e2026] border border-[#2e323c] rounded font-mono">
              {link.hostname}
            </span>
            <span>•</span>
            <span>{new Date(link.savedAt).toLocaleDateString()}</span>
            <span>•</span>
            {link.isRead ? (
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Read
              </span>
            ) : (
              <span className="text-amber-400 font-medium flex items-center gap-1">
                <CircleDot className="w-3 h-3" /> Unread
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => onToggleRead(link.id, !link.isRead)}
          className={`p-1.5 rounded transition-colors ${
            link.isRead
              ? 'text-emerald-400 hover:bg-emerald-400/10'
              : 'text-content-muted hover:text-content-primary hover:bg-[#1e2026]'
          }`}
          title={link.isRead ? 'Mark as unread' : 'Mark as read'}
        >
          {link.isRead ? <CheckCircle2 className="w-4 h-4" /> : <CircleDot className="w-4 h-4" />}
        </button>

        <button
          onClick={() => onCopyUrl(link.url)}
          className="p-1.5 text-content-muted hover:text-content-primary hover:bg-[#1e2026] rounded transition-colors"
          title="Copy URL"
        >
          <Copy className="w-4 h-4" />
        </button>

        <a
          href={link.url}
          target="_blank"
          rel="noreferrer"
          className="p-1.5 text-content-muted hover:text-content-primary hover:bg-[#1e2026] rounded transition-colors"
          title="Open in new tab"
        >
          <ExternalLink className="w-4 h-4" />
        </a>

        <button
          onClick={() => onDelete(link.id)}
          className="p-1.5 text-content-muted hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
          title="Remove link"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
