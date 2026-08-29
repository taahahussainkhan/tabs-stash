import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Layers,
  Search,
  ExternalLink,
  Trash2,
  Pin,
  Clock,
  Laptop,
  Copy,
  Check,
  RefreshCw,
  Globe,
  Sparkles,
  Bookmark,
  CheckCircle2,
  CircleDot,
  Plus,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  tabService,
  type StashedSession,
  type TabItem,
  type SavedLink,
} from '../../services/tabService';

export function TabsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'active' | 'restored' | 'links'>('active');
  const [search, setSearch] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<string>('all');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [linksFilter, setLinksFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedLinkIds, setSelectedLinkIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 1. Fetch Sessions
  const {
    data: sessions = [],
    isLoading: isLoadingSessions,
    isRefetching: isRefetchingSessions,
    refetch: refetchSessions,
  } = useQuery({
    queryKey: ['tab-sessions'],
    queryFn: () => tabService.getSessions(100),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  // 2. Fetch Saved Links
  const {
    data: savedLinks = [],
    isLoading: isLoadingLinks,
    isRefetching: isRefetchingLinks,
    refetch: refetchLinks,
  } = useQuery({
    queryKey: ['tab-saved-links'],
    queryFn: () => tabService.getSavedLinks(),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  // Mutations for Sessions
  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId: string) => tabService.deleteSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tab-sessions'] });
      toast.success('Session deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete session');
    },
  });

  // Mutations for Saved Links
  const toggleLinkReadMutation = useMutation({
    mutationFn: ({ linkId, isRead }: { linkId: string; isRead: boolean }) =>
      tabService.toggleLinkRead(linkId, isRead),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tab-saved-links'] });
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: (linkId: string) => tabService.deleteLink(linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tab-saved-links'] });
      toast.success('Link removed from reading list');
    },
  });

  const convertLinksMutation = useMutation({
    mutationFn: (ids: string[]) => tabService.convertLinksToSession(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tab-saved-links'] });
      queryClient.invalidateQueries({ queryKey: ['tab-sessions'] });
      setSelectedLinkIds(new Set());
      toast.success('Converted links into a new Stashed Session');
    },
  });

  // Segregate Active vs Restored sessions
  const activeSessionsList = useMemo(() => {
    return (sessions || []).filter(
      (s) =>
        !s.isArchived &&
        !(s as any).isRestored &&
        !(s.tabs && s.tabs.length > 0 && s.tabs.every((t) => t.isPopped))
    );
  }, [sessions]);

  const restoredSessionsList = useMemo(() => {
    return (sessions || []).filter(
      (s) =>
        !s.isArchived &&
        ((s as any).isRestored || (s.tabs && s.tabs.length > 0 && s.tabs.every((t) => t.isPopped)))
    );
  }, [sessions]);

  // Extracted unique domains across sessions
  const domains = useMemo(() => {
    const map = new Map<string, number>();
    (sessions || []).forEach((s) => {
      (s.tabs || []).forEach((t) => {
        if (t.hostname && t.hostname !== 'local') {
          map.set(t.hostname, (map.get(t.hostname) || 0) + 1);
        }
      });
    });
    return Array.from(map.entries())
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count);
  }, [sessions]);

  // Unique devices
  const devices = useMemo(() => {
    const set = new Set<string>();
    (sessions || []).forEach((s) => {
      if (s.deviceInfo?.deviceName) set.add(s.deviceInfo.deviceName);
    });
    return Array.from(set);
  }, [sessions]);

  // Filtered sessions based on active view mode
  const filteredSessions = useMemo(() => {
    const sourceList = activeTab === 'restored' ? restoredSessionsList : activeSessionsList;
    return sourceList.filter((session) => {
      const title = session.title || '';
      const tabs = session.tabs || [];
      const matchesSearch =
        !search ||
        title.toLowerCase().includes(search.toLowerCase()) ||
        tabs.some(
          (t) =>
            (t.title || '').toLowerCase().includes(search.toLowerCase()) ||
            (t.url || '').toLowerCase().includes(search.toLowerCase())
        );

      const matchesDevice =
        selectedDevice === 'all' || session.deviceInfo?.deviceName === selectedDevice;

      const matchesDomain =
        selectedDomain === 'all' || tabs.some((t) => t.hostname === selectedDomain);

      return matchesSearch && matchesDevice && matchesDomain;
    });
  }, [activeTab, activeSessionsList, restoredSessionsList, search, selectedDevice, selectedDomain]);

  // Filtered Saved Links
  const filteredLinks = useMemo(() => {
    return (savedLinks || []).filter((link) => {
      const title = link.title || '';
      const url = link.url || '';
      const matchesSearch =
        !search ||
        title.toLowerCase().includes(search.toLowerCase()) ||
        url.toLowerCase().includes(search.toLowerCase()) ||
        (link.hostname || '').toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        linksFilter === 'all' ||
        (linksFilter === 'unread' && !link.isRead) ||
        (linksFilter === 'read' && link.isRead);

      return matchesSearch && matchesStatus;
    });
  }, [savedLinks, search, linksFilter]);

  const totalActiveTabsCount = useMemo(() => {
    return activeSessionsList.reduce((acc, s) => acc + (s.tabs?.length || 0), 0);
  }, [activeSessionsList]);

  const unreadLinksCount = useMemo(() => {
    return (savedLinks || []).filter((l) => !l.isRead).length;
  }, [savedLinks]);

  const handleOpenAll = (tabs: TabItem[] = []) => {
    tabs.forEach((tab) => {
      if (tab.url) {
        window.open(tab.url, '_blank', 'noopener,noreferrer');
      }
    });
    toast.success(`Opened ${tabs.length} tabs`);
  };

  const handleCopyLinks = (session: StashedSession) => {
    const sessionId = session.id || session.sessionId || '';
    const text = (session.tabs || []).map((t) => `${t.title || ''}\n${t.url || ''}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopiedId(sessionId);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('All tab URLs copied to clipboard');
  };

  const handleToggleSelectLink = (id: string) => {
    const updated = new Set(selectedLinkIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedLinkIds(updated);
  };

  const handleSelectAllFilteredLinks = () => {
    if (selectedLinkIds.size === filteredLinks.length) {
      setSelectedLinkIds(new Set());
    } else {
      setSelectedLinkIds(new Set(filteredLinks.map((l) => l.id)));
    }
  };

  const isRefreshing = isRefetchingSessions || isRefetchingLinks;

  const handleRefresh = () => {
    refetchSessions();
    refetchLinks();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2e323c] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#e05a47]/10 border border-[#e05a47]/20 rounded-lg text-[#e05a47]">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-content-primary tracking-tight">
                TabVault & Research Sessions
              </h1>
              <p className="text-sm text-content-secondary mt-0.5">
                Stashed tabs and reading list synchronized across your devices.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#1e2026] hover:bg-[#252830] border border-[#2e323c] rounded-md text-xs font-semibold text-content-secondary hover:text-content-primary transition-all duration-150"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#17181d] border border-[#2e323c] p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-content-muted uppercase tracking-wider">
              Active Sessions
            </div>
            <div className="text-2xl font-bold text-content-primary mt-1">
              {activeSessionsList.length}
            </div>
          </div>
          <div className="p-3 bg-[#1e2026] rounded-lg text-[#e05a47]">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#17181d] border border-[#2e323c] p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-content-muted uppercase tracking-wider">
              Active Stashed Tabs
            </div>
            <div className="text-2xl font-bold text-content-primary mt-1">{totalActiveTabsCount}</div>
          </div>
          <div className="p-3 bg-[#1e2026] rounded-lg text-emerald-400">
            <Globe className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#17181d] border border-[#2e323c] p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-content-muted uppercase tracking-wider">
              Restored Sessions
            </div>
            <div className="text-2xl font-bold text-content-primary mt-1">
              {restoredSessionsList.length}
            </div>
          </div>
          <div className="p-3 bg-[#1e2026] rounded-lg text-amber-400">
            <RotateCcw className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#17181d] border border-[#2e323c] p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-content-muted uppercase tracking-wider">
              Saved Links
            </div>
            <div className="text-2xl font-bold text-content-primary mt-1">
              {(savedLinks || []).length}
              {unreadLinksCount > 0 && (
                <span className="ml-2 text-xs font-semibold text-[#e05a47] bg-[#e05a47]/10 px-2 py-0.5 rounded-full">
                  {unreadLinksCount} unread
                </span>
              )}
            </div>
          </div>
          <div className="p-3 bg-[#1e2026] rounded-lg text-indigo-400">
            <Bookmark className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main View Switcher Tabs: Active | Restored | Saved Links */}
      <div className="flex items-center justify-between border-b border-[#2e323c] pb-2 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'active'
                ? 'bg-[#e05a47] text-white shadow-sm'
                : 'text-content-secondary hover:text-content-primary hover:bg-[#1e2026]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Active Sessions</span>
            <span className="ml-1 text-xs opacity-80 font-mono">({activeSessionsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('restored')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'restored'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-content-secondary hover:text-content-primary hover:bg-[#1e2026]'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restored History</span>
            <span className="ml-1 text-xs opacity-80 font-mono">({restoredSessionsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('links')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'links'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-content-secondary hover:text-content-primary hover:bg-[#1e2026]'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved Links / Reading Shelf</span>
            <span className="ml-1 text-xs opacity-80 font-mono">({(savedLinks || []).length})</span>
          </button>
        </div>

        {activeTab === 'links' && selectedLinkIds.size > 0 && (
          <button
            onClick={() => convertLinksMutation.mutate(Array.from(selectedLinkIds))}
            disabled={convertLinksMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#e05a47] hover:bg-[#cc4a38] text-white rounded-md text-xs font-semibold transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Convert {selectedLinkIds.size} Selected to Session
          </button>
        )}
      </div>

      {/* Search & Filters Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              activeTab === 'links'
                ? 'Search saved links, titles, or domains...'
                : 'Search stashes, titles, or URLs...'
            }
            className="w-full pl-9 pr-4 py-2 bg-[#17181d] border border-[#2e323c] rounded-lg text-sm text-content-primary placeholder-content-muted focus:outline-none focus:border-[#e05a47] transition-colors"
          />
        </div>

        {activeTab !== 'links' ? (
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            {devices.length > 0 && (
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
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
                onChange={(e) => setSelectedDomain(e.target.value)}
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
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLinksFilter('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                linksFilter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-[#17181d] border border-[#2e323c] text-content-secondary hover:text-content-primary'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setLinksFilter('unread')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                linksFilter === 'unread'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-[#17181d] border border-[#2e323c] text-content-secondary hover:text-content-primary'
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setLinksFilter('read')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                linksFilter === 'read'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-[#17181d] border border-[#2e323c] text-content-secondary hover:text-content-primary'
              }`}
            >
              Read
            </button>
            <button
              onClick={handleSelectAllFilteredLinks}
              className="text-xs text-indigo-400 hover:underline ml-2"
            >
              {selectedLinkIds.size === filteredLinks.length && filteredLinks.length > 0
                ? 'Deselect All'
                : 'Select All'}
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. ACTIVE OR RESTORED SESSIONS VIEW */}
      {/* ========================================================================= */}
      {activeTab !== 'links' && (
        <>
          {isLoadingSessions ? (
            <div className="py-20 text-center text-content-muted">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#e05a47] mb-3" />
              Loading your stashed sessions...
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="py-16 text-center bg-[#17181d] border border-[#2e323c] rounded-2xl p-8 space-y-4">
              <div className="p-4 bg-[#1e2026] w-fit mx-auto rounded-full text-content-muted">
                <Sparkles className="w-8 h-8 text-[#e05a47]" />
              </div>
              <h3 className="text-lg font-bold text-content-primary">
                {activeTab === 'restored'
                  ? 'No restored sessions found'
                  : 'No active stashed sessions found'}
              </h3>
              <p className="text-sm text-content-secondary max-w-md mx-auto">
                {activeTab === 'restored'
                  ? 'When you restore a session in Chrome/Firefox, it is safely moved here so your active view stays clean and non-duplicated.'
                  : 'Use your TabVault browser extension (Alt+S) to stash open tabs. They will instantly appear here!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSessions.map((session) => {
                const sessionId = session.id || session.sessionId || '';
                const isRestored =
                  (session as any).isRestored ||
                  (session.tabs && session.tabs.length > 0 && session.tabs.every((t) => t.isPopped));

                return (
                  <div
                    key={sessionId}
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
                        <div
                          key={tab.id || `${sessionId}-tab-${idx}`}
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
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ))}
                    </div>

                    {/* Card Footer Actions */}
                    <div className="p-4 border-t border-[#2e323c]/60 bg-[#17181d] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenAll(session.tabs)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#e05a47]/10 hover:bg-[#e05a47]/20 border border-[#e05a47]/30 text-[#e05a47] rounded text-xs font-semibold transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Open All
                        </button>

                        <button
                          onClick={() => handleCopyLinks(session)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1e2026] hover:bg-[#252830] border border-[#2e323c] text-content-secondary hover:text-content-primary rounded text-xs font-medium transition-all"
                          title="Copy all links"
                        >
                          {copiedId === sessionId ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          if (
                            window.confirm('Are you sure you want to delete this session?')
                          ) {
                            deleteSessionMutation.mutate(sessionId);
                          }
                        }}
                        className="p-1.5 text-content-muted hover:text-red-400 rounded transition-colors"
                        title="Delete Session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* 2. SAVED LINKS VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'links' && (
        <>
          {isLoadingLinks ? (
            <div className="py-20 text-center text-content-muted">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-3" />
              Loading your saved reading links...
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="py-16 text-center bg-[#17181d] border border-[#2e323c] rounded-2xl p-8 space-y-4">
              <div className="p-4 bg-[#1e2026] w-fit mx-auto rounded-full text-content-muted">
                <Bookmark className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-content-primary">No saved links found</h3>
              <p className="text-sm text-content-secondary max-w-md mx-auto">
                Right-click any hyperlink on any web page in Chrome/Firefox and select{' '}
                <strong className="text-indigo-400">"Save Link to TabVault Reading List"</strong> to
                store it here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLinks.map((link: SavedLink) => {
                const isSelected = selectedLinkIds.has(link.id);
                return (
                  <div
                    key={link.id}
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
                        onChange={() => handleToggleSelectLink(link.id)}
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
                        onClick={() =>
                          toggleLinkReadMutation.mutate({
                            linkId: link.id,
                            isRead: !link.isRead,
                          })
                        }
                        className={`p-1.5 rounded transition-colors ${
                          link.isRead
                            ? 'text-emerald-400 hover:bg-emerald-400/10'
                            : 'text-content-muted hover:text-content-primary hover:bg-[#1e2026]'
                        }`}
                        title={link.isRead ? 'Mark as unread' : 'Mark as read'}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(link.url);
                          toast.success('Link URL copied');
                        }}
                        className="p-1.5 text-content-muted hover:text-content-primary hover:bg-[#1e2026] rounded transition-colors"
                        title="Copy URL"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-content-muted hover:text-indigo-400 hover:bg-[#1e2026] rounded transition-colors"
                        title="Open in new tab"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      <button
                        onClick={() => {
                          if (window.confirm('Delete this saved link?')) {
                            deleteLinkMutation.mutate(link.id);
                          }
                        }}
                        className="p-1.5 text-content-muted hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                        title="Delete Link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
