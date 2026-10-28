import { api } from '../app/api';

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

const LOCAL_CARDS_KEY = 'lore_saved_cards';

function getStoredCards(): CardItem[] {
  try {
    const local = localStorage.getItem(LOCAL_CARDS_KEY);
    return local ? JSON.parse(local) : [];
  } catch {
    return [];
  }
}

function setStoredCards(cards: CardItem[]): void {
  try {
    localStorage.setItem(LOCAL_CARDS_KEY, JSON.stringify(cards));
  } catch (err) {
    console.error('Failed to save cards to localStorage:', err);
  }
}

export const cardService = {
  /**
   * Get all cards (remote with local storage fallback)
   */
  async getCards(): Promise<CardItem[]> {
    try {
      const res = await api.get('/cards');
      const payload = res.data;
      const remoteCards = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
        ? payload.data
        : [];

      if (remoteCards.length > 0) {
        setStoredCards(remoteCards);
        return remoteCards;
      }
      return getStoredCards();
    } catch {
      return getStoredCards();
    }
  },

  /**
   * Create a new quick card
   */
  async saveCard(data: {
    content: string;
    title?: string;
    color?: CardColor;
    tags?: string[];
    isPinned?: boolean;
    sourceUrl?: string;
  }): Promise<CardItem> {
    const now = Date.now();
    const tempCard: CardItem = {
      id: 'card_' + now + '_' + Math.random().toString(36).substr(2, 6),
      content: data.content.trim(),
      title: data.title ? data.title.trim() : '',
      color: data.color || 'charcoal',
      tags: data.tags || [],
      isPinned: !!data.isPinned,
      sourceUrl: data.sourceUrl || '',
      savedAt: now,
      updatedAt: now,
    };

    // Auto-detect title from first line if empty
    if (!tempCard.title) {
      const firstLine = tempCard.content.split('\n')[0].trim();
      tempCard.title = firstLine.length > 50 ? firstLine.slice(0, 47) + '...' : firstLine;
    }

    // Save locally first
    const current = getStoredCards();
    if (tempCard.isPinned) {
      current.unshift(tempCard);
    } else {
      const firstNonPinnedIndex = current.findIndex((c) => !c.isPinned);
      if (firstNonPinnedIndex === -1) {
        current.push(tempCard);
      } else {
        current.splice(firstNonPinnedIndex, 0, tempCard);
      }
    }
    setStoredCards(current);

    // Call API in background or return remote card
    try {
      const res = await api.post('/cards', tempCard);
      const serverCard = res.data?.data;
      if (serverCard) {
        const updated = current.map((c) => (c.id === tempCard.id ? serverCard : c));
        setStoredCards(updated);
        return serverCard;
      }
    } catch (err) {
      console.warn('Card saved locally (offline mode):', err);
    }

    return tempCard;
  },

  /**
   * Toggle pin state
   */
  async togglePin(cardId: string, currentPinState: boolean): Promise<boolean> {
    const nextPin = !currentPinState;
    const cards = getStoredCards();
    const target = cards.find((c) => c.id === cardId);
    if (target) {
      target.isPinned = nextPin;
      target.updatedAt = Date.now();
      cards.sort((a, b) => {
        if (a.isPinned === b.isPinned) {
          return (b.savedAt || 0) - (a.savedAt || 0);
        }
        return a.isPinned ? -1 : 1;
      });
      setStoredCards(cards);
    }

    try {
      await api.patch(`/cards/${cardId}/pin`, { isPinned: nextPin });
    } catch (err) {
      console.warn('Toggle pin offline:', err);
    }

    return nextPin;
  },

  /**
   * Delete card
   */
  async deleteCard(cardId: string): Promise<void> {
    const cards = getStoredCards().filter((c) => c.id !== cardId);
    setStoredCards(cards);

    try {
      await api.delete(`/cards/${cardId}`);
    } catch (err) {
      console.warn('Delete card offline:', err);
    }
  },
};
