import { useState, useMemo } from 'react';
import type { StashedSession, SavedLink } from '../../../services/tabService';

export type TabViewMode = 'active' | 'restored' | 'links';
export type LinkFilterMode = 'all' | 'unread' | 'read';

interface UseTabFiltersProps {
  activeSessionsList: StashedSession[];
  restoredSessionsList: StashedSession[];
  savedLinks: SavedLink[];
}

export function useTabFilters({
  activeSessionsList,
  restoredSessionsList,
  savedLinks,
}: UseTabFiltersProps) {
  const [activeTab, setActiveTab] = useState<TabViewMode>('active');
  const [search, setSearch] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<string>('all');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [linksFilter, setLinksFilter] = useState<LinkFilterMode>('all');

  const filteredSessions = useMemo(() => {
    const sourceList = activeTab === 'restored' ? restoredSessionsList : activeSessionsList;
    const query = search.trim().toLowerCase();

    return sourceList.filter((session) => {
      const title = session.title || '';
      const tabs = session.tabs || [];

      const matchesSearch =
        !query ||
        title.toLowerCase().includes(query) ||
        tabs.some(
          (t) =>
            (t.title || '').toLowerCase().includes(query) ||
            (t.url || '').toLowerCase().includes(query)
        );

      const matchesDevice =
        selectedDevice === 'all' || session.deviceInfo?.deviceName === selectedDevice;

      const matchesDomain =
        selectedDomain === 'all' || tabs.some((t) => t.hostname === selectedDomain);

      return matchesSearch && matchesDevice && matchesDomain;
    });
  }, [activeTab, activeSessionsList, restoredSessionsList, search, selectedDevice, selectedDomain]);

  const filteredLinks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return (savedLinks || []).filter((link) => {
      const title = link.title || '';
      const url = link.url || '';
      const hostname = link.hostname || '';

      const matchesSearch =
        !query ||
        title.toLowerCase().includes(query) ||
        url.toLowerCase().includes(query) ||
        hostname.toLowerCase().includes(query);

      const matchesStatus =
        linksFilter === 'all' ||
        (linksFilter === 'unread' && !link.isRead) ||
        (linksFilter === 'read' && link.isRead);

      return matchesSearch && matchesStatus;
    });
  }, [savedLinks, search, linksFilter]);

  const resetFilters = () => {
    setSearch('');
    setSelectedDevice('all');
    setSelectedDomain('all');
    setLinksFilter('all');
  };

  return {
    activeTab,
    setActiveTab,
    search,
    setSearch,
    selectedDevice,
    setSelectedDevice,
    selectedDomain,
    setSelectedDomain,
    linksFilter,
    setLinksFilter,
    filteredSessions,
    filteredLinks,
    resetFilters,
  };
}
