// TabVault Popup Logic (Modular Architecture with Selective Stashing, Domain Stashing, Links Shelf, & Universal Search)

document.addEventListener('DOMContentLoaded', async () => {
  // DOM Elements - Primary & Navigation
  const stashAllBtn = document.getElementById('stash-all-btn');
  const stashExceptBtn = document.getElementById('stash-except-btn');
  const openTabSelectorBtn = document.getElementById('open-tab-selector-btn');
  const stashDomainBtn = document.getElementById('stash-domain-btn');
  const stashDomainBtnText = document.getElementById('stash-domain-btn-text');
  const stashRightBtn = document.getElementById('stash-right-btn');
  const stashLeftBtn = document.getElementById('stash-left-btn');
  const openDomainsBar = document.getElementById('open-domains-bar');
  const openDomainsContainer = document.getElementById('open-domains-container');

  const openDashboardBtn = document.getElementById('open-dashboard-btn');
  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('clear-search-btn');
  const openFilterBtn = document.getElementById('open-filter-btn');
  const filterActiveDot = document.getElementById('filter-active-dot');
  const activeFilterBar = document.getElementById('active-filter-bar');
  const filterBarTag = document.getElementById('filter-bar-tag');
  const clearFiltersBtn = document.getElementById('clear-filters-btn');
  const popupGroupingSelector = document.getElementById('popup-grouping-selector');
  const sessionsContainer = document.getElementById('sessions-container');
  const linksContainer = document.getElementById('links-container');
  const savedLinksList = document.getElementById('saved-links-list');
  const linksCountBadge = document.getElementById('links-count-badge');
  const convertLinksToStashBtn = document.getElementById('convert-links-to-stash-btn');

  // Search Live Open Tabs Elements
  const searchOpenTabsSection = document.getElementById('search-open-tabs-section');
  const searchOpenCount = document.getElementById('search-open-count');
  const searchOpenTabsList = document.getElementById('search-open-tabs-list');

  const emptyState = document.getElementById('empty-state');
  const emptyHeading = document.getElementById('empty-heading');
  const emptySubtext = document.getElementById('empty-subtext');
  const ramSavedVal = document.getElementById('ram-saved-val');
  const totalTabsVal = document.getElementById('total-tabs-val');
  const totalSessionsVal = document.getElementById('total-sessions-val');
  const exportJsonBtn = document.getElementById('export-json-btn');

  // Tab Selector Modal Elements
  const tabSelectorModal = document.getElementById('tab-selector-modal');
  const closeTabSelectorBtn = document.getElementById('close-tab-selector-btn');
  const openTabsFilterInput = document.getElementById('open-tabs-filter-input');
  const selectAllOpenTabsBtn = document.getElementById('select-all-open-tabs-btn');
  const deselectAllOpenTabsBtn = document.getElementById('deselect-all-open-tabs-btn');
  const invertOpenTabsBtn = document.getElementById('invert-open-tabs-btn');
  const openTabsListContainer = document.getElementById('open-tabs-list-container');
  const selectedTabsCountLabel = document.getElementById('selected-tabs-count-label');
  const stashSelectedConfirmBtn = document.getElementById('stash-selected-confirm-btn');

  // Filter Modal Elements
  const filterModal = document.getElementById('filter-modal');
  const closeFilterModalBtn = document.getElementById('close-filter-modal-btn');
  const domainChipsContainer = document.getElementById('domain-chips-container');
  const deviceChipsContainer = document.getElementById('device-chips-container');
  const resetAllFiltersBtn = document.getElementById('reset-all-filters-btn');
  const applyFiltersBtn = document.getElementById('apply-filters-btn');

  // Cloud Sync & Auth Modal Elements
  const cloudSyncBtn = document.getElementById('cloud-sync-btn');
  const syncStatusDot = document.getElementById('sync-status-dot');
  const cloudBtnText = document.getElementById('cloud-btn-text');
  const authModal = document.getElementById('auth-modal');
  const closeAuthModalBtn = document.getElementById('close-auth-modal-btn');
  const authFormsContainer = document.getElementById('auth-forms-container');
  const authProfileContainer = document.getElementById('auth-profile-container');
  const tabLoginBtn = document.getElementById('tab-login-btn');
  const tabRegisterBtn = document.getElementById('tab-register-btn');
  const nameFieldGroup = document.getElementById('name-field-group');
  const authForm = document.getElementById('auth-form');
  const authNameInput = document.getElementById('auth-name');
  const authEmailInput = document.getElementById('auth-email');
  const authPasswordInput = document.getElementById('auth-password');
  const authErrorBox = document.getElementById('auth-error-box');
  const authSubmitBtn = document.getElementById('auth-submit-btn');

  // Device Settings Elements
  const currentDeviceIcon = document.getElementById('current-device-icon');
  const currentDeviceDisplay = document.getElementById('current-device-display');
  const renameDeviceInput = document.getElementById('rename-device-input');
  const saveDeviceNameBtn = document.getElementById('save-device-name-btn');

  const profileAvatar = document.getElementById('profile-avatar');
  const profileName = document.getElementById('profile-name');
  const profileEmail = document.getElementById('profile-email');
  const profileSyncStatus = document.getElementById('profile-sync-status');
  const profileLastSync = document.getElementById('profile-last-sync');
  const manualSyncBtn = document.getElementById('manual-sync-btn');
  const logoutBtn = document.getElementById('logout-btn');

  // State
  let allSessions = [];
  let allSavedLinks = [];
  let currentOpenTabs = [];
  let selectedOpenTabIds = new Set();
  let linksFilterMode = 'all'; // 'all' | 'unread' | 'read'
  let currentActiveDomain = '';
  let authMode = 'login';

  // Initialize Device Manager
  const currentDeviceInfo = await TabVaultDeviceManager.init();
  updateDeviceUI(currentDeviceInfo);

  // Initialize Data & UI
  await refreshOpenTabsData();
  loadAndRenderSessions();
  loadAndRenderSavedLinks();
  updateCloudUI();

  // Global Keyboard Shortcut: Ctrl+K / / to Focus Search
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    } else if (e.key === '/' && document.activeElement !== searchInput && document.activeElement.tagName !== 'INPUT') {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
  });

  // Listen for sync, data, and links events
  window.addEventListener('tabvault:data-updated', () => {
    loadAndRenderSessions();
    refreshOpenTabsData();
    updateCloudUI();
  });

  window.addEventListener('tabvault:links-updated', () => {
    loadAndRenderSavedLinks();
  });

  window.addEventListener('tabvault:sync-status', (e) => {
    updateSyncStatusBadge(e.detail.status, e.detail.error);
  });

  window.addEventListener('tabvault:auth-change', () => {
    updateCloudUI();
    loadAndRenderSessions();
    loadAndRenderSavedLinks();
  });

  window.addEventListener('tabvault:device-updated', (e) => {
    updateDeviceUI(e.detail);
    loadAndRenderSessions();
  });

  TabVaultFilterManager.onFilterChange(() => {
    renderFilteredSessions();
  });

  // 1. Popup Navigation Tabs (Active | All Tabs | Archive | Links)
  document.querySelectorAll('.popup-tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.popup-tab-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const view = btn.dataset.view;

      if (view === 'links') {
        sessionsContainer.classList.add('hidden');
        linksContainer.classList.remove('hidden');
        popupGroupingSelector.classList.add('hidden');
        searchOpenTabsSection.classList.add('hidden');
        renderSavedLinks();
      } else {
        linksContainer.classList.add('hidden');
        sessionsContainer.classList.remove('hidden');
        TabVaultFilterManager.setViewMode(view);

        if (view === 'all-tabs') {
          popupGroupingSelector.classList.remove('hidden');
        } else {
          popupGroupingSelector.classList.add('hidden');
        }
      }
    });
  });

  // Grouping Buttons (in All Tabs View)
  document.querySelectorAll('.popup-group-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.popup-group-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      TabVaultFilterManager.setTabGrouping(btn.dataset.group);
    });
  });

  // 2. Open Tabs Query & Domain Analysis
  async function refreshOpenTabsData() {
    try {
      currentOpenTabs = await TabVaultAPI.tabs.query({ currentWindow: true });
      const activeTab = currentOpenTabs.find((t) => t.active);

      // Analyze active tab domain
      if (activeTab && activeTab.url && activeTab.url.startsWith('http')) {
        try {
          currentActiveDomain = new URL(activeTab.url).hostname.replace(/^www\./, '');
          const domainTabs = currentOpenTabs.filter((t) => {
            try {
              return t.url && new URL(t.url).hostname.replace(/^www\./, '') === currentActiveDomain;
            } catch {
              return false;
            }
          });

          stashDomainBtn.classList.remove('hidden');
          stashDomainBtnText.textContent = `Stash ${currentActiveDomain} (${domainTabs.length})`;
          stashDomainBtn.title = `Stash all ${domainTabs.length} tabs from ${currentActiveDomain}`;
        } catch {
          stashDomainBtn.classList.add('hidden');
        }
      } else {
        stashDomainBtn.classList.add('hidden');
      }

      // Group open tabs by domain for Domain Chips Bar
      const domainMap = {};
      currentOpenTabs.forEach((t) => {
        if (t.url && t.url.startsWith('http')) {
          try {
            const d = new URL(t.url).hostname.replace(/^www\./, '');
            domainMap[d] = (domainMap[d] || 0) + 1;
          } catch {}
        }
      });

      const domainEntries = Object.entries(domainMap).sort((a, b) => b[1] - a[1]);
      if (domainEntries.length > 1) {
        openDomainsBar.classList.remove('hidden');
        openDomainsContainer.innerHTML = '';
        domainEntries.forEach(([domain, count]) => {
          const chip = document.createElement('button');
          chip.className = 'open-domain-chip';
          chip.innerHTML = `<span>🌐 ${domain}</span> <strong>(${count})</strong>`;
          chip.title = `Click to stash all ${count} tabs from ${domain}`;
          chip.addEventListener('click', async () => {
            chip.disabled = true;
            chip.textContent = 'Stashing...';
            await TabVaultAPI.runtime.sendMessage({
              action: 'STASH_BY_DOMAIN',
              domain: domain,
            });
            setTimeout(async () => {
              await refreshOpenTabsData();
              loadAndRenderSessions();
            }, 300);
          });
          openDomainsContainer.appendChild(chip);
        });
      } else {
        openDomainsBar.classList.add('hidden');
      }
    } catch (e) {
      console.warn('TabVault: refreshOpenTabsData error', e);
    }
  }

  // 3. Stash Action Event Listeners
  stashAllBtn.addEventListener('click', () => {
    stashAllBtn.disabled = true;
    stashAllBtn.querySelector('span').textContent = 'Stashing...';
    TabVaultAPI.runtime.sendMessage({ action: 'STASH_ALL_TABS' }).then(() => {
      setTimeout(() => {
        stashAllBtn.disabled = false;
        stashAllBtn.querySelector('span').textContent = 'Stash All Window Tabs';
        loadAndRenderSessions();
        refreshOpenTabsData();
      }, 300);
    });
  });

  stashExceptBtn.addEventListener('click', () => {
    stashExceptBtn.disabled = true;
    TabVaultAPI.runtime.sendMessage({ action: 'STASH_EXCEPT_CURRENT' }).then(() => {
      setTimeout(() => {
        stashExceptBtn.disabled = false;
        loadAndRenderSessions();
        refreshOpenTabsData();
      }, 300);
    });
  });

  stashDomainBtn.addEventListener('click', () => {
    if (!currentActiveDomain) return;
    stashDomainBtn.disabled = true;
    stashDomainBtnText.textContent = 'Stashing...';
    TabVaultAPI.runtime.sendMessage({
      action: 'STASH_BY_DOMAIN',
      domain: currentActiveDomain,
    }).then(() => {
      setTimeout(() => {
        stashDomainBtn.disabled = false;
        loadAndRenderSessions();
        refreshOpenTabsData();
      }, 300);
    });
  });

  stashRightBtn.addEventListener('click', () => {
    stashRightBtn.disabled = true;
    TabVaultAPI.runtime.sendMessage({
      action: 'STASH_DIRECTIONAL',
      direction: 'right',
    }).then(() => {
      setTimeout(() => {
        stashRightBtn.disabled = false;
        loadAndRenderSessions();
        refreshOpenTabsData();
      }, 300);
    });
  });

  stashLeftBtn.addEventListener('click', () => {
    stashLeftBtn.disabled = true;
    TabVaultAPI.runtime.sendMessage({
      action: 'STASH_DIRECTIONAL',
      direction: 'left',
    }).then(() => {
      setTimeout(() => {
        stashLeftBtn.disabled = false;
        loadAndRenderSessions();
        refreshOpenTabsData();
      }, 300);
    });
  });

  // 4. Interactive Open Tab Selector Drawer / Modal
  openTabSelectorBtn.addEventListener('click', async () => {
    await refreshOpenTabsData();
    selectedOpenTabIds = new Set(currentOpenTabs.map((t) => t.id));
    openTabsFilterInput.value = '';
    renderOpenTabsSelectorList();
    tabSelectorModal.classList.remove('hidden');
  });

  closeTabSelectorBtn.addEventListener('click', () => {
    tabSelectorModal.classList.add('hidden');
  });

  tabSelectorModal.addEventListener('click', (e) => {
    if (e.target === tabSelectorModal) {
      tabSelectorModal.classList.add('hidden');
    }
  });

  openTabsFilterInput.addEventListener('input', () => {
    renderOpenTabsSelectorList();
  });

  selectAllOpenTabsBtn.addEventListener('click', () => {
    currentOpenTabs.forEach((t) => selectedOpenTabIds.add(t.id));
    renderOpenTabsSelectorList();
  });

  deselectAllOpenTabsBtn.addEventListener('click', () => {
    selectedOpenTabIds.clear();
    renderOpenTabsSelectorList();
  });

  invertOpenTabsBtn.addEventListener('click', () => {
    currentOpenTabs.forEach((t) => {
      if (selectedOpenTabIds.has(t.id)) {
        selectedOpenTabIds.delete(t.id);
      } else {
        selectedOpenTabIds.add(t.id);
      }
    });
    renderOpenTabsSelectorList();
  });

  function renderOpenTabsSelectorList() {
    openTabsListContainer.innerHTML = '';
    const query = openTabsFilterInput.value.toLowerCase().trim();

    const filtered = currentOpenTabs.filter((tab) => {
      if (!query) return true;
      const title = (tab.title || '').toLowerCase();
      const url = (tab.url || '').toLowerCase();
      return title.includes(query) || url.includes(query);
    });

    if (filtered.length === 0) {
      openTabsListContainer.innerHTML = `
        <div style="padding: 20px; text-align: center; color: var(--text-dim); font-size: 11px;">
          No matching open tabs found.
        </div>
      `;
    } else {
      filtered.forEach((tab) => {
        const isSelected = selectedOpenTabIds.has(tab.id);
        const row = TabVaultUI.createOpenTabRow(tab, isSelected, (tabId, checked) => {
          if (checked) {
            selectedOpenTabIds.add(tabId);
          } else {
            selectedOpenTabIds.delete(tabId);
          }
          updateSelectorCountUI();
        });
        openTabsListContainer.appendChild(row);
      });
    }

    updateSelectorCountUI();
  }

  function updateSelectorCountUI() {
    const count = selectedOpenTabIds.size;
    selectedTabsCountLabel.textContent = `${count} tab${count !== 1 ? 's' : ''} selected`;
    stashSelectedConfirmBtn.disabled = count === 0;
    stashSelectedConfirmBtn.querySelector('span').textContent =
      count > 0 ? `Stash ${count} Selected Tabs` : 'Stash Selected Tabs';
  }

  stashSelectedConfirmBtn.addEventListener('click', async () => {
    const idsToStash = Array.from(selectedOpenTabIds);
    if (!idsToStash.length) return;

    stashSelectedConfirmBtn.disabled = true;
    stashSelectedConfirmBtn.querySelector('span').textContent = 'Stashing...';

    await TabVaultAPI.runtime.sendMessage({
      action: 'STASH_SELECTED_TABS',
      tabIds: idsToStash,
    });

    setTimeout(async () => {
      stashSelectedConfirmBtn.disabled = false;
      stashSelectedConfirmBtn.querySelector('span').textContent = 'Stash Selected Tabs';
      tabSelectorModal.classList.add('hidden');
      await refreshOpenTabsData();
      loadAndRenderSessions();
    }, 300);
  });

  // 5. Universal Search Handlers
  searchInput.addEventListener('input', (e) => {
    const val = e.target.value;
    clearSearchBtn.classList.toggle('hidden', !val);
    TabVaultFilterManager.setFilter('query', val);

    if (val.trim()) {
      renderSearchOpenTabs(val.trim());
    } else {
      searchOpenTabsSection.classList.add('hidden');
    }
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearSearchBtn.classList.add('hidden');
    searchOpenTabsSection.classList.add('hidden');
    TabVaultFilterManager.setFilter('query', '');
    searchInput.focus();
  });

  function renderSearchOpenTabs(query) {
    const q = query.toLowerCase();
    const matches = currentOpenTabs.filter((t) => {
      const title = (t.title || '').toLowerCase();
      const url = (t.url || '').toLowerCase();
      return title.includes(q) || url.includes(q);
    });

    if (matches.length === 0) {
      searchOpenTabsSection.classList.add('hidden');
      return;
    }

    searchOpenTabsSection.classList.remove('hidden');
    searchOpenCount.textContent = `${matches.length} tab${matches.length !== 1 ? 's' : ''}`;
    searchOpenTabsList.innerHTML = '';

    matches.slice(0, 5).forEach((tab) => {
      const row = document.createElement('div');
      row.className = 'search-open-tab-row';
      row.innerHTML = `
        <div class="search-tab-info">
          <img class="tab-favicon" src="${tab.favIconUrl || 'icons/icon16.png'}" onerror="this.src='icons/icon16.png'" width="14" height="14" alt="" />
          <span class="search-tab-title" title="${TabVaultUI.escapeHtml(tab.title || '')}">${TabVaultUI.escapeHtml(tab.title || 'Untitled Tab')}</span>
        </div>
        <span class="search-tab-action-tag">Switch ➔</span>
      `;

      row.addEventListener('click', async () => {
        await TabVaultAPI.tabs.update(tab.id, { active: true });
      });

      searchOpenTabsList.appendChild(row);
    });
  }

  // 6. Saved Links View Handlers
  async function loadAndRenderSavedLinks() {
    allSavedLinks = await TabVaultLinksManager.getLinks();

    // Update unread count badge
    const unreadCount = allSavedLinks.filter((l) => !l.isRead).length;
    if (unreadCount > 0) {
      linksCountBadge.textContent = unreadCount;
      linksCountBadge.classList.remove('hidden');
    } else {
      linksCountBadge.classList.add('hidden');
    }

    renderSavedLinks();
  }

  // Filter Pills for Links (All | Unread | Read)
  document.querySelectorAll('.link-filter-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.link-filter-pill').forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      linksFilterMode = pill.dataset.filter;
      renderSavedLinks();
    });
  });

  function renderSavedLinks() {
    if (document.querySelector('.popup-tab-btn[data-view="links"].active') === null) {
      return;
    }

    savedLinksList.innerHTML = '';
    const query = (searchInput.value || '').toLowerCase().trim();

    let filtered = allSavedLinks;
    if (linksFilterMode === 'unread') {
      filtered = filtered.filter((l) => !l.isRead);
    } else if (linksFilterMode === 'read') {
      filtered = filtered.filter((l) => l.isRead);
    }

    if (query) {
      filtered = filtered.filter(
        (l) =>
          (l.title || '').toLowerCase().includes(query) ||
          (l.url || '').toLowerCase().includes(query) ||
          (l.hostname || '').toLowerCase().includes(query)
      );
    }

    if (filtered.length === 0) {
      savedLinksList.innerHTML = `
        <div style="padding: 40px 20px; text-align: center; color: var(--text-dim);">
          <div style="font-size: 32px; margin-bottom: 8px;">🔗</div>
          <h4 style="color: var(--text-main); font-size: 13px; margin-bottom: 4px;">No Saved Links</h4>
          <p style="font-size: 11px;">Right-click any link on the web and choose <strong>"Save Link to TabVault"</strong> to store it here.</p>
        </div>
      `;
      return;
    }

    filtered.forEach((link) => {
      const item = TabVaultUI.createSavedLinkItem(link, {
        onOpenLink: async (url) => {
          await TabVaultAPI.tabs.create({ url });
        },
        onToggleRead: async (linkId, isRead) => {
          await TabVaultLinksManager.toggleRead(linkId, isRead);
          loadAndRenderSavedLinks();
        },
        onDeleteLink: async (linkId) => {
          await TabVaultLinksManager.deleteLink(linkId);
          loadAndRenderSavedLinks();
        },
      });
      savedLinksList.appendChild(item);
    });
  }

  // Convert Selected / Unread Links to Stashed Session
  convertLinksToStashBtn.addEventListener('click', async () => {
    const selectedBoxes = savedLinksList.querySelectorAll('.link-checkbox:checked');
    const selectedIds = Array.from(selectedBoxes).map((b) => b.dataset.linkId);

    convertLinksToStashBtn.disabled = true;
    convertLinksToStashBtn.querySelector('span').textContent = 'Converting...';

    try {
      await TabVaultLinksManager.convertLinksToSession(selectedIds);
      loadAndRenderSavedLinks();
      loadAndRenderSessions();
    } catch (err) {
      alert(err.message || 'Error converting links');
    } finally {
      convertLinksToStashBtn.disabled = false;
      convertLinksToStashBtn.querySelector('span').textContent = 'Convert to Stash';
    }
  });

  // 7. Filter Modal Controls
  openFilterBtn.addEventListener('click', () => {
    populateFilterModal();
    filterModal.classList.remove('hidden');
  });

  closeFilterModalBtn.addEventListener('click', () => {
    filterModal.classList.add('hidden');
  });

  filterModal.addEventListener('click', (e) => {
    if (e.target === filterModal) {
      filterModal.classList.add('hidden');
    }
  });

  resetAllFiltersBtn.addEventListener('click', () => {
    TabVaultFilterManager.reset();
    searchInput.value = '';
    clearSearchBtn.classList.add('hidden');
    searchOpenTabsSection.classList.add('hidden');
    populateFilterModal();
    filterModal.classList.add('hidden');
  });

  applyFiltersBtn.addEventListener('click', () => {
    filterModal.classList.add('hidden');
  });

  clearFiltersBtn.addEventListener('click', () => {
    TabVaultFilterManager.reset();
    searchInput.value = '';
    clearSearchBtn.classList.add('hidden');
    searchOpenTabsSection.classList.add('hidden');
  });

  // Date Filter Chips
  document.querySelectorAll('.date-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.date-chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      TabVaultFilterManager.setFilter('dateRange', chip.dataset.date);
    });
  });

  // Export JSON
  exportJsonBtn.addEventListener('click', () => {
    const exportData = {
      sessions: allSessions,
      links: allSavedLinks,
      exportedAt: new Date().toISOString(),
    };
    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tabvault-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Open Dashboard
  openDashboardBtn.addEventListener('click', () => {
    TabVaultAPI.tabs.create({
      url: TabVaultAPI.runtime.getURL('dashboard.html'),
    });
  });

  // PC Device Renaming Handler
  saveDeviceNameBtn.addEventListener('click', async () => {
    const newName = renameDeviceInput.value.trim();
    if (newName) {
      await TabVaultDeviceManager.setDeviceName(newName);
      saveDeviceNameBtn.textContent = 'Saved!';
      setTimeout(() => {
        saveDeviceNameBtn.textContent = 'Save PC Name';
      }, 1500);
    }
  });

  function updateDeviceUI(info) {
    if (!info) return;
    currentDeviceIcon.textContent = TabVaultDeviceManager.getPlatformIcon(info.platform);
    currentDeviceDisplay.textContent = `${info.deviceName} (${info.browser})`;
    renameDeviceInput.value = info.deviceName;
  }

  // Cloud Sync & Auth Modal Handlers
  cloudSyncBtn.addEventListener('click', () => {
    updateModalView();
    authModal.classList.remove('hidden');
  });

  closeAuthModalBtn.addEventListener('click', () => {
    authModal.classList.add('hidden');
  });

  authModal.addEventListener('click', (e) => {
    if (e.target === authModal) {
      authModal.classList.add('hidden');
    }
  });

  tabLoginBtn.addEventListener('click', () => {
    authMode = 'login';
    tabLoginBtn.classList.add('active');
    tabRegisterBtn.classList.remove('active');
    nameFieldGroup.classList.add('hidden');
    authSubmitBtn.querySelector('span').textContent = 'Sign In & Sync';
    hideAuthError();
  });

  tabRegisterBtn.addEventListener('click', () => {
    authMode = 'register';
    tabRegisterBtn.classList.add('active');
    tabLoginBtn.classList.remove('active');
    nameFieldGroup.classList.remove('hidden');
    authSubmitBtn.querySelector('span').textContent = 'Create Account & Sync';
    hideAuthError();
  });

  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAuthError();

    const email = authEmailInput.value.trim();
    const password = authPasswordInput.value;
    const name = authNameInput.value.trim();

    authSubmitBtn.disabled = true;
    authSubmitBtn.querySelector('span').textContent = 'Connecting...';

    try {
      if (authMode === 'register') {
        await TabVaultApiClient.register(email, password, name);
      } else {
        await TabVaultApiClient.login(email, password);
      }

      authModal.classList.add('hidden');
      await TabVaultSyncEngine.syncNow();
      updateCloudUI();
      loadAndRenderSessions();
    } catch (err) {
      showAuthError(err.message || 'Authentication failed.');
    } finally {
      authSubmitBtn.disabled = false;
      authSubmitBtn.querySelector('span').textContent =
        authMode === 'register' ? 'Create Account & Sync' : 'Sign In & Sync';
    }
  });

  manualSyncBtn.addEventListener('click', async () => {
    manualSyncBtn.disabled = true;
    manualSyncBtn.textContent = 'Syncing...';
    try {
      await TabVaultSyncEngine.syncNow();
      updateModalView();
      updateCloudUI();
      loadAndRenderSessions();
    } finally {
      manualSyncBtn.disabled = false;
      manualSyncBtn.textContent = 'Sync Now';
    }
  });

  logoutBtn.addEventListener('click', async () => {
    await TabVaultApiClient.clearAuth();
    updateModalView();
    updateCloudUI();
  });

  function showAuthError(msg) {
    authErrorBox.textContent = msg;
    authErrorBox.classList.remove('hidden');
  }

  function hideAuthError() {
    authErrorBox.textContent = '';
    authErrorBox.classList.add('hidden');
  }

  async function updateModalView() {
    hideAuthError();
    const isAuth = await TabVaultApiClient.isAuthenticated();
    if (isAuth) {
      const user = await TabVaultApiClient.getUser();
      authFormsContainer.classList.add('hidden');
      authProfileContainer.classList.remove('hidden');

      profileName.textContent = user?.name || 'TabVault User';
      profileEmail.textContent = user?.email || '';
      profileAvatar.textContent = (user?.name || user?.email || 'U')[0].toUpperCase();

      const storage = await TabVaultAPI.storage.local.get(['tabvault_last_sync']);
      profileLastSync.textContent = storage.tabvault_last_sync
        ? TabVaultUI.formatTimeAgo(storage.tabvault_last_sync)
        : 'Never';
    } else {
      authFormsContainer.classList.remove('hidden');
      authProfileContainer.classList.add('hidden');
    }
  }

  async function updateCloudUI() {
    const isAuth = await TabVaultApiClient.isAuthenticated();
    if (isAuth) {
      const user = await TabVaultApiClient.getUser();
      syncStatusDot.classList.remove('hidden');
      cloudBtnText.textContent = user?.name ? user.name.split(' ')[0] : 'Synced';
    } else {
      syncStatusDot.classList.add('hidden');
      cloudBtnText.textContent = 'Sync';
    }
  }

  function updateSyncStatusBadge(status, error = null) {
    if (status === 'syncing') {
      syncStatusDot.className = 'status-dot syncing';
      profileSyncStatus.className = 'sync-badge yellow';
      profileSyncStatus.textContent = '🟡 Syncing...';
    } else if (status === 'error') {
      syncStatusDot.className = 'status-dot error';
      profileSyncStatus.className = 'sync-badge red';
      profileSyncStatus.textContent = `🔴 Offline / Error`;
    } else {
      syncStatusDot.className = 'status-dot';
      profileSyncStatus.className = 'sync-badge green';
      profileSyncStatus.textContent = '🟢 Up to Date';
    }
  }

  // Populate dynamic chips in Filter Modal
  function populateFilterModal() {
    const uniqueDomains = TabVaultFilterManager.extractUniqueDomains(allSessions);
    domainChipsContainer.innerHTML = '';

    const allDomainChip = document.createElement('button');
    allDomainChip.className = `filter-chip ${!TabVaultFilterManager.filters.domain ? 'active' : ''}`;
    allDomainChip.textContent = 'All Sites';
    allDomainChip.addEventListener('click', () => {
      TabVaultFilterManager.setFilter('domain', null);
      populateFilterModal();
    });
    domainChipsContainer.appendChild(allDomainChip);

    uniqueDomains.slice(0, 15).forEach(({ domain, count }) => {
      const chip = document.createElement('button');
      chip.className = `filter-chip ${TabVaultFilterManager.filters.domain === domain ? 'active' : ''}`;
      chip.textContent = `${domain} (${count})`;
      chip.addEventListener('click', () => {
        TabVaultFilterManager.setDomain(domain);
        populateFilterModal();
      });
      domainChipsContainer.appendChild(chip);
    });

    const uniqueDevices = TabVaultFilterManager.extractUniqueDevices(allSessions);
    deviceChipsContainer.innerHTML = '';

    const allDevChip = document.createElement('button');
    allDevChip.className = `filter-chip ${!TabVaultFilterManager.filters.deviceId ? 'active' : ''}`;
    allDevChip.textContent = 'All PCs';
    allDevChip.addEventListener('click', () => {
      TabVaultFilterManager.setFilter('deviceId', null);
      populateFilterModal();
    });
    deviceChipsContainer.appendChild(allDevChip);

    uniqueDevices.forEach((dev) => {
      const chip = document.createElement('button');
      chip.className = `filter-chip ${TabVaultFilterManager.filters.deviceId === dev.id ? 'active' : ''}`;
      chip.textContent = `${TabVaultDeviceManager.getPlatformIcon(dev.platform)} ${dev.name} (${dev.tabCount} tabs)`;
      chip.addEventListener('click', () => {
        TabVaultFilterManager.setDevice(dev.id);
        populateFilterModal();
      });
      deviceChipsContainer.appendChild(chip);
    });
  }

  // Load and Render stored sessions
  async function loadAndRenderSessions() {
    const data = await TabVaultAPI.storage.local.get(['savedSessions', 'totalTabsStashed']);
    allSessions = data.savedSessions || [];

    const activeSessions = allSessions.filter((s) => !s.isArchived);
    const totalActiveTabs = activeSessions.reduce((acc, s) => {
      const activeTabs = (s.tabs || []).filter((t) => !t.isPopped);
      return acc + activeTabs.length;
    }, 0);

    const estimatedRam = Math.round(totalActiveTabs * 120);
    ramSavedVal.textContent =
      estimatedRam > 1024
        ? `~${(estimatedRam / 1024).toFixed(1)} GB`
        : `~${estimatedRam} MB`;

    totalTabsVal.textContent = totalActiveTabs;
    totalSessionsVal.textContent = activeSessions.filter((s) =>
      (s.tabs || []).some((t) => !t.isPopped)
    ).length;

    renderFilteredSessions();
  }

  // Render Filtered Sessions
  function renderFilteredSessions() {
    if (document.querySelector('.popup-tab-btn[data-view="links"].active')) {
      return;
    }

    sessionsContainer.innerHTML = '';

    const hasFilters = TabVaultFilterManager.hasActiveFilters();
    if (hasFilters) {
      filterActiveDot.classList.remove('hidden');
      openFilterBtn.classList.add('active');
      activeFilterBar.classList.remove('hidden');

      const parts = [];
      if (TabVaultFilterManager.filters.domain) parts.push(`Site: ${TabVaultFilterManager.filters.domain}`);
      if (TabVaultFilterManager.filters.deviceId) {
        const d = TabVaultFilterManager.extractUniqueDevices(allSessions).find(x => x.id === TabVaultFilterManager.filters.deviceId);
        parts.push(`PC: ${d ? d.name : 'Selected PC'}`);
      }
      if (TabVaultFilterManager.filters.dateRange !== 'all') parts.push(`Date: ${TabVaultFilterManager.filters.dateRange}`);
      if (TabVaultFilterManager.filters.query) parts.push(`"${TabVaultFilterManager.filters.query}"`);
      filterBarTag.textContent = parts.join(' • ') || 'Active Filter';
    } else {
      filterActiveDot.classList.add('hidden');
      openFilterBtn.classList.remove('active');
      activeFilterBar.classList.add('hidden');
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
        sessionsContainer.appendChild(groupCard);
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
        emptyHeading.textContent = 'No Stashed Tabs Found';
        emptySubtext.textContent = 'Click "Stash All Window Tabs" or press Alt+S to stash your open tabs.';
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
        onRestashSession: handleRestashSession,
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
      sessionsContainer.appendChild(card);
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
      loadAndRenderSessions();
      TabVaultSyncEngine.onLocalDataChanged();
    }
  }

  // Archive Session
  async function handleArchiveSession(sessionId) {
    const data = await TabVaultAPI.storage.local.get(['savedSessions']);
    let sessions = data.savedSessions || [];
    const index = sessions.findIndex((s) => s.id === sessionId);
    if (index !== -1) {
      sessions[index].isArchived = true;
      sessions[index].archivedAt = Date.now();
      sessions[index].clientUpdatedAt = Date.now();
      await TabVaultAPI.storage.local.set({ savedSessions: sessions });
      loadAndRenderSessions();
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
      loadAndRenderSessions();
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
      const tabsToOpen = session.tabs || [];
      if (tabsToOpen.length > 0) {
        const urls = tabsToOpen.map((t) => t.url);
        if (inNewWindow) {
          await TabVaultAPI.windows.create({ url: urls });
        } else {
          for (const url of urls) {
            await TabVaultAPI.tabs.create({ url });
          }
        }

        tabsToOpen.forEach((t) => {
          t.isPopped = true;
          t.poppedAt = Date.now();
        });
        session.isRestored = true;
        session.restoredAt = Date.now();
        session.clientUpdatedAt = Date.now();

        await TabVaultAPI.storage.local.set({ savedSessions: sessions });
        loadAndRenderSessions();
        refreshOpenTabsData();
        TabVaultSyncEngine.onLocalDataChanged();
      }
    }
  }

  // Re-Stash Session (Move from Restored back to Active)
  async function handleRestashSession(sessionId) {
    const data = await TabVaultAPI.storage.local.get(['savedSessions']);
    let sessions = data.savedSessions || [];
    const sessionIndex = sessions.findIndex((s) => s.id === sessionId);
    if (sessionIndex !== -1) {
      const session = sessions[sessionIndex];
      session.isRestored = false;
      session.restoredAt = null;
      (session.tabs || []).forEach((t) => {
        t.isPopped = false;
        t.poppedAt = null;
      });
      session.clientUpdatedAt = Date.now();

      await TabVaultAPI.storage.local.set({ savedSessions: sessions });
      loadAndRenderSessions();
      TabVaultSyncEngine.onLocalDataChanged();
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
        loadAndRenderSessions();
        refreshOpenTabsData();
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
      loadAndRenderSessions();
    }
  }
});
