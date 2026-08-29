// TabVault Background Worker (Manifest V3 Cross-Browser)

try {
  importScripts(
    'lib/browser-adapter.js',
    'lib/device-manager.js',
    'lib/api-client.js',
    'lib/sync-engine.js',
    'lib/links-manager.js'
  );
} catch (e) {
  console.warn('TabVault: importScripts skipped or running in module environment', e);
}

// 1. Setup Context Menus and Periodic Sync on Installation
chrome.runtime.onInstalled.addListener(() => {
  // Existing Context Menus
  chrome.contextMenus.create({
    id: "stash_all_tabs",
    title: "Stash All Tabs in Active Window",
    contexts: ["action", "page"]
  });

  chrome.contextMenus.create({
    id: "stash_except_current",
    title: "Stash All Tabs Except Current",
    contexts: ["action", "page"]
  });

  // New Directional Context Menus
  chrome.contextMenus.create({
    id: "stash_tabs_to_right",
    title: "Stash Tabs to the Right",
    contexts: ["action", "page"]
  });

  chrome.contextMenus.create({
    id: "stash_tabs_to_left",
    title: "Stash Tabs to the Left",
    contexts: ["action", "page"]
  });

  // New Domain-Specific Context Menu
  chrome.contextMenus.create({
    id: "stash_domain_tabs",
    title: "Stash All Tabs From This Domain",
    contexts: ["action", "page"]
  });

  // New Right-Click Link Saver Context Menu
  chrome.contextMenus.create({
    id: "save_link_to_tabvault",
    title: "Save Link to TabVault Reading List",
    contexts: ["link"]
  });

  chrome.contextMenus.create({
    id: "open_dashboard",
    title: "Open TabVault Dashboard",
    contexts: ["action", "page"]
  });

  // Setup periodic background sync alarm (runs every 10 minutes)
  if (chrome.alarms) {
    chrome.alarms.create("tabvault_periodic_sync", {
      periodInMinutes: 10
    });
  }
});

// 2. Alarm Listener for Periodic Background Sync
if (chrome.alarms) {
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "tabvault_periodic_sync") {
      if (typeof TabVaultSyncEngine !== 'undefined') {
        TabVaultSyncEngine.syncNow().catch((err) => {
          console.log("TabVault Background Sync Check:", err.message);
        });
      }
    }
  });
}

// 3. Context Menu Handler
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  try {
    if (info.menuItemId === "stash_all_tabs") {
      await stashCurrentWindowTabs({ exceptCurrent: false });
    } else if (info.menuItemId === "stash_except_current") {
      await stashCurrentWindowTabs({ exceptCurrent: true });
    } else if (info.menuItemId === "stash_tabs_to_right") {
      await stashDirectionalTabs('right');
    } else if (info.menuItemId === "stash_tabs_to_left") {
      await stashDirectionalTabs('left');
    } else if (info.menuItemId === "stash_domain_tabs") {
      if (tab && tab.url) {
        try {
          const domain = new URL(tab.url).hostname.replace(/^www\./, '');
          await stashDomainTabs(domain);
        } catch (e) {
          console.error("TabVault domain parse error:", e);
        }
      }
    } else if (info.menuItemId === "save_link_to_tabvault") {
      if (info.linkUrl) {
        await saveLinkFromContext(info.linkUrl, info.pageUrl, info.selectionText);
      }
    } else if (info.menuItemId === "open_dashboard") {
      openDashboard();
    }
  } catch (err) {
    console.error("TabVault context menu click error:", err);
  }
});

// 4. Keyboard Commands Handler
chrome.commands.onCommand.addListener((command) => {
  if (command === "stash_all_tabs") {
    stashCurrentWindowTabs({ exceptCurrent: false });
  } else if (command === "open_dashboard") {
    openDashboard();
  }
});

// Helper: Open Dashboard in a tab
function openDashboard() {
  const dashboardUrl = chrome.runtime.getURL("dashboard.html");
  chrome.tabs.query({ url: dashboardUrl }, (tabs) => {
    if (tabs && tabs.length > 0) {
      chrome.tabs.update(tabs[0].id, { active: true });
    } else {
      chrome.tabs.create({ url: dashboardUrl });
    }
  });
}

// Helper: Format tab objects consistently
function formatTabList(tabsToSave, timestamp) {
  return tabsToSave.map((tab) => {
    let hostname = "local";
    try {
      if (tab.url && tab.url.startsWith("http")) {
        hostname = new URL(tab.url).hostname.replace(/^www\./, "");
      }
    } catch (e) {}

    return {
      id: 'tab_' + Math.random().toString(36).substr(2, 9),
      title: tab.title || "Untitled Tab",
      url: tab.url || "about:blank",
      favIconUrl: tab.favIconUrl || "",
      hostname: hostname,
      pinned: tab.pinned || false,
      isPopped: false,
      poppedAt: null,
      stashedAt: timestamp
    };
  });
}

