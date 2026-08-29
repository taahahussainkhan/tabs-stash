/**
 * TabVault Sync Engine
 * Manages offline-first caching, delta sync protocol, Last-Write-Wins merges, and background sync.
 */

(function (global) {
  class TabVaultSyncEngine {
    constructor() {
      this.status = 'idle'; // 'idle' | 'syncing' | 'synced' | 'error' | 'offline'
      this.lastError = null;
      this.syncListeners = [];
    }

    /**
     * Subscribe to sync state changes
     */
    onSyncStatusChange(callback) {
      this.syncListeners.push(callback);
    }

    notifyStatus(status, error = null) {
      this.status = status;
      this.lastError = error;
      this.syncListeners.forEach((cb) => cb({ status, error }));

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('tabvault:sync-status', {
            detail: { status, error },
          })
        );
      }
    }

    /**
     * Get current sync status
     */
    async getStatus() {
      const isAuth = await TabVaultApiClient.isAuthenticated();
      const user = await TabVaultApiClient.getUser();
      const storage = await TabVaultAPI.storage.local.get(['tabvault_last_sync']);

      return {
        isAuthenticated: isAuth,
        user,
        status: this.status,
        lastSyncTimestamp: storage.tabvault_last_sync || 0,
        lastError: this.lastError,
      };
    }

    /**
     * Perform bidirectional Delta Sync
     */
    async syncNow() {
      const isAuth = await TabVaultApiClient.isAuthenticated();
      if (!isAuth) {
        this.notifyStatus('idle');
        return { success: false, reason: 'not_authenticated' };
      }

      this.notifyStatus('syncing');

      try {
        const data = await TabVaultAPI.storage.local.get([
          'savedSessions',
          'tabvault_last_sync',
          'tabvault_pending_deletions',
        ]);

        const localSessions = data.savedSessions || [];
        const lastSync = data.tabvault_last_sync || 0;
        const pendingDeletions = data.tabvault_pending_deletions || [];

        // Format client changes payload
        const clientChanges = localSessions.map((session) => ({
          id: session.id,
          title: session.title || 'Untitled Session',
          timestamp: session.timestamp || Date.now(),
          isPinned: !!session.isPinned,
          isArchived: !!session.isArchived,
          archivedAt: session.archivedAt || null,
          isRestored: !!session.isRestored,
          restoredAt: session.restoredAt || null,
          tags: session.tags || [],
          tabs: (session.tabs || []).map((t) => ({
            id: t.id,
            title: t.title || 'Untitled Tab',
            url: t.url || 'about:blank',
            favIconUrl: t.favIconUrl || '',
            hostname: t.hostname || 'local',
            pinned: !!t.pinned,
            isPopped: !!t.isPopped,
            poppedAt: t.poppedAt || null,
            stashedAt: t.stashedAt || Date.now(),
          })),
          deviceInfo: session.deviceInfo || {},
          clientUpdatedAt: session.clientUpdatedAt || session.timestamp || Date.now(),
          deletedAt: null,
        }));

        // Append soft-deleted sessions
        pendingDeletions.forEach((del) => {
          clientChanges.push({
            id: del.id,
            title: 'Deleted Session',
            timestamp: del.deletedAt,
            isPinned: false,
            isArchived: false,
            isRestored: false,
            tags: [],
            tabs: [],
            clientUpdatedAt: del.deletedAt,
            deletedAt: del.deletedAt,
          });
        });

        // Execute API request
        const res = await TabVaultApiClient.deltaSync(lastSync, clientChanges);
        const { serverChanges, newSyncTimestamp } = res.data;

        // Merge server changes into local storage
        let mergedSessions = [...localSessions];

        if (serverChanges && serverChanges.length > 0) {
          serverChanges.forEach((remoteSession) => {
            if (remoteSession.deletedAt) {
              // Remote delete
              mergedSessions = mergedSessions.filter((s) => s.id !== remoteSession.id);
            } else {
              const existingIdx = mergedSessions.findIndex((s) => s.id === remoteSession.id);
              if (existingIdx !== -1) {
                // If local has newer updates (e.g. just restored or popped), preserve local
                const localUpdated = mergedSessions[existingIdx].clientUpdatedAt || 0;
                const remoteUpdated = remoteSession.clientUpdatedAt || remoteSession.serverUpdatedAt || 0;
                if (localUpdated >= remoteUpdated) {
                  // Keep local changes
                } else {
                  mergedSessions[existingIdx] = {
                    ...mergedSessions[existingIdx],
                    ...remoteSession,
                  };
                }
              } else {
                // Add new remote session
                mergedSessions.unshift(remoteSession);
              }
            }
          });
        }

        // Save updated merged state
        await TabVaultAPI.storage.local.set({
          savedSessions: mergedSessions,
          tabvault_last_sync: newSyncTimestamp,
          tabvault_pending_deletions: [],
        });

        this.notifyStatus('synced');

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('tabvault:data-updated'));
        }

        return { success: true, count: mergedSessions.length };
      } catch (error) {
        console.error('TabVault Sync Error:', error);
        this.notifyStatus('error', error.message || 'Sync failed.');
        return { success: false, error: error.message };
      }
    }

    /**
     * Record a session deletion for sync propagation
     */
    async recordSessionDelete(sessionId) {
      const data = await TabVaultAPI.storage.local.get(['tabvault_pending_deletions']);
      const pending = data.tabvault_pending_deletions || [];

      pending.push({
        id: sessionId,
        deletedAt: Date.now(),
      });

      await TabVaultAPI.storage.local.set({ tabvault_pending_deletions: pending });

      // Trigger background sync if logged in
      const isAuth = await TabVaultApiClient.isAuthenticated();
      if (isAuth) {
        this.syncNow().catch(() => {});
      }
    }

    /**
     * Trigger sync on session changes if user is logged in
     */
    async onLocalDataChanged() {
      const isAuth = await TabVaultApiClient.isAuthenticated();
      if (isAuth) {
        this.syncNow().catch(() => {});
      }
    }
  }

  global.TabVaultSyncEngine = new TabVaultSyncEngine();
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
