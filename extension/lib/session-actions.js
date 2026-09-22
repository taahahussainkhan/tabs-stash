/**
 * TabVault Session Actions (Modular)
 * Standardized actions for session mutations, state persistence, and sync propagation.
 */

(function (global) {
  class TabVaultSessionActions {
    /**
     * Rename a session by ID
     */
    static async renameSession(sessionId, newTitle) {
      const data = await TabVaultAPI.storage.local.get(['savedSessions']);
      const sessions = data.savedSessions || [];
      const index = sessions.findIndex((s) => s.id === sessionId);
      if (index !== -1) {
        sessions[index].title = newTitle;
        sessions[index].clientUpdatedAt = Date.now();
        await TabVaultAPI.storage.local.set({ savedSessions: sessions });
        if (typeof TabVaultSyncEngine !== 'undefined') {
          TabVaultSyncEngine.onLocalDataChanged();
        }
      }
      return sessions;
    }

    /**
     * Toggle pinned status of a session
     */
    static async togglePin(sessionId) {
      const data = await TabVaultAPI.storage.local.get(['savedSessions']);
      const sessions = data.savedSessions || [];
      const index = sessions.findIndex((s) => s.id === sessionId);
      if (index !== -1) {
        sessions[index].isPinned = !sessions[index].isPinned;
        sessions[index].clientUpdatedAt = Date.now();
        await TabVaultAPI.storage.local.set({ savedSessions: sessions });
        if (typeof TabVaultSyncEngine !== 'undefined') {
          TabVaultSyncEngine.onLocalDataChanged();
        }
      }
      return sessions;
    }

    /**
     * Archive a session
     */
    static async archiveSession(sessionId) {
      const data = await TabVaultAPI.storage.local.get(['savedSessions']);
      const sessions = data.savedSessions || [];
      const index = sessions.findIndex((s) => s.id === sessionId);
      if (index !== -1) {
        sessions[index].isArchived = true;
        sessions[index].archivedAt = Date.now();
        sessions[index].clientUpdatedAt = Date.now();
        await TabVaultAPI.storage.local.set({ savedSessions: sessions });
        if (typeof TabVaultSyncEngine !== 'undefined') {
          TabVaultSyncEngine.onLocalDataChanged();
        }
      }
      return sessions;
    }

    /**
     * Unarchive a session
     */
    static async unarchiveSession(sessionId) {
      const data = await TabVaultAPI.storage.local.get(['savedSessions']);
      const sessions = data.savedSessions || [];
      const index = sessions.findIndex((s) => s.id === sessionId);
      if (index !== -1) {
        sessions[index].isArchived = false;
        sessions[index].archivedAt = null;
        sessions[index].clientUpdatedAt = Date.now();
        await TabVaultAPI.storage.local.set({ savedSessions: sessions });
        if (typeof TabVaultSyncEngine !== 'undefined') {
          TabVaultSyncEngine.onLocalDataChanged();
        }
      }
      return sessions;
    }

    /**
     * Restore all tabs in a session (current window or new window)
     */
    static async restoreSession(sessionId, inNewWindow = false) {
      const data = await TabVaultAPI.storage.local.get(['savedSessions']);
      const sessions = data.savedSessions || [];
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
          if (typeof TabVaultSyncEngine !== 'undefined') {
            TabVaultSyncEngine.onLocalDataChanged();
          }
        }
      }
      return sessions;
    }

    /**
     * Re-stash a restored session back to active status
     */
    static async restashSession(sessionId) {
      const data = await TabVaultAPI.storage.local.get(['savedSessions']);
      const sessions = data.savedSessions || [];
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
        if (typeof TabVaultSyncEngine !== 'undefined') {
          TabVaultSyncEngine.onLocalDataChanged();
        }
      }
      return sessions;
    }

    /**
     * Pop a single tab from a session
     */
    static async popTab(sessionId, tabId) {
      const data = await TabVaultAPI.storage.local.get(['savedSessions']);
      const sessions = data.savedSessions || [];
      const sessionIndex = sessions.findIndex((s) => s.id === sessionId);
      if (sessionIndex !== -1) {
        const tab = (sessions[sessionIndex].tabs || []).find((t) => t.id === tabId);
        if (tab) {
          tab.isPopped = true;
          tab.poppedAt = Date.now();
          sessions[sessionIndex].clientUpdatedAt = Date.now();

          await TabVaultAPI.storage.local.set({ savedSessions: sessions });
          if (typeof TabVaultSyncEngine !== 'undefined') {
            TabVaultSyncEngine.onLocalDataChanged();
          }
        }
      }
      return sessions;
    }

    /**
     * Delete a single tab from a session
     */
    static async deleteTab(sessionId, tabId) {
      const data = await TabVaultAPI.storage.local.get(['savedSessions']);
      const sessions = data.savedSessions || [];
      const sessionIndex = sessions.findIndex((s) => s.id === sessionId);
      if (sessionIndex !== -1) {
        sessions[sessionIndex].tabs = (sessions[sessionIndex].tabs || []).filter(
          (t) => t.id !== tabId
        );
        sessions[sessionIndex].clientUpdatedAt = Date.now();

        if (sessions[sessionIndex].tabs.length === 0) {
          sessions[sessionIndex].isArchived = true;
          sessions[sessionIndex].archivedAt = Date.now();
        }

        await TabVaultAPI.storage.local.set({ savedSessions: sessions });
        if (typeof TabVaultSyncEngine !== 'undefined') {
          TabVaultSyncEngine.onLocalDataChanged();
        }
      }
      return sessions;
    }

    /**
     * Update and persist custom card dimensions for a session
     */
    static async updateDimensions(sessionId, width, height) {
      const data = await TabVaultAPI.storage.local.get(['savedSessions']);
      const sessions = data.savedSessions || [];
      const session = sessions.find((s) => s.id === sessionId);
      if (session) {
        session.customWidth = Math.round(width);
        session.customHeight = Math.round(height);
        session.clientUpdatedAt = Date.now();
        await TabVaultAPI.storage.local.set({ savedSessions: sessions });
      }
      return sessions;
    }
  }

  global.TabVaultSessionActions = TabVaultSessionActions;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
