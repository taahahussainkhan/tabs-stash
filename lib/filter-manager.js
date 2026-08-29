/**
 * TabVault Filter & Grouping Manager (Modular)
 * Handles multi-criteria filtering, archive views, and flat "All Tabs" grouping by site, date, or device.
 */

(function (global) {
  class TabVaultFilterManager {
    constructor() {
      this.filters = {
        viewMode: 'active', // 'active' | 'pinned' | 'all-tabs' | 'archive'
        tabGrouping: 'site', // 'site' | 'date' | 'device' | 'none'
        query: '',
        domain: null,
        deviceId: null,
        browser: null,
        dateRange: 'all', // 'all' | 'today' | 'week' | 'month'
        onlyPinned: false,
      };
      this.listeners = [];
    }

    onFilterChange(callback) {
      this.listeners.push(callback);
    }

    setViewMode(viewMode) {
      this.filters.viewMode = viewMode;
      this.notify();
    }

    setTabGrouping(tabGrouping) {
      this.filters.tabGrouping = tabGrouping;
      this.notify();
    }

    setFilter(key, value) {
      this.filters[key] = value;
      this.notify();
    }

    setDomain(domain) {
      this.filters.domain = this.filters.domain === domain ? null : domain; // toggle
      this.notify();
    }

    setDevice(deviceId) {
      this.filters.deviceId = this.filters.deviceId === deviceId ? null : deviceId;
      this.notify();
    }

    reset() {
      this.filters.query = '';
      this.filters.domain = null;
      this.filters.deviceId = null;
      this.filters.browser = null;
      this.filters.dateRange = 'all';
      this.filters.onlyPinned = false;
      this.notify();
    }

    hasActiveFilters() {
      return (
        !!this.filters.query ||
        !!this.filters.domain ||
        !!this.filters.deviceId ||
        !!this.filters.browser ||
        this.filters.dateRange !== 'all'
      );
    }

    notify() {
      this.listeners.forEach((cb) => cb(this.filters));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tabvault:filter-applied', { detail: this.filters }));
      }
    }

    /**
     * Extract unique domains and their tab counts across all active sessions
     */
    extractUniqueDomains(sessions = []) {
      const map = {};
      sessions.forEach((s) => {
        if (!s.isArchived) {
          (s.tabs || []).forEach((t) => {
            if (!t.isPopped && t.hostname && t.hostname !== 'local') {
              const d = t.hostname.toLowerCase();
              map[d] = (map[d] || 0) + 1;
            }
          });
        }
      });

      return Object.entries(map)
        .map(([domain, count]) => ({ domain, count }))
        .sort((a, b) => b.count - a.count);
    }

    /**
     * Extract unique devices across all active sessions
     */
    extractUniqueDevices(sessions = []) {
      const map = {};
      sessions.forEach((s) => {
        if (!s.isArchived) {
          const info = s.deviceInfo || {};
          const devId = info.deviceId || 'local_pc';
          const name = info.deviceName || 'Local PC';
          const platform = info.platform || 'Unknown';
          const browser = info.browser || 'Browser';

          if (!map[devId]) {
            map[devId] = {
              id: devId,
              name,
              platform,
              browser,
              sessionCount: 0,
              tabCount: 0,
            };
          }

          const activeTabs = (s.tabs || []).filter((t) => !t.isPopped);
          if (activeTabs.length > 0) {
            map[devId].sessionCount += 1;
            map[devId].tabCount += activeTabs.length;
          }
        }
      });

      return Object.values(map);
    }

    /**
     * Extract flat array of all active tabs across unarchived sessions with metadata
     */
    extractAllTabs(sessions = []) {
      const { query, domain, deviceId, dateRange } = this.filters;
      const q = (query || '').trim().toLowerCase();
      const now = Date.now();

      const tabsList = [];
      sessions.forEach((session) => {
        if (session.isArchived) return; // Do not include archived sessions in all-tabs

        // Date filter
        if (dateRange !== 'all') {
          const diffMs = now - (session.timestamp || 0);
          if (dateRange === 'today' && diffMs > 86400000) return;
          if (dateRange === 'week' && diffMs > 7 * 86400000) return;
          if (dateRange === 'month' && diffMs > 30 * 86400000) return;
        }

        // Device filter
        if (deviceId && session.deviceInfo?.deviceId !== deviceId) {
          return;
        }

        (session.tabs || []).forEach((tab) => {
          if (tab.isPopped) return;

          // Domain filter
          if (domain && (tab.hostname || '').toLowerCase() !== domain.toLowerCase()) {
            return;
          }

          // Search query filter
          if (q) {
            const match =
              (tab.title || '').toLowerCase().includes(q) ||
              (tab.url || '').toLowerCase().includes(q) ||
              (tab.hostname || '').toLowerCase().includes(q) ||
              (session.title || '').toLowerCase().includes(q);
            if (!match) return;
          }

          tabsList.push({
            ...tab,
            sessionId: session.id,
            sessionTitle: session.title || 'Untitled Session',
            sessionTimestamp: session.timestamp,
            deviceInfo: session.deviceInfo || {},
          });
        });
      });

      return tabsList;
    }

    /**
     * Group a flat list of tabs by site, date, or device
     */
    groupTabs(tabs = [], groupBy = 'site') {
      if (groupBy === 'none') {
        return [
          {
            key: 'all',
            title: 'All Stashed Tabs',
            icon: '📑',
            badge: `${tabs.length} tabs`,
            tabs: tabs,
          },
        ];
      }

      const groupsMap = {};

      tabs.forEach((tab) => {
        let groupKey = '';
        let groupTitle = '';
        let groupIcon = '';

        if (groupBy === 'site') {
          groupKey = tab.hostname || 'other';
          groupTitle = tab.hostname || 'Other Websites';
          groupIcon = '🌐';
        } else if (groupBy === 'date') {
          const diff = Date.now() - (tab.stashedAt || tab.sessionTimestamp || Date.now());
          if (diff < 86400000) {
            groupKey = 'today';
            groupTitle = 'Today';
            groupIcon = '⚡';
          } else if (diff < 2 * 86400000) {
            groupKey = 'yesterday';
            groupTitle = 'Yesterday';
            groupIcon = '📅';
          } else if (diff < 7 * 86400000) {
            groupKey = 'this-week';
            groupTitle = 'Past 7 Days';
            groupIcon = '🗓️';
          } else {
            groupKey = 'older';
            groupTitle = 'Older';
            groupIcon = '🕰️';
          }
        } else if (groupBy === 'device') {
          const dev = tab.deviceInfo || {};
          groupKey = dev.deviceId || 'unknown';
          groupTitle = dev.deviceName || 'Local PC';
          groupIcon = TabVaultDeviceManager.getPlatformIcon(dev.platform);
        }

        if (!groupsMap[groupKey]) {
          groupsMap[groupKey] = {
            key: groupKey,
            title: groupTitle,
            icon: groupIcon,
            tabs: [],
          };
        }
        groupsMap[groupKey].tabs.push(tab);
      });

      return Object.values(groupsMap).sort((a, b) => b.tabs.length - a.tabs.length);
    }

    /**
     * Apply active filters to list of sessions for session card view
     */
    applyFilters(sessions = []) {
      const { viewMode, query, domain, deviceId, browser, dateRange, onlyPinned } = this.filters;
      const q = (query || '').trim().toLowerCase();
      const now = Date.now();

      return sessions
        .map((session) => {
          const isSessionRestored = session.isRestored || (session.tabs && session.tabs.length > 0 && session.tabs.every((t) => t.isPopped));

          // 1. View Mode segregation
          if (viewMode === 'archive') {
            if (!session.isArchived) return null;
          } else if (viewMode === 'restored') {
            if (session.isArchived || !isSessionRestored) return null;
          } else {
            // 'active' or 'pinned'
            if (session.isArchived || isSessionRestored) return null;
            if ((viewMode === 'pinned' || onlyPinned) && !session.isPinned) return null;
          }

          // 2. Device filter
          if (deviceId && session.deviceInfo?.deviceId !== deviceId) {
            return null;
          }

          // 3. Browser filter
          if (browser && session.deviceInfo?.browser?.toLowerCase() !== browser.toLowerCase()) {
            return null;
          }

          // 4. Date Range filter
          if (dateRange !== 'all') {
            const diffMs = now - (session.timestamp || 0);
            if (dateRange === 'today' && diffMs > 86400000) return null;
            if (dateRange === 'week' && diffMs > 7 * 86400000) return null;
            if (dateRange === 'month' && diffMs > 30 * 86400000) return null;
          }

          // 5. Tabs list (In restored view, show all tabs so user can see full history)
          let matchingTabs = viewMode === 'restored'
            ? (session.tabs || [])
            : (session.tabs || []).filter((t) => !t.isPopped);

          // 6. Domain filter
          if (domain) {
            matchingTabs = matchingTabs.filter(
              (t) => (t.hostname || '').toLowerCase() === domain.toLowerCase()
            );
          }

          // 7. Search query filter
          if (q) {
            const matchesSessionTitle = (session.title || '').toLowerCase().includes(q);
            const tabSearchMatches = matchingTabs.filter(
              (t) =>
                (t.title || '').toLowerCase().includes(q) ||
                (t.url || '').toLowerCase().includes(q) ||
                (t.hostname || '').toLowerCase().includes(q)
            );

            if (matchesSessionTitle) {
              // Show all matchingTabs
            } else if (tabSearchMatches.length > 0) {
              matchingTabs = tabSearchMatches;
            } else {
              return null;
            }
          }

          if (matchingTabs.length === 0) return null;

          return {
            ...session,
            tabs: matchingTabs,
          };
        })
        .filter(Boolean);
    }
  }

  global.TabVaultFilterManager = new TabVaultFilterManager();
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
