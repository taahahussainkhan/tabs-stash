import { api } from '../app/api';

export interface TabItem {
  id?: string;
  title: string;
  url: string;
  favIconUrl?: string;
  hostname?: string;
  pinned?: boolean;
  isPopped?: boolean;
  stashedAt?: number;
}

export interface DeviceInfo {
  deviceId?: string;
  deviceName?: string;
  platform?: string;
  browser?: string;
  windowId?: number | string;
}

export interface StashedSession {
  id: string;
  sessionId?: string;
  title: string;
  timestamp: number;
  isPinned: boolean;
  isArchived?: boolean;
  tags?: string[];
  tabs: TabItem[];
  deviceInfo?: DeviceInfo;
  clientUpdatedAt?: number;
  serverUpdatedAt?: number;
}

export interface SavedLink {
  id: string;
  url: string;
  title: string;
  hostname: string;
  pageUrl?: string;
  savedAt: number;
  isRead: boolean;
  readAt?: number | null;
  tags?: string[];
  updatedAt?: number;
}

const LOCAL_LINKS_KEY = 'tabvault_saved_links';

export const tabService = {
  // --- Sessions ---
  async getSessions(limit = 100, skip = 0): Promise<StashedSession[]> {
    try {
      const res = await api.get('/sync/sessions', {
        params: { limit, skip },
      });
      const payload = res.data;
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      if (Array.isArray(payload?.data?.sessions)) return payload.data.sessions;
      return [];
    } catch {
      // Fallback local storage if offline / not logged in
      const local = localStorage.getItem('tabvault_saved_sessions');
      return local ? JSON.parse(local) : [];
    }
  },

  async deleteSession(sessionId: string): Promise<void> {
    try {
      await api.delete(`/sync/sessions/${sessionId}`);
    } catch {
      // Fallback local storage
      const local = localStorage.getItem('tabvault_saved_sessions');
      if (local) {
        const sessions: StashedSession[] = JSON.parse(local);
        localStorage.setItem(
          'tabvault_saved_sessions',
          JSON.stringify(sessions.filter((s) => s.id !== sessionId && s.sessionId !== sessionId))
        );
      }
    }
  },

  async clearAll(): Promise<void> {
    try {
      await api.delete('/sync/clear-all');
    } catch {
      localStorage.removeItem('tabvault_saved_sessions');
      localStorage.removeItem(LOCAL_LINKS_KEY);
    }
  },

  // --- Saved Links / Reading Shelf ---
  async getSavedLinks(): Promise<SavedLink[]> {
    try {
      const res = await api.get('/sync/links');
      const payload = res.data;
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      return [];
    } catch {
      // Fallback local storage
      const local = localStorage.getItem(LOCAL_LINKS_KEY);
      return local ? JSON.parse(local) : [];
    }
  },

  async saveLink(linkData: { url: string; title?: string; tags?: string[] }): Promise<SavedLink> {
    let hostname = 'link';
    try {
      if (linkData.url.startsWith('http')) {
        hostname = new URL(linkData.url).hostname.replace(/^www\./, '');
      }
    } catch {}

    const newLink: SavedLink = {
      id: 'link_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      url: linkData.url,
      title: linkData.title || hostname || 'Saved Link',
      hostname,
      savedAt: Date.now(),
      isRead: false,
      tags: linkData.tags || [],
      updatedAt: Date.now(),
    };

    try {
      await api.post('/sync/links', newLink);
    } catch {
      // Fallback local storage
      const current = await this.getSavedLinks();
      current.unshift(newLink);
      localStorage.setItem(LOCAL_LINKS_KEY, JSON.stringify(current));
    }

    return newLink;
  },

  async toggleLinkRead(linkId: string, isRead: boolean): Promise<void> {
    try {
      await api.patch(`/sync/links/${linkId}`, { isRead });
    } catch {
      const current = await this.getSavedLinks();
      const target = current.find((l) => l.id === linkId);
      if (target) {
        target.isRead = isRead;
        target.readAt = isRead ? Date.now() : null;
        target.updatedAt = Date.now();
        localStorage.setItem(LOCAL_LINKS_KEY, JSON.stringify(current));
      }
    }
  },

  async deleteLink(linkId: string): Promise<void> {
    try {
      await api.delete(`/sync/links/${linkId}`);
    } catch {
      const current = await this.getSavedLinks();
      const filtered = current.filter((l) => l.id !== linkId);
      localStorage.setItem(LOCAL_LINKS_KEY, JSON.stringify(filtered));
    }
  },

  async convertLinksToSession(linkIds: string[]): Promise<void> {
    const links = await this.getSavedLinks();
    const targetLinks = linkIds.length > 0
      ? links.filter((l) => linkIds.includes(l.id))
      : links.filter((l) => !l.isRead);

    if (!targetLinks.length) return;

    const formattedTabs: TabItem[] = targetLinks.map((l) => ({
      id: 'tab_' + Math.random().toString(36).substr(2, 9),
      title: l.title || 'Saved Link',
      url: l.url,
      favIconUrl: `https://www.google.com/s2/favicons?domain=${l.hostname}&sz=32`,
      hostname: l.hostname,
      pinned: false,
      isPopped: false,
      stashedAt: Date.now(),
    }));

    const newSession: StashedSession = {
      id: 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      title: `Saved Links Session (${formattedTabs.length} links)`,
      timestamp: Date.now(),
      isPinned: false,
      tags: ['links-converted'],
      tabs: formattedTabs,
      deviceInfo: {
        deviceName: 'Web App',
        platform: 'Web',
        browser: 'Browser',
      },
    };

    try {
      await api.post('/sync/sessions', newSession);
    } catch {
      const sessions = await this.getSessions();
      sessions.unshift(newSession);
      localStorage.setItem('tabvault_saved_sessions', JSON.stringify(sessions));
    }

    // Mark converted links as read
    const idSet = new Set(targetLinks.map((l) => l.id));
    links.forEach((l) => {
      if (idSet.has(l.id)) {
        l.isRead = true;
        l.readAt = Date.now();
      }
    });
    localStorage.setItem(LOCAL_LINKS_KEY, JSON.stringify(links));
  },
};
