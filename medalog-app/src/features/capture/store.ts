import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import type { MediaType, QuickLog, QuickRecord } from './types';

/**
 * Offline-first capture state.
 *
 * A record or log is written to the device the instant the user taps - the
 * timestamp is the payload, so nothing may wait on the network. The server
 * copy is a best-effort replay of the pending flags below.
 */
const STORAGE_KEY = 'medalog:records:v1';

let records: QuickRecord[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach(fn => fn());
}

export function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getRecords(): QuickRecord[] {
  return records;
}

export async function loadRecords(): Promise<QuickRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as QuickRecord[]) : [];
    records = Array.isArray(parsed) ? parsed : [];
  } catch {
    records = [];
  }
  emit();
  return records;
}

export async function setRecords(next: QuickRecord[]): Promise<void> {
  records = next;
  emit();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

/** Subscribe/hydrate the record list. */
export function useRecords(): QuickRecord[] {
  return useSyncExternalStore(
    fn => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    getRecords,
    getRecords
  );
}

export function useRecord(id: string): QuickRecord | undefined {
  return useRecords().find(r => r.id === id);
}

/* --------------------------------------------------------------- mutations */

export function newRecord(mediaType: MediaType, title: string): QuickRecord {
  const now = Date.now();
  return {
    id: uuid(),
    mediaType,
    title: title.trim(),
    status: 'active',
    createdAt: now,
    updatedAt: now,
    logs: [],
    synced: false,
  };
}

export function newLog(note: string): QuickLog {
  return { id: uuid(), note: note.trim(), stampedAt: Date.now(), synced: false };
}

export function createRecord(mediaType: MediaType, title: string): QuickRecord {
  const record = newRecord(mediaType, title);
  void setRecords([record, ...records]);
  return record;
}

export function appendLog(recordId: string, note: string): void {
  const log = newLog(note);
  void setRecords(
    records.map(r =>
      r.id === recordId ? { ...r, logs: [log, ...r.logs], updatedAt: log.stampedAt } : r
    )
  );
}

export function dissolveRecord(recordId: string): void {
  void setRecords(
    records.map(r =>
      r.id === recordId
        ? { ...r, status: 'dissolved' as const, dissolveSynced: false, updatedAt: Date.now() }
        : r
    )
  );
}

export function restoreRecord(recordId: string): void {
  void setRecords(
    records.map(r =>
      r.id === recordId
        ? {
            ...r,
            status: 'active' as const,
            dissolveSynced: false,
            restorePending: true,
            updatedAt: Date.now(),
          }
        : r
    )
  );
}

/** Wipe the local queue - used when the account changes. */
export async function clearRecords(): Promise<void> {
  await setRecords([]);
}

/* ----------------------------------------------------------------- derived */

/** How many local writes have not reached the server yet. */
export function countPending(list: QuickRecord[] = records): number {
  return list.reduce(
    (n, r) =>
      n +
      (r.synced ? 0 : 1) +
      (r.status === 'dissolved' && !r.dissolveSynced ? 1 : 0) +
      (r.restorePending ? 1 : 0) +
      r.logs.filter(l => !l.synced).length,
    0
  );
}

export function usePendingCount(): number {
  return countPending(useRecords());
}
