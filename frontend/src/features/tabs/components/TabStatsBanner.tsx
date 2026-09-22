import React from 'react';
import { Layers, Globe, RotateCcw, Bookmark } from 'lucide-react';

interface TabStatsBannerProps {
  activeSessionsCount: number;
  totalActiveTabsCount: number;
  restoredSessionsCount: number;
  totalSavedLinksCount: number;
  unreadLinksCount: number;
}

export const TabStatsBanner: React.FC<TabStatsBannerProps> = ({
  activeSessionsCount,
  totalActiveTabsCount,
  restoredSessionsCount,
  totalSavedLinksCount,
  unreadLinksCount,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div className="bg-[#17181d] border border-[#2e323c] p-4 rounded-xl flex items-center justify-between shadow-sm">
        <div>
          <div className="text-xs font-medium text-content-muted uppercase tracking-wider">
            Active Sessions
          </div>
          <div className="text-2xl font-bold text-content-primary mt-1">
            {activeSessionsCount}
          </div>
        </div>
        <div className="p-3 bg-[#1e2026] rounded-lg text-[#e05a47]">
          <Layers className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-[#17181d] border border-[#2e323c] p-4 rounded-xl flex items-center justify-between shadow-sm">
        <div>
          <div className="text-xs font-medium text-content-muted uppercase tracking-wider">
            Active Stashed Tabs
          </div>
          <div className="text-2xl font-bold text-content-primary mt-1">
            {totalActiveTabsCount}
          </div>
        </div>
        <div className="p-3 bg-[#1e2026] rounded-lg text-emerald-400">
          <Globe className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-[#17181d] border border-[#2e323c] p-4 rounded-xl flex items-center justify-between shadow-sm">
        <div>
          <div className="text-xs font-medium text-content-muted uppercase tracking-wider">
            Restored Sessions
          </div>
          <div className="text-2xl font-bold text-content-primary mt-1">
            {restoredSessionsCount}
          </div>
        </div>
        <div className="p-3 bg-[#1e2026] rounded-lg text-amber-400">
          <RotateCcw className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-[#17181d] border border-[#2e323c] p-4 rounded-xl flex items-center justify-between shadow-sm">
        <div>
          <div className="text-xs font-medium text-content-muted uppercase tracking-wider">
            Saved Links
          </div>
          <div className="text-2xl font-bold text-content-primary mt-1">
            {totalSavedLinksCount}
            {unreadLinksCount > 0 && (
              <span className="ml-2 text-xs font-semibold text-[#e05a47] bg-[#e05a47]/10 px-2 py-0.5 rounded-full">
                {unreadLinksCount} unread
              </span>
            )}
          </div>
        </div>
        <div className="p-3 bg-[#1e2026] rounded-lg text-cyan-400">
          <Bookmark className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
