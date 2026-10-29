/**
 * Quick cards: the sticky-note entities the extension and web app create.
 *
 * This module is the single owner of the card domain. The Tabs feature reads
 * them, the Capture feature creates them, and neither needs to know how the
 * other one uses them.
 */
export type CardColor = 'charcoal' | 'terracotta' | 'ochre' | 'sage' | 'cyan' | 'purple';

export interface CardItem {
  id: string;
  cardId?: string;
  content: string;
  title?: string;
  color?: CardColor;
  tags?: string[];
  isPinned: boolean;
  sourceUrl?: string;
  savedAt: number;
  clientUpdatedAt?: number;
  serverUpdatedAt?: number;
  updatedAt?: number;
}

/** What the composer produces; the API fills in ids and timestamps. */
export interface CardDraft {
  title: string;
  content: string;
  color: CardColor;
  tags?: string[];
}

/** Card tints, matched to the colours the web dashboard offers. */
export const CARD_TINT: Record<string, { bg: string; border: string }> = {
  charcoal: { bg: '#1e212c', border: '#333849' },
  terracotta: { bg: 'rgba(196,106,84,0.16)', border: 'rgba(196,106,84,0.50)' },
  ochre: { bg: 'rgba(196,152,74,0.16)', border: 'rgba(196,152,74,0.50)' },
  sage: { bg: 'rgba(110,150,120,0.16)', border: 'rgba(110,150,120,0.50)' },
  cyan: { bg: 'rgba(80,150,170,0.16)', border: 'rgba(80,150,170,0.50)' },
  purple: { bg: 'rgba(124,92,255,0.16)', border: 'rgba(124,92,255,0.50)' },
};

export const CARD_COLORS: { value: CardColor; label: string }[] = [
  { value: 'charcoal', label: 'Charcoal' },
  { value: 'terracotta', label: 'Terracotta' },
  { value: 'ochre', label: 'Ochre' },
  { value: 'sage', label: 'Sage' },
  { value: 'cyan', label: 'Cyan' },
  { value: 'purple', label: 'Purple' },
];

export function cardTint(name?: string) {
  return CARD_TINT[name ?? 'charcoal'] ?? CARD_TINT.charcoal;
}

/** The title if the author gave one, else the first line of the body. */
export function cardHeading(card: CardItem): string {
  return card.title?.trim() || card.content.split('\n')[0].trim() || 'Untitled card';
}

/** Cards arrive with `id` or the legacy `cardId`. */
export function cardKey(card: CardItem): string {
  return card.id || card.cardId || String(card.savedAt);
}
