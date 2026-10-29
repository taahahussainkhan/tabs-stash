import { Linking } from 'react-native';

/** Open anything with a scheme; returns false instead of throwing. */
export async function openUrl(url: string): Promise<boolean> {
  const target = url.trim();
  if (!target) return false;
  try {
    await Linking.openURL(target);
    return true;
  } catch {
    return false;
  }
}

/** "https://www.theverge.com/x" -> "theverge.com" */
export function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^https?:\/\//, '').split('/')[0] || url;
  }
}

/** Favicon service used by the web dashboard and the extension. */
export function faviconFor(host: string, size = 64): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=${size}`;
}
