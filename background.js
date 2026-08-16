// TabVault Background Worker (Manifest V3 Cross-Browser)

try {
  importScripts('lib/browser-adapter.js', 'lib/device-manager.js', 'lib/api-client.js', 'lib/sync-engine.js');
} catch (e) {
  console.warn('TabVault: importScripts skipped or running in module environment', e);
}

// 1. Setup Context Menus and Periodic Sync on Installation
chrome.runtime.onInstalled.addListener(() => {
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
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "stash_all_tabs") {
    stashCurrentWindowTabs({ exceptCurrent: false });
  } else if (info.menuItemId === "stash_except_current") {
    stashCurrentWindowTabs({ exceptCurrent: true });
  } else if (info.menuItemId === "open_dashboard") {
    openDashboard();
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

// Helper: Core Stash Logic (Local-first with optional auto-sync)
async function stashCurrentWindowTabs(options = { exceptCurrent: false }) {
  try {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const currentTab = tabs.find(t => t.active);

    const tabsToSave = options.exceptCurrent 
      ? tabs.filter(t => t.id !== (currentTab ? currentTab.id : -1))
      : tabs;

    // Skip if no valid tabs to stash
    if (!tabsToSave.length) return;

    // Filter and sanitize tab info
    const now = Date.now();
    const formattedTabs = tabsToSave.map(tab => {
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
        stashedAt: now
      };
    });

    // Fetch device metadata
    let deviceInfo = { deviceName: 'My PC', platform: 'PC', browser: 'Browser', windowId: 1 };
    if (typeof TabVaultDeviceManager !== 'undefined') {
      try {
        deviceInfo = await TabVaultDeviceManager.getDeviceInfo(currentTab ? currentTab.windowId : 1);
      } catch (e) {}
    }

    // Create session object
    const newSession = {
      id: 'session_' + now + '_' + Math.random().toString(36).substr(2, 5),
      title: `Stash Session (${formattedTabs.length} tabs)`,
      timestamp: now,
      tags: [],
      isPinned: false,
      tabs: formattedTabs,
      deviceInfo: deviceInfo,
      clientUpdatedAt: now
    };

    // Save to local storage first (0ms latency)
    const data = await chrome.storage.local.get(['savedSessions', 'totalTabsStashed']);
    const savedSessions = data.savedSessions || [];
    const currentTotal = data.totalTabsStashed || 0;

    savedSessions.unshift(newSession);

    await chrome.storage.local.set({
      savedSessions: savedSessions,
      totalTabsStashed: currentTotal + formattedTabs.length
    });

    // If closing all tabs in window, open dashboard first to prevent browser window close
    const tabIdsToRemove = tabsToSave.map(t => t.id);
    
    if (!options.exceptCurrent) {
      const dashboardUrl = chrome.runtime.getURL("dashboard.html");
      await chrome.tabs.create({ url: dashboardUrl, active: true });
    }

    // Remove the stashed tabs from the browser window
    await chrome.tabs.remove(tabIdsToRemove);

    // If user is authenticated, trigger background sync
    if (typeof TabVaultSyncEngine !== 'undefined') {
      TabVaultSyncEngine.onLocalDataChanged().catch(() => {});
    }

  } catch (error) {
    console.error("TabVault Stash Error:", error);
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
