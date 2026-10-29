/**
 * Tab Stash models as they arrive from the API.
 *
 * Mobile is a viewer for this data: sessions and cards are created by the
 * extension and the web app, so the shapes here mirror `/sync/*` exactly and
 * nothing in this feature writes new items.
 */

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

export type TabSegment = 'sessions' | 'links' | 'cards';

/** Sessions may be stored under either id field depending on the writer. */
export function sessionKey(session: StashedSession): string {
  return session.id || session.sessionId || `${session.timestamp}`;
}
