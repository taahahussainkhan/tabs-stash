import React from 'react';
import { Globe, ExternalLink } from 'lucide-react';
import type { TabItem } from '../../../services/tabService';

interface TabItemRowProps {
  tab: TabItem;
  sessionId: string;
  index: number;
}

export const TabItemRow: React.FC<TabItemRowProps> = ({ tab, sessionId, index }) => {
  return (
    <div
      key={tab.id || `${sessionId}-tab-${index}`}
      className="pt-2 first:pt-0 flex items-center justify-between gap-3 group"
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {tab.favIconUrl ? (
          <img
            src={tab.favIconUrl}
            alt=""
            className="w-4 h-4 rounded shrink-0 object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <Globe className="w-4 h-4 text-content-muted shrink-0" />
        )}
        <a
          href={tab.url}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-content-secondary hover:text-[#e05a47] truncate transition-colors"
          title={tab.title}
        >
          {tab.title || tab.url}
        </a>
      </div>

      <a
        href={tab.url}
        target="_blank"
        rel="noreferrer"
        className="opacity-0 group-hover:opacity-100 p-1 text-content-muted hover:text-content-primary transition-opacity"
        title="Open link"
      >
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
};
