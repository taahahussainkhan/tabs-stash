import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

/**
 * The signed-in account, persisted on device.
 *
 * One module-level store (not React state) so non-component code - the HTTP
 * client, the offline sync queue - can read and rotate tokens without prop
 * drilling. Components subscribe through useSession().
 */
export interface Session {
  serverUrl: string;
  email: string;
  accessToken: string;
  refreshToken: string;
}

export const DEFAULT_SERVER_URL =
  'https://pdh9ryeacb.execute-api.ap-south-1.amazonaws.com/api/v1';

const STORAGE_KEY = 'lore:session:v2';
const LEGACY_KEY = 'medalog:settings:v1';

const EMPTY: Session = {
  serverUrl: DEFAULT_SERVER_URL,
  email: '',
  accessToken: '',
  refreshToken: '',
};

let current: Session = EMPTY;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach(fn => fn());
}

export function getSession(): Session {
  return current;
}

export function isSignedIn(s: Session = current): boolean {
  return Boolean(s.accessToken);
}

export async function loadSession(): Promise<Session> {
  try {
    const raw = (await AsyncStorage.getItem(STORAGE_KEY)) ?? (await AsyncStorage.getItem(LEGACY_KEY));
    if (!raw) return current;
    current = { ...EMPTY, ...(JSON.parse(raw) as Partial<Session>) };
  } catch {
    current = EMPTY;
  }
  emit();
  return current;
}

export async function saveSession(next: Session): Promise<void> {
  current = next;
  emit();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export async function patchSession(patch: Partial<Session>): Promise<Session> {
  const next = { ...current, ...patch };
  await saveSession(next);
  return next;
}

export async function clearSession(): Promise<void> {
  const serverUrl = current.serverUrl;
  await saveSession({ ...EMPTY, serverUrl });
}

export function subscribeSession(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Subscribe a component to the session store. */
export function useSession(): Session {
  return useSyncExternalStore(subscribeSession, getSession, getSession);
}
