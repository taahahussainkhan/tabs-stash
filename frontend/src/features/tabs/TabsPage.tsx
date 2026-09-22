import React from 'react';
import { Layers, RefreshCw, Sparkles, Bookmark } from 'lucide-react';
import { useTabSessions } from './hooks/useTabSessions';
import { useSavedLinks } from './hooks/useSavedLinks';
import { useTabFilters } from './hooks/useTabFilters';
import { useClipboardCopy } from './hooks/useClipboardCopy';
import { TabStatsBanner } from './components/TabStatsBanner';
import { TabFilterBar } from './components/TabFilterBar';
import { SessionCard } from './components/SessionCard';
import { SavedLinkCard } from './components/SavedLinkCard';
import { SavedLinksToolbar } from './components/SavedLinksToolbar';

export function TabsPage() {
  const {
    activeSessionsList,
    restoredSessionsList,
    domains,
    devices,
    totalActiveTabsCount,
    isLoading: isLoadingSessions,
    isRefetching: isRefetchingSessions,
    refetch: refetchSessions,
    deleteSession,
    handleOpenAll,
  } = useTabSessions();

  const {
    savedLinks,
    isLoading: isLoadingLinks,
    isRefetching: isRefetchingLinks,
    refetch: refetchLinks,
    selectedLinkIds,
    toggleLinkRead,
    deleteLink,
    convertLinks,
    isConverting: isConvertingLinks,
    unreadLinksCount,
    handleToggleSelectLink,
    handleSelectAllFilteredLinks,
  } = useSavedLinks();

  const {
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
  } = useTabFilters({
    activeSessionsList,
    restoredSessionsList,
    savedLinks,
  });

  const { copiedId, handleCopyLinks, handleCopySingleUrl } = useClipboardCopy();

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
            <div className="p-2.5 bg-[#e05a47]/10 rounded-xl text-[#e05a47] border border-[#e05a47]/20">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-content-primary tracking-tight">
                Lore Workspaces
              </h1>
              <p className="text-xs text-content-muted mt-0.5">
                Manage stashed browser sessions, multi-PC tabs, and reading lists synchronized in real time.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#1e2026] hover:bg-[#252830] border border-[#2e323c] rounded-md text-xs font-semibold text-content-secondary hover:text-content-primary transition-all duration-150 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Banner */}
      <TabStatsBanner
        activeSessionsCount={activeSessionsList.length}
        totalActiveTabsCount={totalActiveTabsCount}
        restoredSessionsCount={restoredSessionsList.length}
        totalSavedLinksCount={savedLinks.length}
        unreadLinksCount={unreadLinksCount}
      />

      {/* View Switcher, Search, and Filters */}
      <TabFilterBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        activeSessionsCount={activeSessionsList.length}
        restoredSessionsCount={restoredSessionsList.length}
        savedLinksCount={savedLinks.length}
        search={search}
        onSearchChange={setSearch}
        selectedDevice={selectedDevice}
        onDeviceChange={setSelectedDevice}
        devices={devices}
        selectedDomain={selectedDomain}
        onDomainChange={setSelectedDomain}
        domains={domains}
        selectedLinksCount={selectedLinkIds.size}
        onConvertSelectedLinks={() => convertLinks(Array.from(selectedLinkIds))}
        isConvertingLinks={isConvertingLinks}
      />

      {/* 1. SESSIONS VIEW (Active or Restored) */}
      {activeTab !== 'links' && (
        <>
          {isLoadingSessions ? (
            <div className="py-20 text-center text-content-muted">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#e05a47] mb-3" />
              Loading your stashed workspaces...
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
                  : 'Use your Lore browser extension (Alt+Shift+S) to stash open tabs. They will instantly appear here!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSessions.map((session) => (
                <SessionCard
                  key={session.id || session.sessionId}
                  session={session}
                  isCopied={copiedId === (session.id || session.sessionId)}
                  onOpenAll={handleOpenAll}
                  onCopyLinks={handleCopyLinks}
                  onDeleteSession={deleteSession}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* 2. SAVED LINKS VIEW */}
      {activeTab === 'links' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <SavedLinksToolbar
              linksFilter={linksFilter}
              onFilterChange={setLinksFilter}
              onSelectAll={() => handleSelectAllFilteredLinks(filteredLinks)}
              isAllSelected={
                selectedLinkIds.size === filteredLinks.length && filteredLinks.length > 0
              }
              hasFilteredLinks={filteredLinks.length > 0}
            />
          </div>

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
                <strong className="text-indigo-400">"Save Link to Lore Reading List"</strong> to
                store it here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLinks.map((link) => (
                <SavedLinkCard
                  key={link.id}
                  link={link}
                  isSelected={selectedLinkIds.has(link.id)}
                  onToggleSelect={handleToggleSelectLink}
                  onToggleRead={toggleLinkRead}
                  onDelete={deleteLink}
                  onCopyUrl={handleCopySingleUrl}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
