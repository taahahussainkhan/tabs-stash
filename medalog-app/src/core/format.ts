/**
 * Display formatting, shared by every screen.
 * Timestamps are always shown in 12-hour format, per the product convention.
 */

const pad = (n: number) => String(n).padStart(2, '0');

function parts(ms: number) {
  const d = new Date(ms);
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return {
    d,
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${h}:${pad(d.getMinutes())} ${ampm}`,
  };
}

/** "2026-10-29  9:04 PM" */
export function formatDateTime(ms: number | string | null | undefined): string {
  const n = toMillis(ms);
  if (!n) return '';
  const { date, time } = parts(n);
  return `${date}  ${time}`;
}

/** "2026-10-29 9:04 PM" */
export function formatStamp(ms: number | string | null | undefined): string {
  const n = toMillis(ms);
  if (!n) return '';
  const { date, time } = parts(n);
  return `${date} ${time}`;
}

/** "9:04 PM" */
export function formatTime(ms: number | string | null | undefined): string {
  const n = toMillis(ms);
  if (!n) return '';
  return parts(n).time;
}

/** "2026-10-29" */
export function formatDate(value: number | string | null | undefined): string {
  const n = toMillis(value);
  return n ? parts(n).date : '';
}

/** "2026-10-01 → 2026-10-29", or "since 2026-10-01" while still running. */
export function formatRange(
  start: number | string | null | undefined,
  end: number | string | null | undefined
): string {
  const from = formatDate(start);
  if (!from) return '';
  const to = formatDate(end);
  return to ? `${from} → ${to}` : `since ${from}`;
}

/** "Just now", "4h ago", "3d ago", then the date. */
export function formatRelative(ms: number | string | null | undefined): string {
  const n = toMillis(ms);
  if (!n) return '';
  const diff = Date.now() - n;
  if (diff < 60_000) return 'Just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return parts(n).date;
}

export function toMillis(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const asNumber = Number(value);
  if (Number.isFinite(asNumber) && String(value).trim() !== '') return asNumber;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : plural ?? `${singular}s`;
}

export function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}
