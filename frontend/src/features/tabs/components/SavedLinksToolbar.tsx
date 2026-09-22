import React from 'react';
import type { LinkFilterMode } from '../hooks/useTabFilters';

interface SavedLinksToolbarProps {
  linksFilter: LinkFilterMode;
  onFilterChange: (filter: LinkFilterMode) => void;
  onSelectAll: () => void;
  isAllSelected: boolean;
  hasFilteredLinks: boolean;
}

export const SavedLinksToolbar: React.FC<SavedLinksToolbarProps> = ({
  linksFilter,
  onFilterChange,
  onSelectAll,
  isAllSelected,
  hasFilteredLinks,
}) => {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onFilterChange('all')}
        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          linksFilter === 'all'
            ? 'bg-indigo-600 text-white'
            : 'bg-[#17181d] border border-[#2e323c] text-content-secondary hover:text-content-primary'
        }`}
      >
        All
      </button>
      <button
        onClick={() => onFilterChange('unread')}
        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          linksFilter === 'unread'
            ? 'bg-indigo-600 text-white'
            : 'bg-[#17181d] border border-[#2e323c] text-content-secondary hover:text-content-primary'
        }`}
      >
        Unread
      </button>
      <button
        onClick={() => onFilterChange('read')}
        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          linksFilter === 'read'
            ? 'bg-indigo-600 text-white'
            : 'bg-[#17181d] border border-[#2e323c] text-content-secondary hover:text-content-primary'
        }`}
      >
        Read
      </button>
      {hasFilteredLinks && (
        <button
          onClick={onSelectAll}
          className="text-xs text-indigo-400 hover:underline ml-2"
        >
          {isAllSelected ? 'Deselect All' : 'Select All'}
        </button>
      )}
    </div>
  );
};
