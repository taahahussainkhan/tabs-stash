// TabVault Dashboard Script (Modular Architecture with Archive & Grouped All-Tabs Views)

document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('dash-sessions-grid');
  const emptyState = document.getElementById('dash-empty-state');
  const emptyHeading = emptyState.querySelector('h2');
  const emptySubtext = emptyState.querySelector('p');
  const searchInput = document.getElementById('dash-search-input');

  const ramVal = document.getElementById('dash-ram-saved');
  const totalTabsVal = document.getElementById('dash-total-tabs');
  const totalSessionsVal = document.getElementById('dash-total-sessions');

  const stashNowBtn = document.getElementById('stash-now-btn');
  const copyMarkdownBtn = document.getElementById('copy-markdown-btn');
  const clearAllBtn = document.getElementById('clear-all-btn');
  const importBtn = document.getElementById('import-btn');
  const exportBtn = document.getElementById('export-btn');
  const importFileInput = document.getElementById('import-file-input');

  // Filter Elements
  const dashOpenFilterBtn = document.getElementById('dash-open-filter-btn');
  const dashFilterActiveDot = document.getElementById('dash-filter-active-dot');
  const dashActiveFilterBar = document.getElementById('dash-active-filter-bar');
  const dashFilterTag = document.getElementById('dash-filter-tag');
  const dashClearFilterBtn = document.getElementById('dash-clear-filter-btn');
  const dashGroupingBar = document.getElementById('dash-grouping-bar');

  const dashFilterModal = document.getElementById('dash-filter-modal');
  const dashCloseFilterModalBtn = document.getElementById('dash-close-filter-modal-btn');
  const dashDomainChips = document.getElementById('dash-domain-chips');
  const dashDeviceChips = document.getElementById('dash-device-chips');
  const dashResetFiltersBtn = document.getElementById('dash-reset-filters-btn');
  const dashApplyFiltersBtn = document.getElementById('dash-apply-filters-btn');

  // Device Elements in Sidebar
  const dashDeviceIcon = document.getElementById('dash-device-icon');
  const dashDeviceNameDisplay = document.getElementById('dash-device-name-display');
  const dashDeviceBrowser = document.getElementById('dash-device-browser');
  const dashRenameInput = document.getElementById('dash-rename-input');
  const dashRenameBtn = document.getElementById('dash-rename-btn');

  // Cloud Sync elements
  const dashSyncDot = document.getElementById('dash-sync-dot');
  const dashLoggedOutBox = document.getElementById('dash-logged-out-box');
  const dashLoggedInBox = document.getElementById('dash-logged-in-box');
  const dashLoginBtn = document.getElementById('dash-login-btn');
  const dashUserAvatar = document.getElementById('dash-user-avatar');
  const dashUserName = document.getElementById('dash-user-name');
  const dashUserEmail = document.getElementById('dash-user-email');
  const dashSyncBadge = document.getElementById('dash-sync-badge');
  const dashLastSyncTime = document.getElementById('dash-last-sync-time');
  const dashSyncNowBtn = document.getElementById('dash-sync-now-btn');
  const dashLogoutBtn = document.getElementById('dash-logout-btn');

  // Dashboard Auth Modal
  const dashAuthModal = document.getElementById('dash-auth-modal');
  const dashCloseModalBtn = document.getElementById('dash-close-modal-btn');
  const dashTabLogin = document.getElementById('dash-tab-login');
  const dashTabRegister = document.getElementById('dash-tab-register');
  const dashNameFieldGroup = document.getElementById('dash-name-field-group');
  const dashAuthForm = document.getElementById('dash-auth-form');
  const dashNameInput = document.getElementById('dash-name-input');
  const dashEmailInput = document.getElementById('dash-email-input');
  const dashPasswordInput = document.getElementById('dash-password-input');
  const dashAuthErrorBox = document.getElementById('dash-auth-error-box');
  const dashAuthSubmitBtn = document.getElementById('dash-auth-submit-btn');

  let allSessions = [];
  let authMode = 'login';

  // Initialize Device Manager
  const currentDeviceInfo = await TabVaultDeviceManager.init();
  updateDeviceSidebar(currentDeviceInfo);

  // Initialize Data
  loadDashboardData();
  updateCloudUI();

  // Listen for sync, data, and device updates
  window.addEventListener('tabvault:data-updated', () => {
    loadDashboardData();
    updateCloudUI();
  });

  window.addEventListener('tabvault:sync-status', (e) => {
    updateSyncStatusBadge(e.detail.status, e.detail.error);
  });

  window.addEventListener('tabvault:auth-change', () => {
    updateCloudUI();
    loadDashboardData();
  });

  window.addEventListener('tabvault:device-updated', (e) => {
    updateDeviceSidebar(e.detail);
    loadDashboardData();
  });

  TabVaultFilterManager.onFilterChange(() => {
    renderFilteredGrid();
  });

  // Navigation switching (Active Sessions | Pinned | All Tabs | Archive)
  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const view = btn.dataset.view;
      TabVaultFilterManager.setViewMode(view);

      if (view === 'all-tabs') {
        dashGroupingBar.classList.remove('hidden');
      } else {
        dashGroupingBar.classList.add('hidden');
      }
    });
  });

  // Grouping selector chips
  document.querySelectorAll('.group-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.group-chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      TabVaultFilterManager.setTabGrouping(chip.dataset.group);
    });
  });

  // Stash button
  stashNowBtn.addEventListener('click', () => {
    TabVaultAPI.runtime.sendMessage({ action: "STASH_ALL_TABS" }).then(() => {
      setTimeout(loadDashboardData, 300);
    });
  });

  // Search
  searchInput.addEventListener('input', (e) => {
    TabVaultFilterManager.setFilter('query', e.target.value);
  });

  // Filter Modal Handlers
  dashOpenFilterBtn.addEventListener('click', () => {
    populateDashboardFilterModal();
    dashFilterModal.classList.remove('hidden');
  });

  dashCloseFilterModalBtn.addEventListener('click', () => {
    dashFilterModal.classList.add('hidden');
  });

  dashFilterModal.addEventListener('click', (e) => {
    if (e.target === dashFilterModal) {
      dashFilterModal.classList.add('hidden');
    }
  });

  dashResetFiltersBtn.addEventListener('click', () => {
    TabVaultFilterManager.reset();
    searchInput.value = '';
    populateDashboardFilterModal();
    dashFilterModal.classList.add('hidden');
  });

  dashApplyFiltersBtn.addEventListener('click', () => {
    dashFilterModal.classList.add('hidden');
  });

  dashClearFilterBtn.addEventListener('click', () => {
    TabVaultFilterManager.reset();
    searchInput.value = '';
  });

  document.querySelectorAll('.dash-date-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.dash-date-chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      TabVaultFilterManager.setFilter('dateRange', chip.dataset.date);
    });
  });

  // Device Renaming
  dashRenameBtn.addEventListener('click', async () => {
    const newName = dashRenameInput.value.trim();
    if (newName) {
      await TabVaultDeviceManager.setDeviceName(newName);
      dashRenameBtn.textContent = 'Saved!';
      setTimeout(() => {
        dashRenameBtn.textContent = 'Rename';
      }, 1500);
    }
  });

  function updateDeviceSidebar(info) {
    if (!info) return;
    dashDeviceIcon.textContent = TabVaultDeviceManager.getPlatformIcon(info.platform);
    dashDeviceNameDisplay.textContent = info.deviceName;
    dashDeviceBrowser.textContent = `${info.platform} • ${info.browser}`;
    dashRenameInput.value = info.deviceName;
  }

  // Populate Filter Modal
  function populateDashboardFilterModal() {
    const uniqueDomains = TabVaultFilterManager.extractUniqueDomains(allSessions);
    dashDomainChips.innerHTML = '';

    const allDom = document.createElement('button');
    allDom.className = `filter-chip ${!TabVaultFilterManager.filters.domain ? 'active' : ''}`;
    allDom.textContent = 'All Sites';
    allDom.addEventListener('click', () => {
      TabVaultFilterManager.setFilter('domain', null);
      populateDashboardFilterModal();
    });
    dashDomainChips.appendChild(allDom);

    uniqueDomains.slice(0, 15).forEach(({ domain, count }) => {
      const chip = document.createElement('button');
      chip.className = `filter-chip ${TabVaultFilterManager.filters.domain === domain ? 'active' : ''}`;
      chip.textContent = `${domain} (${count})`;
      chip.addEventListener('click', () => {
        TabVaultFilterManager.setDomain(domain);
        populateDashboardFilterModal();
      });
      dashDomainChips.appendChild(chip);
    });

    const uniqueDevices = TabVaultFilterManager.extractUniqueDevices(allSessions);
    dashDeviceChips.innerHTML = '';

    const allDev = document.createElement('button');
    allDev.className = `filter-chip ${!TabVaultFilterManager.filters.deviceId ? 'active' : ''}`;
    allDev.textContent = 'All PCs';
    allDev.addEventListener('click', () => {
      TabVaultFilterManager.setFilter('deviceId', null);
      populateDashboardFilterModal();
    });
    dashDeviceChips.appendChild(allDev);

    uniqueDevices.forEach((dev) => {
      const chip = document.createElement('button');
      chip.className = `filter-chip ${TabVaultFilterManager.filters.deviceId === dev.id ? 'active' : ''}`;
      chip.textContent = `${TabVaultDeviceManager.getPlatformIcon(dev.platform)} ${dev.name} (${dev.tabCount} tabs)`;
      chip.addEventListener('click', () => {
        TabVaultFilterManager.setDevice(dev.id);
        populateDashboardFilterModal();
      });
      dashDeviceChips.appendChild(chip);
    });
  }

  // Copy Markdown List
  copyMarkdownBtn.addEventListener('click', () => {
    let markdown = `# TabVault Stashed Tabs Backup\n\n`;
    allSessions.forEach((s) => {
      const activeTabs = (s.tabs || []).filter((t) => !t.isPopped);
      if (activeTabs.length > 0) {
        markdown += `## ${s.title || 'Session'} (${new Date(s.timestamp).toLocaleString()}) - ${s.deviceInfo?.deviceName || 'PC'}\n`;
        activeTabs.forEach((t) => {
          markdown += `- [${t.title}](${t.url})\n`;
        });
        markdown += `\n`;
      }
    });

    navigator.clipboard.writeText(markdown).then(() => {
      copyMarkdownBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyMarkdownBtn.textContent = 'Copy as Markdown';
      }, 2000);
    });
  });

  // Clear All
  clearAllBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to delete all saved tab sessions? This action cannot be undone.')) {
      await TabVaultAPI.storage.local.set({ savedSessions: [], totalTabsStashed: 0 });
      loadDashboardData();
    }
  });

  // Export JSON
  exportBtn.addEventListener('click', () => {
    const jsonStr = JSON.stringify(allSessions, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tabvault-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Import JSON
  importBtn.addEventListener('click', () => {
    importFileInput.click();
  });

  importFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedSessions = JSON.parse(event.target.result);
        if (Array.isArray(importedSessions)) {
          const data = await TabVaultAPI.storage.local.get(['savedSessions']);
          const existing = data.savedSessions || [];
          const merged = [...importedSessions, ...existing];
          await TabVaultAPI.storage.local.set({ savedSessions: merged });
          alert('Successfully imported tab sessions!');
          loadDashboardData();
          TabVaultSyncEngine.onLocalDataChanged();
        }
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  });

  // Cloud Sync & Auth Modal Handlers
  dashLoginBtn.addEventListener('click', () => {
    dashAuthModal.classList.remove('hidden');
  });

  dashCloseModalBtn.addEventListener('click', () => {
    dashAuthModal.classList.add('hidden');
    hideDashAuthError();
  });

  dashAuthModal.addEventListener('click', (e) => {
    if (e.target === dashAuthModal) {
      dashAuthModal.classList.add('hidden');
      hideDashAuthError();
    }
  });

  dashTabLogin.addEventListener('click', () => {
    authMode = 'login';
    dashTabLogin.classList.add('active');
    dashTabRegister.classList.remove('active');
    dashNameFieldGroup.classList.add('hidden');
    dashAuthSubmitBtn.querySelector('span').textContent = 'Sign In & Sync';
    hideDashAuthError();
  });

  dashTabRegister.addEventListener('click', () => {
    authMode = 'register';
    dashTabRegister.classList.add('active');
    dashTabLogin.classList.remove('active');
    dashNameFieldGroup.classList.remove('hidden');
    dashAuthSubmitBtn.querySelector('span').textContent = 'Create Account & Sync';
    hideDashAuthError();
  });

  dashAuthForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideDashAuthError();

    const email = dashEmailInput.value.trim();
    const password = dashPasswordInput.value;
    const name = dashNameInput.value.trim();

    dashAuthSubmitBtn.disabled = true;
    dashAuthSubmitBtn.querySelector('span').textContent = 'Connecting...';

    try {
      if (authMode === 'register') {
        await TabVaultApiClient.register(email, password, name);
      } else {
        await TabVaultApiClient.login(email, password);
      }

      dashAuthModal.classList.add('hidden');
      await TabVaultSyncEngine.syncNow();
      updateCloudUI();
      loadDashboardData();
    } catch (err) {
      showDashAuthError(err.message || 'Authentication failed.');
    } finally {
      dashAuthSubmitBtn.disabled = false;
      dashAuthSubmitBtn.querySelector('span').textContent =
        authMode === 'register' ? 'Create Account & Sync' : 'Sign In & Sync';
    }
  });

  dashSyncNowBtn.addEventListener('click', async () => {
    dashSyncNowBtn.disabled = true;
    dashSyncNowBtn.textContent = 'Syncing...';
    try {
      await TabVaultSyncEngine.syncNow();
      updateCloudUI();
      loadDashboardData();
    } finally {
      dashSyncNowBtn.disabled = false;
      dashSyncNowBtn.textContent = 'Sync Now';
    }
  });

  dashLogoutBtn.addEventListener('click', async () => {
    await TabVaultApiClient.clearAuth();
    updateCloudUI();
  });

  function showDashAuthError(msg) {
    dashAuthErrorBox.textContent = msg;
    dashAuthErrorBox.classList.remove('hidden');
  }

  function hideDashAuthError() {
    dashAuthErrorBox.textContent = '';
    dashAuthErrorBox.classList.add('hidden');
  }

  async function updateCloudUI() {
    const isAuth = await TabVaultApiClient.isAuthenticated();
    if (isAuth) {
      const user = await TabVaultApiClient.getUser();
      dashLoggedOutBox.classList.add('hidden');
      dashLoggedInBox.classList.remove('hidden');
      dashSyncDot.classList.remove('hidden');

      dashUserName.textContent = user?.name || 'TabVault User';
      dashUserEmail.textContent = user?.email || '';
      dashUserAvatar.textContent = (user?.name || user?.email || 'U')[0].toUpperCase();

      const storage = await TabVaultAPI.storage.local.get(['tabvault_last_sync']);
      dashLastSyncTime.textContent = storage.tabvault_last_sync
        ? TabVaultUI.formatTimeAgo(storage.tabvault_last_sync)
        : 'Never';
    } else {
      dashLoggedOutBox.classList.remove('hidden');
      dashLoggedInBox.classList.add('hidden');
      dashSyncDot.classList.add('hidden');
    }
  }

  function updateSyncStatusBadge(status, error = null) {
    if (status === 'syncing') {
      dashSyncDot.className = 'sync-dot syncing';
      dashSyncBadge.className = 'dash-badge yellow';
      dashSyncBadge.textContent = '🟡 Syncing...';
    } else if (status === 'error') {
      dashSyncDot.className = 'sync-dot error';
      dashSyncBadge.className = 'dash-badge red';
      dashSyncBadge.textContent = '🔴 Offline / Error';
    } else {
      dashSyncDot.className = 'sync-dot';
      dashSyncBadge.className = 'dash-badge green';
      dashSyncBadge.textContent = '🟢 Up to Date';
    }
  }

  async function loadDashboardData() {
    const data = await TabVaultAPI.storage.local.get(['savedSessions']);
    allSessions = data.savedSessions || [];

    const activeSessions = allSessions.filter((s) => !s.isArchived);
    const totalActiveTabs = activeSessions.reduce((acc, s) => {
      const activeTabs = (s.tabs || []).filter((t) => !t.isPopped);
      return acc + activeTabs.length;
    }, 0);

    const estRam = Math.round(totalActiveTabs * 120);
    ramVal.textContent =
      estRam > 1024
        ? `~${(estRam / 1024).toFixed(1)} GB`
        : `~${estRam} MB`;

    totalTabsVal.textContent = totalActiveTabs;
    totalSessionsVal.textContent = activeSessions.filter((s) =>
      (s.tabs || []).some((t) => !t.isPopped)
    ).length;

    renderFilteredGrid();
  }

  function renderFilteredGrid() {
    grid.innerHTML = '';

    const hasFilters = TabVaultFilterManager.hasActiveFilters();
    if (hasFilters) {
      dashFilterActiveDot.classList.remove('hidden');
      dashOpenFilterBtn.classList.add('active');
      dashActiveFilterBar.classList.remove('hidden');

      const parts = [];
      if (TabVaultFilterManager.filters.domain) parts.push(`Site: ${TabVaultFilterManager.filters.domain}`);
      if (TabVaultFilterManager.filters.deviceId) {
        const d = TabVaultFilterManager.extractUniqueDevices(allSessions).find(x => x.id === TabVaultFilterManager.filters.deviceId);
        parts.push(`PC: ${d ? d.name : 'Selected PC'}`);
      }
      if (TabVaultFilterManager.filters.dateRange !== 'all') parts.push(`Date: ${TabVaultFilterManager.filters.dateRange}`);
      if (TabVaultFilterManager.filters.query) parts.push(`"${TabVaultFilterManager.filters.query}"`);
      dashFilterTag.textContent = parts.join(' • ') || 'Active Filter';
    } else {
      dashFilterActiveDot.classList.add('hidden');
      dashOpenFilterBtn.classList.remove('active');
      dashActiveFilterBar.classList.add('hidden');
    }

    const viewMode = TabVaultFilterManager.filters.viewMode;

    // 1. ALL TABS MASTER VIEW (Grouped)
    if (viewMode === 'all-tabs') {
      const flatTabs = TabVaultFilterManager.extractAllTabs(allSessions);
      if (!flatTabs || flatTabs.length === 0) {
        emptyHeading.textContent = 'No Tabs Found';
        emptySubtext.textContent = 'No stashed tabs match your current filter criteria.';
        emptyState.classList.remove('hidden');
        return;
      }
      emptyState.classList.add('hidden');

      const groups = TabVaultFilterManager.groupTabs(flatTabs, TabVaultFilterManager.filters.tabGrouping);
      groups.forEach((group) => {
        const groupCard = TabVaultUI.createGroupedTabSection(group, {
          onOpenTab: async (url) => {
            await TabVaultAPI.tabs.create({ url });
          },
          onPopTab: async (sessionId, tabId, url) => {
            await TabVaultAPI.tabs.create({ url });
            await popTabFromSession(sessionId, tabId);
          },
          onDeleteTab: handleDeleteTab,
        });
        grid.appendChild(groupCard);
      });
      return;
    }

    // 2. SESSION CARDS VIEW (Active, Pinned, or Archive)
    const filtered = TabVaultFilterManager.applyFilters(allSessions);

    if (!filtered || filtered.length === 0) {
      if (viewMode === 'archive') {
        emptyHeading.textContent = 'No Archived Sessions';
        emptySubtext.textContent = 'Archived sessions will appear safely stored here.';
      } else {
        emptyHeading.textContent = 'No Stashed Sessions Found';
        emptySubtext.textContent = 'Click "Stash Window Tabs" or press Alt+S to stash your open tabs.';
      }
      emptyState.classList.remove('hidden');
      return;
    } else {
      emptyState.classList.add('hidden');
    }

    // Sort: Pinned first, then newest
    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (b.timestamp || 0) - (a.timestamp || 0);
    });

    filtered.forEach((session) => {
      const card = TabVaultUI.createSessionCard(session, {
        onRename: handleRenameSession,
        onTogglePin: handleTogglePin,
        onRestore: handleRestoreSession,
        onArchiveSession: handleArchiveSession,
        onUnarchiveSession: handleUnarchiveSession,
        onDomainFilter: (domain) => {
          TabVaultFilterManager.setDomain(domain);
        },
        onOpenTab: async (url) => {
          await TabVaultAPI.tabs.create({ url });
        },
        onPopTab: async (sessionId, tabId, url) => {
          await TabVaultAPI.tabs.create({ url });
          await popTabFromSession(sessionId, tabId);
        },
        onDeleteTab: handleDeleteTab,
      });
      grid.appendChild(card);
    });
  }

  // Session Renaming
  async function handleRenameSession(sessionId, newTitle) {
    const data = await TabVaultAPI.storage.local.get(['savedSessions']);
    let sessions = data.savedSessions || [];
    const index = sessions.findIndex((s) => s.id === sessionId);
    if (index !== -1) {
      sessions[index].title = newTitle;
      sessions[index].clientUpdatedAt = Date.now();
      await TabVaultAPI.storage.local.set({ savedSessions: sessions });
      allSessions = sessions;
      TabVaultSyncEngine.onLocalDataChanged();
    }
  }

  // Toggle Pin
  async function handleTogglePin(sessionId) {
    const data = await TabVaultAPI.storage.local.get(['savedSessions']);
    let sessions = data.savedSessions || [];
    const index = sessions.findIndex((s) => s.id === sessionId);
    if (index !== -1) {
      sessions[index].isPinned = !sessions[index].isPinned;
      sessions[index].clientUpdatedAt = Date.now();
      await TabVaultAPI.storage.local.set({ savedSessions: sessions });
      loadDashboardData();
      TabVaultSyncEngine.onLocalDataChanged();
    }
  }

  // Archive Session (Replaces Delete)
  async function handleArchiveSession(sessionId) {
    const data = await TabVaultAPI.storage.local.get(['savedSessions']);
    let sessions = data.savedSessions || [];
    const index = sessions.findIndex((s) => s.id === sessionId);
    if (index !== -1) {
      sessions[index].isArchived = true;
      sessions[index].archivedAt = Date.now();
      sessions[index].clientUpdatedAt = Date.now();
      await TabVaultAPI.storage.local.set({ savedSessions: sessions });
      loadDashboardData();
      TabVaultSyncEngine.onLocalDataChanged();
    }
  }

  // Unarchive Session
  async function handleUnarchiveSession(sessionId) {
    const data = await TabVaultAPI.storage.local.get(['savedSessions']);
    let sessions = data.savedSessions || [];
    const index = sessions.findIndex((s) => s.id === sessionId);
    if (index !== -1) {
      sessions[index].isArchived = false;
      sessions[index].archivedAt = null;
      sessions[index].clientUpdatedAt = Date.now();
      await TabVaultAPI.storage.local.set({ savedSessions: sessions });
      loadDashboardData();
      TabVaultSyncEngine.onLocalDataChanged();
    }
  }

  // Restore Session
  async function handleRestoreSession(sessionId, inNewWindow = false) {
    const data = await TabVaultAPI.storage.local.get(['savedSessions']);
    let sessions = data.savedSessions || [];
    const sessionIndex = sessions.findIndex((s) => s.id === sessionId);
    if (sessionIndex !== -1) {
      const session = sessions[sessionIndex];
      const activeTabs = (session.tabs || []).filter((t) => !t.isPopped);
      if (activeTabs.length > 0) {
        const urls = activeTabs.map((t) => t.url);
        if (inNewWindow) {
          await TabVaultAPI.windows.create({ url: urls });
        } else {
          for (const url of urls) {
            await TabVaultAPI.tabs.create({ url });
          }
        }

        activeTabs.forEach((t) => {
          t.isPopped = true;
          t.poppedAt = Date.now();
        });
        session.clientUpdatedAt = Date.now();

        await TabVaultAPI.storage.local.set({ savedSessions: sessions });
        loadDashboardData();
        TabVaultSyncEngine.onLocalDataChanged();
      }
    }
  }

  // Pop single tab
  async function popTabFromSession(sessionId, tabId) {
    const data = await TabVaultAPI.storage.local.get(['savedSessions']);
    let sessions = data.savedSessions || [];
    const sessionIndex = sessions.findIndex((s) => s.id === sessionId);
    if (sessionIndex !== -1) {
      const tab = (sessions[sessionIndex].tabs || []).find((t) => t.id === tabId);
      if (tab) {
        tab.isPopped = true;
        tab.poppedAt = Date.now();
        sessions[sessionIndex].clientUpdatedAt = Date.now();

        await TabVaultAPI.storage.local.set({ savedSessions: sessions });
        loadDashboardData();
        TabVaultSyncEngine.onLocalDataChanged();
      }
    }
  }

  // Delete Tab from Session
  async function handleDeleteTab(sessionId, tabId) {
    const data = await TabVaultAPI.storage.local.get(['savedSessions']);
    let sessions = data.savedSessions || [];
    const sessionIndex = sessions.findIndex((s) => s.id === sessionId);
    if (sessionIndex !== -1) {
      sessions[sessionIndex].tabs = sessions[sessionIndex].tabs.filter(
        (t) => t.id !== tabId
      );
      sessions[sessionIndex].clientUpdatedAt = Date.now();

      if (sessions[sessionIndex].tabs.length === 0) {
        sessions[sessionIndex].isArchived = true;
        sessions[sessionIndex].archivedAt = Date.now();
      }

      TabVaultSyncEngine.onLocalDataChanged();
      await TabVaultAPI.storage.local.set({ savedSessions: sessions });
      loadDashboardData();
    }
  }
});
