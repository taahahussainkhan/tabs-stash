/**
 * TabVault Live Sync (Silent Auto-Backup)
 *
 * Periodically snapshots a window's currently-open tabs into a session tagged
 * `sessionType: 'live'` WITHOUT closing the tabs. This gives silent, resumable
 * backups so a mistakenly closed window or a lost/crashed machine can still be
 * recovered from the last synced snapshot.
 *
 * Design notes:
 * - Local-first: snapshots are stored in `savedSessions` (same shape as stashes)
 *   so they reuse the existing Last-Write-Wins delta sync (upsert by stable id).
 * - MV3-safe: all state lives in storage, listeners are registered synchronously
 *   at service-worker startup via `registerListeners()`.
 * - Bounded growth: snapshots are throttled per window and pruned per device.
 */

(function (global) {
  const API = (typeof browser !== 'undefined' && browser.runtime) ? browser : chrome;

  const FLUSH_ALARM = 'tabvault_live_flush';
  const THROTTLE_MS = 60 * 1000;              // min interval between snapshots per window
  const MAX_TABS_PER_SNAPSHOT = 400;          // hard cap per window snapshot
  const MAX_LIVE_SESSIONS_PER_DEVICE = 25;    // retain newest N per device
  const SKIP_PROTOCOLS = ['chrome://', 'edge://', 'about:', 'chrome-extension://', 'brave://', 'vivaldi://', 'devtools://'];

  class TabVaultLiveSync {
    constructor() {
      this.flushing = false;
    }

    // ---- Settings ----

    async isEnabled() {
      const data = await TabVaultAPI.storage.local.get(['tabvault_live_sync_enabled']);
      return !!data.tabvault_live_sync_enabled;
    }

    async setEnabled(enabled) {
      await TabVaultAPI.storage.local.set({ tabvault_live_sync_enabled: !!enabled });
      if (enabled) {
        // Mark every current window dirty so the first flush captures them.
        await this.markAllWindowsDirty();
      }
      return !!enabled;
    }

    async getStatus() {
      const [enabled, dirty, liveSessions] = await Promise.all([
        this.isEnabled(),
        TabVaultAPI.storage.local.get(['tabvault_live_dirty_windows']),
        this.getLiveSessions(),
      ]);
      return {
        enabled,
        dirtyWindows: dirty.tabvault_live_dirty_windows || [],
        liveSessionCount: liveSessions.length,
      };
    }

    // ---- Dirty tracking (persisted so it survives worker restarts) ----

    async markDirty(windowId) {
      if (!windowId || windowId < 0) return;
      const data = await TabVaultAPI.storage.local.get(['tabvault_live_dirty_windows']);
      const set = new Set(data.tabvault_live_dirty_windows || []);
      if (set.has(windowId)) return; // already queued
      set.add(windowId);
      await TabVaultAPI.storage.local.set({
        tabvault_live_dirty_windows: Array.from(set),
      });
    }

    async clearDirty(windowId) {
      const data = await TabVaultAPI.storage.local.get(['tabvault_live_dirty_windows']);
      const set = new Set(data.tabvault_live_dirty_windows || []);
      if (!set.has(windowId)) return;
      set.delete(windowId);
      await TabVaultAPI.storage.local.set({
        tabvault_live_dirty_windows: Array.from(set),
      });
    }

    async markAllWindowsDirty() {
      try {
        const windows = await this.queryWindows();
        for (const win of windows) {
          if (win && win.id != null && !win.incognito) {
            await this.markDirty(win.id);
          }
        }
      } catch (e) {
        // ignore
      }
    }

    queryWindows() {
      return new Promise((resolve) => {
        try {
          API.windows.getAll({}, (wins) => resolve(wins || []));
        } catch (e) {
          resolve([]);
        }
      });
    }

    // ---- Snapshot building ----

    isInternalUrl(url) {
      if (!url) return true;
      return SKIP_PROTOCOLS.some((p) => url.startsWith(p));
    }

    async buildSnapshot(windowId) {
      const tabs = await TabVaultAPI.tabs.query({ windowId });
      const valid = tabs
        .filter((t) => t && t.url && t.url.startsWith('http') && !this.isInternalUrl(t.url))
        .slice(0, MAX_TABS_PER_SNAPSHOT);

      const timestamp = Date.now();
      return {
        tabs: valid.map((t) => ({
          id: 'tab_' + Math.random().toString(36).slice(2, 11),
          title: t.title || 'Untitled Tab',
          url: t.url,
          favIconUrl: t.favIconUrl || '',
          hostname: this.hostnameOf(t.url),
          pinned: !!t.pinned,
          isPopped: false,
          poppedAt: null,
          stashedAt: timestamp,
        })),
        timestamp,
        anyIncognito: tabs.some((t) => t.incognito),
      };
    }

    hostnameOf(url) {
      try {
        return new URL(url).hostname.replace(/^www\./, '');
      } catch (e) {
        return 'local';
      }
    }

    // ---- Flush engine ----

    async flush(options = { force: false }) {
      if (this.flushing) return { success: false, reason: 'already_flushing' };
      if (!(await this.isEnabled())) return { success: false, reason: 'disabled' };

      this.flushing = true;
      try {
        const data = await TabVaultAPI.storage.local.get([
          'tabvault_live_dirty_windows',
          'tabvault_live_last_snapshot',
          'savedSessions',
        ]);

        const dirty = data.tabvault_live_dirty_windows || [];
        const lastMap = data.tabvault_live_last_snapshot || {};
        let sessions = data.savedSessions || [];
        const now = Date.now();

        let changed = false;
        const remaining = [];

        for (const windowId of dirty) {
          const last = lastMap[windowId] || 0;
          if (!options.force && now - last < THROTTLE_MS) {
            remaining.push(windowId); // not due yet, keep queued
            continue;
          }

          const snap = await this.buildSnapshot(windowId);

          // If the window is gone (query returned nothing), drop it from the queue.
          if (snap.tabs.length === 0) {
            lastMap[windowId] = now;
            continue;
          }

          const deviceInfo = await this.getDeviceInfo(windowId);
          const sessionId = this.buildSessionId(deviceInfo.deviceId, windowId);
          const fingerprint = snap.tabs.map((t) => t.url).sort().join('|');
          const existing = sessions.find((s) => s.id === sessionId);
          const existingFingerprint = existing
            ? (existing.tabs || []).map((t) => t.url).sort().join('|')
            : null;

          lastMap[windowId] = now;

          if (existing && existingFingerprint === fingerprint) {
            // No material change: skip write to avoid network churn.
            continue;
          }

          const record = {
            id: sessionId,
            sessionType: 'live',
            title: `Live • ${deviceInfo.deviceName || 'PC'} • ${snap.tabs.length} tabs`,
            timestamp: snap.timestamp,
            tags: ['auto-sync'],
            isPinned: false,
            isArchived: false,
            tabs: snap.tabs,
            deviceInfo,
            clientUpdatedAt: snap.timestamp,
          };

          if (existing) {
            const idx = sessions.findIndex((s) => s.id === sessionId);
            sessions[idx] = { ...existing, ...record };
          } else {
            sessions.unshift(record);
          }
          changed = true;
        }

        sessions = this.pruneLiveSessions(sessions);

        await TabVaultAPI.storage.local.set({
          savedSessions: sessions,
          tabvault_live_dirty_windows: options.force ? [] : remaining,
          tabvault_live_last_snapshot: lastMap,
        });

        if (changed && typeof TabVaultSyncEngine !== 'undefined') {
          TabVaultSyncEngine.onLocalDataChanged().catch(() => {});
        }

        return { success: true, changed };
      } catch (err) {
        console.warn('TabVault Live Sync flush notice:', err && err.message);
        return { success: false, error: err && err.message };
      } finally {
        this.flushing = false;
      }
    }

    buildSessionId(deviceId, windowId) {
      return `live_${deviceId || 'local'}_${windowId}`;
    }

    async getDeviceInfo(windowId) {
      if (typeof TabVaultDeviceManager !== 'undefined') {
        try {
          return await TabVaultDeviceManager.getDeviceInfo(windowId);
        } catch (e) { /* fall through */ }
      }
      return { deviceId: 'local', deviceName: 'My PC', platform: 'PC', browser: 'Browser', windowId };
    }

    // Keep only the newest MAX_LIVE_SESSIONS_PER_DEVICE live sessions per device.
    pruneLiveSessions(sessions) {
      const byDevice = {};
      const result = [];
      for (const s of sessions) {
        if (s.sessionType !== 'live') {
          result.push(s);
          continue;
        }
        const dev = (s.deviceInfo && s.deviceInfo.deviceId) || 'local';
        (byDevice[dev] = byDevice[dev] || []).push(s);
      }
      for (const dev of Object.keys(byDevice)) {
        const list = byDevice[dev].sort(
          (a, b) => (b.clientUpdatedAt || 0) - (a.clientUpdatedAt || 0)
        );
        result.push(...list.slice(0, MAX_LIVE_SESSIONS_PER_DEVICE));
      }
      return result;
    }

    async getLiveSessions() {
      const data = await TabVaultAPI.storage.local.get(['savedSessions']);
      return (data.savedSessions || []).filter((s) => s.sessionType === 'live');
    }

    // ---- Listener wiring (call at service-worker top level) ----

    registerListeners() {
      if (!API || !API.tabs) return;

      const onTabChange = (tabId, changeInfo, tab) => {
        if (changeInfo.status === 'complete' || changeInfo.url || changeInfo.title != null) {
          this.markDirty(tab && tab.windowId != null ? tab.windowId : null);
        }
      };

      API.tabs.onUpdated.addListener(onTabChange);
      API.tabs.onRemoved.addListener((tabId, removeInfo) => {
        this.markDirty(removeInfo && removeInfo.windowId);
      });
      API.tabs.onCreated.addListener((tab) => {
        this.markDirty(tab && tab.windowId);
      });

      if (API.windows && API.windows.onCreated) {
        API.windows.onCreated.addListener((win) => this.markDirty(win && win.id));
        API.windows.onRemoved.addListener((windowId) => this.clearDirty(windowId));
      }

      if (API.runtime && API.runtime.onStartup) {
        API.runtime.onStartup.addListener(() => {
          this.markAllWindowsDirty();
        });
      }
    }

    ensureAlarm() {
      if (API.alarms) {
        API.alarms.create(FLUSH_ALARM, { periodInMinutes: 1 });
      }
    }

    handleAlarm(alarm) {
      if (alarm && alarm.name === FLUSH_ALARM) {
        this.flush().catch(() => {});
        return true;
      }
      return false;
    }
  }

  global.TabVaultLiveSync = new TabVaultLiveSync();
  global.TABVAULT_LIVE_FLUSH_ALARM = FLUSH_ALARM;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