// Helper: Save stashed session to storage
async function commitStashedSession(formattedTabs, sessionTitle, activeWindowId, shouldPreventWindowClose = false) {
  if (!formattedTabs.length) return null;

  const now = Date.now();
  let deviceInfo = { deviceName: 'My PC', platform: 'PC', browser: 'Browser', windowId: 1 };
  if (typeof TabVaultDeviceManager !== 'undefined') {
    try {
      deviceInfo = await TabVaultDeviceManager.getDeviceInfo(activeWindowId || 1);
    } catch (e) {}
  }

  const newSession = {
    id: 'session_' + now + '_' + Math.random().toString(36).substr(2, 5),
    title: sessionTitle || `Stash Session (${formattedTabs.length} tabs)`,
    timestamp: now,
    tags: [],
    isPinned: false,
    isArchived: false,
    tabs: formattedTabs,
    deviceInfo: deviceInfo,
    clientUpdatedAt: now
  };

  const data = await chrome.storage.local.get(['savedSessions', 'totalTabsStashed']);
  const savedSessions = data.savedSessions || [];
  const currentTotal = data.totalTabsStashed || 0;

  savedSessions.unshift(newSession);

  await chrome.storage.local.set({
    savedSessions: savedSessions,
    totalTabsStashed: currentTotal + formattedTabs.length
  });

  if (shouldPreventWindowClose) {
    const dashboardUrl = chrome.runtime.getURL("dashboard.html");
    await chrome.tabs.create({ url: dashboardUrl, active: true });
  }

  if (typeof TabVaultSyncEngine !== 'undefined') {
    TabVaultSyncEngine.onLocalDataChanged().catch(() => {});
  }

  return newSession;
}

// Helper: Core Stash Logic (Local-first with optional auto-sync)
async function stashCurrentWindowTabs(options = { exceptCurrent: false }) {
  try {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const currentTab = tabs.find(t => t.active);

    const tabsToSave = options.exceptCurrent 
      ? tabs.filter(t => t.id !== (currentTab ? currentTab.id : -1))
      : tabs;

    if (!tabsToSave.length) return;

    const now = Date.now();
    const formattedTabs = formatTabList(tabsToSave, now);
    const tabIdsToRemove = tabsToSave.map(t => t.id);

    // If closing all tabs in window, open dashboard first to prevent browser window closing completely
    const isClosingAll = !options.exceptCurrent || tabsToSave.length === tabs.length;
    await commitStashedSession(
      formattedTabs,
      options.title || `Stash Session (${formattedTabs.length} tabs)`,
      currentTab ? currentTab.windowId : 1,
      isClosingAll
    );

    await chrome.tabs.remove(tabIdsToRemove);
  } catch (error) {
    console.error("TabVault Stash Error:", error);
  }
}

// Helper: Stash selectively chosen tab IDs
async function stashSelectedTabs(tabIds = [], customTitle = '') {
  try {
    if (!tabIds || !tabIds.length) return { success: false, error: 'No tabs specified' };

    const windowTabs = await chrome.tabs.query({ currentWindow: true });
    const targetTabs = windowTabs.filter(t => tabIds.includes(t.id));

    if (!targetTabs.length) return { success: false, error: 'Target tabs not found in active window' };

    const now = Date.now();
    const formattedTabs = formatTabList(targetTabs, now);
    const tabIdsToRemove = targetTabs.map(t => t.id);
    const isClosingAll = targetTabs.length === windowTabs.length;

    await commitStashedSession(
      formattedTabs,
      customTitle || `Selected Tabs (${formattedTabs.length} tabs)`,
      targetTabs[0].windowId,
      isClosingAll
    );

    await chrome.tabs.remove(tabIdsToRemove);
    return { success: true, count: targetTabs.length };
  } catch (error) {
    console.error("TabVault Stash Selected Error:", error);
    return { success: false, error: error.message };
  }
}

// Helper: Stash all tabs matching a domain in current window
async function stashDomainTabs(domain) {
  try {
    if (!domain) return { success: false, error: 'Domain is required' };

    const cleanDomain = domain.toLowerCase().replace(/^www\./, '');
    const windowTabs = await chrome.tabs.query({ currentWindow: true });

    const matchingTabs = windowTabs.filter(tab => {
      try {
        if (!tab.url || !tab.url.startsWith('http')) return false;
        const host = new URL(tab.url).hostname.replace(/^www\./, '').toLowerCase();
        return host === cleanDomain || host.endsWith('.' + cleanDomain);
      } catch (e) {
        return false;
      }
    });

    if (!matchingTabs.length) return { success: false, error: `No open tabs found for ${cleanDomain}` };

    const now = Date.now();
    const formattedTabs = formatTabList(matchingTabs, now);
    const tabIdsToRemove = matchingTabs.map(t => t.id);
    const isClosingAll = matchingTabs.length === windowTabs.length;

    await commitStashedSession(
      formattedTabs,
      `Domain: ${cleanDomain} (${formattedTabs.length} tabs)`,
      matchingTabs[0].windowId,
      isClosingAll
    );

    await chrome.tabs.remove(tabIdsToRemove);
    return { success: true, count: matchingTabs.length };
  } catch (error) {
    console.error("TabVault Stash Domain Error:", error);
    return { success: false, error: error.message };
  }
}

