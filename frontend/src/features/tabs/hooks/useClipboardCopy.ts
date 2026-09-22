import { useState } from 'react';
import { toast } from 'sonner';
import type { StashedSession } from '../../../services/tabService';

export function useClipboardCopy() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLinks = (session: StashedSession) => {
    const sessionId = session.id || session.sessionId || '';
    const text = (session.tabs || []).map((t) => `${t.title || ''}\n${t.url || ''}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopiedId(sessionId);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('All tab URLs copied to clipboard');
  };

  const handleCopySingleUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  return {
    copiedId,
    handleCopyLinks,
    handleCopySingleUrl,
  };
}
