/**
 * Public surface of the capture feature.
 *
 * The app shell and the account tab import from here, never from the
 * feature's internals.
 */
export { CaptureScreen } from './screens/CaptureScreen';
export { RecordScreen } from './screens/RecordScreen';
export { syncNow, useAutoSync, useSyncState } from './sync';
export { clearRecords, loadRecords, usePendingCount, useRecords } from './store';
export type { MediaType, QuickLog, QuickRecord } from './types';
