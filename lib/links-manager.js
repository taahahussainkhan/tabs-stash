/**
 * TabVault Links Manager (Modular)
 * Manages right-clicked saved links / reading list items separately from tab sessions.
 * Local-first storage with optional sync compatibility.
 */

(function (global) {
  class TabVaultLinksManager {
    /**
     * Get all saved links from local storage
     * @returns {Promise<Array>}
     */
    static async getLinks() {
      try {
        const data = await TabVaultAPI.storage.local.get(['savedLinks']);
        return data.savedLinks || [];
      } catch (err) {
        console.error('TabVaultLinksManager: Error getting links', err);
        return [];
      }
    }

    /**
     * Save a new link to the reading shelf
     * @param {Object} linkData
     * @returns {Promise<Object>} The saved link object
     */
    static async saveLink({ url, title, pageUrl, tags = [] }) {
      if (!url || typeof url !== 'string') {
        throw new Error('Valid URL is required to save link');
      }

      let hostname = 'link';
      try {
        if (url.startsWith('http')) {
          hostname = new URL(url).hostname.replace(/^www\./, '');
        }
      } catch (e) {}

      const now = Date.now();
      const newLink = {
        id: 'link_' + now + '_' + Math.random().toString(36).substr(2, 6),
        url: url.trim(),
        title: title && title.trim() ? title.trim() : (hostname || 'Saved Link'),
        hostname: hostname,
        pageUrl: pageUrl || '',
        savedAt: now,
        isRead: false,
        readAt: null,
        tags: Array.isArray(tags) ? tags : [],
        updatedAt: now,
      };

      const links = await this.getLinks();

      // Check if URL already exists; if so, update its timestamp to top
      const existingIdx = links.findIndex((l) => l.url === newLink.url);
      if (existingIdx !== -1) {
        links[existingIdx].savedAt = now;
        links[existingIdx].updatedAt = now;
        if (title) links[existingIdx].title = title.trim();
      } else {
        links.unshift(newLink);
      }

      await TabVaultAPI.storage.local.set({ savedLinks: links });
      this._emitChange();
      return newLink;
    }

    /**
     * Mark a link as read/unread
     * @param {string} linkId
     * @param {boolean} isRead
     */
    static async toggleRead(linkId, isRead) {
      const links = await this.getLinks();
      const link = links.find((l) => l.id === linkId);
      if (link) {
        link.isRead = typeof isRead === 'boolean' ? isRead : !link.isRead;
        link.readAt = link.isRead ? Date.now() : null;
        link.updatedAt = Date.now();
        await TabVaultAPI.storage.local.set({ savedLinks: links });
        this._emitChange();
      }
    }

    /**
     * Delete a saved link by ID
     * @param {string} linkId
     */
    static async deleteLink(linkId) {
      const links = await this.getLinks();
      const filtered = links.filter((l) => l.id !== linkId);
      await TabVaultAPI.storage.local.set({ savedLinks: filtered });
      this._emitChange();
    }

    /**
     * Clear all read links or clear all links
     * @param {boolean} onlyRead
     */
    static async clearLinks(onlyRead = false) {
      const links = await this.getLinks();
      const remaining = onlyRead ? links.filter((l) => !l.isRead) : [];
      await TabVaultAPI.storage.local.set({ savedLinks: remaining });
      this._emitChange();
    }

    /**
     * Convert selected saved links (or all unread links) into a Tab Session
     * @param {Array<string>} linkIds
     * @param {string} [customTitle]
     * @returns {Promise<Object>} created session
     */
    static async convertLinksToSession(linkIds = [], customTitle = '') {
      const links = await this.getLinks();
      const targetLinks = linkIds.length > 0
        ? links.filter((l) => linkIds.includes(l.id))
        : links.filter((l) => !l.isRead);

      if (!targetLinks.length) {
        throw new Error('No links selected to convert to session');
      }

      const now = Date.now();
      const formattedTabs = targetLinks.map((l) => ({
        id: 'tab_' + Math.random().toString(36).substr(2, 9),
        title: l.title || 'Saved Link',
        url: l.url || 'about:blank',
        favIconUrl: `https://www.google.com/s2/favicons?domain=${l.hostname}&sz=32`,
        hostname: l.hostname || 'link',
        pinned: false,
        isPopped: false,
        poppedAt: null,
        stashedAt: now,
      }));

      let deviceInfo = { deviceName: 'My PC', platform: 'PC', browser: 'Browser', windowId: 1 };
      if (typeof TabVaultDeviceManager !== 'undefined') {
        try {
          deviceInfo = await TabVaultDeviceManager.getDeviceInfo(1);
        } catch (e) {}
      }

      const newSession = {
        id: 'session_' + now + '_' + Math.random().toString(36).substr(2, 5),
        title: customTitle || `Saved Links Session (${formattedTabs.length} links)`,
        timestamp: now,
        tags: ['links-converted'],
        isPinned: false,
        isArchived: false,
        tabs: formattedTabs,
        deviceInfo: deviceInfo,
        clientUpdatedAt: now,
      };

      // Add to saved sessions
      const storage = await TabVaultAPI.storage.local.get(['savedSessions', 'totalTabsStashed']);
      const savedSessions = storage.savedSessions || [];
      const currentTotal = storage.totalTabsStashed || 0;

      savedSessions.unshift(newSession);

      await TabVaultAPI.storage.local.set({
        savedSessions: savedSessions,
        totalTabsStashed: currentTotal + formattedTabs.length,
      });

      // Mark converted links as read
      const convertedIds = new Set(targetLinks.map((l) => l.id));
      links.forEach((l) => {
        if (convertedIds.has(l.id)) {
          l.isRead = true;
          l.readAt = now;
        }
      });
      await TabVaultAPI.storage.local.set({ savedLinks: links });

      this._emitChange();

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tabvault:data-updated'));
      }

      return newSession;
    }

    /**
     * Broadcast change event across windows/views
     * @private
     */
    static _emitChange() {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tabvault:links-updated'));
      }
    }
  }

  global.TabVaultLinksManager = TabVaultLinksManager;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
