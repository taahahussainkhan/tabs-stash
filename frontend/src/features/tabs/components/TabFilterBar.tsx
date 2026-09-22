import React from 'react';
import { Layers, RotateCcw, Bookmark, Search, Plus } from 'lucide-react';
import type { TabViewMode } from '../hooks/useTabFilters';

interface TabFilterBarProps {
  activeTab: TabViewMode;
  onSelectTab: (tab: TabViewMode) => void;
  activeSessionsCount: number;
  restoredSessionsCount: number;
  savedLinksCount: number;
  search: string;
  onSearchChange: (search: string) => void;
  selectedDevice: string;
  onDeviceChange: (device: string) => void;
  devices: string[];
  selectedDomain: string;
  onDomainChange: (domain: string) => void;
  domains: Array<{ domain: string; count: number }>;
  selectedLinksCount: number;
  onConvertSelectedLinks: () => void;
  isConvertingLinks: boolean;
}

export const TabFilterBar: React.FC<TabFilterBarProps> = ({
  activeTab,
  onSelectTab,
  activeSessionsCount,
  restoredSessionsCount,
  savedLinksCount,
  search,
  onSearchChange,
  selectedDevice,
  onDeviceChange,
  devices,
  selectedDomain,
  onDomainChange,
  domains,
  selectedLinksCount,
  onConvertSelectedLinks,
  isConvertingLinks,
}) => {
  return (
    <div className="space-y-4">
      {/* View Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-[#2e323c] pb-2 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectTab('active')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'active'
                ? 'bg-[#e05a47] text-white shadow-sm'
                : 'text-content-secondary hover:text-content-primary hover:bg-[#1e2026]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Active Sessions</span>
            <span className="ml-1 text-xs opacity-80 font-mono">({activeSessionsCount})</span>
          </button>

          <button
            onClick={() => onSelectTab('restored')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'restored'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-content-secondary hover:text-content-primary hover:bg-[#1e2026]'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restored History</span>
            <span className="ml-1 text-xs opacity-80 font-mono">({restoredSessionsCount})</span>
          </button>

          <button
            onClick={() => onSelectTab('links')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'links'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-content-secondary hover:text-content-primary hover:bg-[#1e2026]'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved Links / Reading Shelf</span>
            <span className="ml-1 text-xs opacity-80 font-mono">({savedLinksCount})</span>
          </button>
        </div>

        {activeTab === 'links' && selectedLinksCount > 0 && (
          <button
            onClick={onConvertSelectedLinks}
            disabled={isConvertingLinks}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#e05a47] hover:bg-[#cc4a38] text-white rounded-md text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            Convert {selectedLinksCount} Selected to Session
          </button>
        )}
      </div>

      {/* Search & Select Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={
              activeTab === 'links'
                ? 'Search saved links, titles, or domains...'
                : 'Search stashes, titles, or URLs...'
            }
            className="w-full pl-9 pr-4 py-2 bg-[#17181d] border border-[#2e323c] rounded-lg text-sm text-content-primary placeholder-content-muted focus:outline-none focus:border-[#e05a47] transition-colors"
          />
        </div>

        {activeTab !== 'links' && (
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            {devices.length > 0 && (
              <select
                value={selectedDevice}
                onChange={(e) => onDeviceChange(e.target.value)}
                className="px-3 py-2 bg-[#17181d] border border-[#2e323c] rounded-lg text-xs font-medium text-content-secondary focus:outline-none focus:border-[#e05a47] transition-colors"
              >
                <option value="all">All Devices</option>
                {devices.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            )}

            {domains.length > 0 && (
              <select
                value={selectedDomain}
                onChange={(e) => onDomainChange(e.target.value)}
                className="px-3 py-2 bg-[#17181d] border border-[#2e323c] rounded-lg text-xs font-medium text-content-secondary focus:outline-none focus:border-[#e05a47] transition-colors"
              >
                <option value="all">All Sites / Domains</option>
                {domains.slice(0, 20).map((d) => (
                  <option key={d.domain} value={d.domain}>
                    {d.domain} ({d.count})
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
