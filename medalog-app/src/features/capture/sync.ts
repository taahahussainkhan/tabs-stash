import { useEffect, useSyncExternalStore } from 'react';
import { ApiError } from '../../core/http';
import { queryClient } from '../../core/query';
import { isSignedIn } from '../../core/session';
import { quickRecordsApi, serverRecordToLocal } from './api';
import { countPending, getRecords, setRecords, useRecords } from './store';

/**
 * Replay of the local queue to the server.
 *
 * Serialised on purpose: runs are chained rather than overlapping, so a burst
 * of edits cannot race the token refresh (the API revokes a token family when
 * a refresh token is replayed) and cannot interleave partial pushes.
 */
let running: Promise<SyncResult> | null = null;
let queued = false;

export interface SyncResult {
  ok: boolean;
  offline?: boolean;
  error?: string;
}

const listeners = new Set<() => void>();
let syncing = false;
let lastError: string | null = null;

function emit() {
  listeners.forEach(fn => fn());
}

function setState(next: { syncing?: boolean; lastError?: string | null }) {
  if (next.syncing !== undefined) syncing = next.syncing;
  if (next.lastError !== undefined) lastError = next.lastError;
  emit();
}

/** One sync in flight at a time; concurrent callers share the pending run. */
export function syncNow(): Promise<SyncResult> {
  if (running) {
    queued = true;
    return running;
  }
  running = execute().finally(() => {
    running = null;
    if (queued) {
      queued = false;
      void syncNow();
    }
  });
  return running;
}

async function execute(): Promise<SyncResult> {
  if (!isSignedIn()) return { ok: false, error: 'Not signed in.' };

  setState({ syncing: true });

  try {
    const local = getRecords();
    let pushed = false;

    for (const record of local) {
      try {
        if (!record.synced) {
          await quickRecordsApi.create(record);
          pushed = true;
        }
        for (const log of record.logs) {
          if (!log.synced) {
            await quickRecordsApi.addLog(record.id, log);
            pushed = true;
          }
        }
        if (record.status === 'dissolved' && !record.dissolveSynced) {
          await quickRecordsApi.dissolve(record.id);
          pushed = true;
        }
        if (record.status === 'active' && record.restorePending) {
          await quickRecordsApi.restore(record.id);
          pushed = true;
        }
      } catch (e: any) {
        // a single bad item must not block the rest of the queue
        if (e instanceof ApiError && e.status >= 400 && e.status < 500 && e.status !== 401) continue;
        throw e;
      }
    }

    const remote = await quickRecordsApi.list();
    await setRecords(remote.map(serverRecordToLocal));
    setState({ syncing: false, lastError: null });

    // a pushed record changes the server-side counters and the dashboard feeds
    if (pushed) void queryClient.invalidateQueries();

    return { ok: true };
  } catch (e: any) {
    const offline = !(e instanceof ApiError) || e.status === 0;
    setState({ syncing: false, lastError: e?.message ?? 'Sync failed.' });
    return { ok: false, offline, error: e?.message };
  }
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useSyncState(): { syncing: boolean; lastError: string | null; pending: number } {
  const records = useRecords();
  const sync = useSyncExternalStore(
    subscribe,
    () => syncing,
    () => syncing
  );
  const error = useSyncExternalStore(
    subscribe,
    () => lastError,
    () => lastError
  );
  return { syncing: sync, lastError: error, pending: countPending(records) };
}

/** Sync once when the session becomes available (app start / sign-in). */
export function useAutoSync(): void {
  useEffect(() => {
    void syncNow();
  }, []);
}
