import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { clearSession } from '../../core/session';
import { authApi } from '../auth/api';
import { clearRecords } from '../capture/store';
import { syncNow } from '../capture/sync';

/**
 * Sign-out sequence.
 *
 * Flush what can be flushed, revoke the refresh token, drop the previous
 * account's local queue and cached server data, then clear the session - so the
 * next account never inherits somebody else's records.
 */
export function useSignOut() {
  const client = useQueryClient();
  const [busy, setBusy] = useState(false);

  const signOut = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      await syncNow();
      await authApi.logout();
      await clearRecords();
      client.clear();
      await clearSession();
    } finally {
      setBusy(false);
    }
  }, [busy, client]);

  return { signOut, signingOut: busy };
}