// Helper: Stash tabs directionally (to the right or to the left of active tab)
async function stashDirectionalTabs(direction = 'right') {
  try {
    const windowTabs = await chrome.tabs.query({ currentWindow: true });
    if (!windowTabs.length) return { success: false, error: 'No tabs in window' };

    const activeTab = windowTabs.find(t => t.active);
    if (!activeTab) return { success: false, error: 'No active tab found' };

    const activeIndex = activeTab.index;
    const targetTabs = direction === 'right'
      ? windowTabs.filter(t => t.index > activeIndex)
      : windowTabs.filter(t => t.index < activeIndex);

    if (!targetTabs.length) {
      return { success: false, error: `No tabs found to the ${direction}` };
    }

    const now = Date.now();
    const formattedTabs = formatTabList(targetTabs, now);
    const tabIdsToRemove = targetTabs.map(t => t.id);

    const dirLabel = direction === 'right' ? 'Tabs to the Right' : 'Tabs to the Left';
    await commitStashedSession(
      formattedTabs,
      `${dirLabel} (${formattedTabs.length} tabs)`,
      activeTab.windowId,
      false // Never closes whole window because active tab remains open
    );

    await chrome.tabs.remove(tabIdsToRemove);
    return { success: true, count: targetTabs.length };
  } catch (error) {
    console.error("TabVault Stash Directional Error:", error);
    return { success: false, error: error.message };
  }
}

// Helper: Save link from right-click context menu
async function saveLinkFromContext(linkUrl, pageUrl = '', selectionText = '') {
  try {
    if (typeof TabVaultLinksManager !== 'undefined') {
      let title = selectionText || '';
      if (!title) {
        try {
          const u = new URL(linkUrl);
          title = u.hostname.replace(/^www\./, '') + (u.pathname !== '/' ? u.pathname : '');
        } catch (e) {
          title = linkUrl;
        }
      }

      await TabVaultLinksManager.saveLink({
        url: linkUrl,
        title: title,
        pageUrl: pageUrl
      });
      return { success: true };
    } else {
      // Fallback local storage write if library not bound
      const data = await chrome.storage.local.get(['savedLinks']);
      const links = data.savedLinks || [];
      const now = Date.now();
      let hostname = 'link';
      try {
        hostname = new URL(linkUrl).hostname.replace(/^www\./, '');
      } catch (e) {}

      links.unshift({
        id: 'link_' + now + '_' + Math.random().toString(36).substr(2, 6),
        url: linkUrl,
        title: selectionText || hostname || 'Saved Link',
        hostname: hostname,
        pageUrl: pageUrl || '',
        savedAt: now,
        isRead: false,
        readAt: null,
        tags: [],
        updatedAt: now
      });

      await chrome.storage.local.set({ savedLinks: links });
      return { success: true };
    }
  } catch (err) {
    console.error("TabVault Save Link Error:", err);
    return { success: false, error: err.message };
  }
}

// 5. Message listener from popup and dashboard
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "STASH_ALL_TABS") {
    stashCurrentWindowTabs({ exceptCurrent: false }).then(() => sendResponse({ success: true }));
    return true;
  } else if (request.action === "STASH_EXCEPT_CURRENT") {
    stashCurrentWindowTabs({ exceptCurrent: true }).then(() => sendResponse({ success: true }));
    return true;
  } else if (request.action === "STASH_SELECTED_TABS") {
    stashSelectedTabs(request.tabIds, request.title).then((res) => sendResponse(res));
    return true;
  } else if (request.action === "STASH_BY_DOMAIN") {
    stashDomainTabs(request.domain).then((res) => sendResponse(res));
    return true;
  } else if (request.action === "STASH_DIRECTIONAL") {
    stashDirectionalTabs(request.direction).then((res) => sendResponse(res));
    return true;
  } else if (request.action === "SAVE_LINK") {
    saveLinkFromContext(request.url, request.pageUrl, request.title).then((res) => sendResponse(res));
    return true;
  } else if (request.action === "OPEN_DASHBOARD") {
    openDashboard();
    sendResponse({ success: true });
    return true;
  } else if (request.action === "TRIGGER_SYNC") {
    if (typeof TabVaultSyncEngine !== 'undefined') {
      TabVaultSyncEngine.syncNow().then((res) => sendResponse(res));
      return true;
    }
    sendResponse({ success: false, reason: "sync_engine_not_found" });
    return true;
  }
});
