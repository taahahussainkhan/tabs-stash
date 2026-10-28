/**
 * TabVault Cards Manager (Modular)
 * Manages quick productivity cards, snippets, and sticky notes separately from tab sessions.
 * Local-first storage with automatic sync compatibility.
 */

(function (global) {
  class TabVaultCardsManager {
    /**
     * Get all cards from local storage
     * @returns {Promise<Array>}
     */
    static async getCards() {
      try {
        const data = await TabVaultAPI.storage.local.get(['savedCards']);
        return data.savedCards || [];
      } catch (err) {
        console.error('TabVaultCardsManager: Error getting cards', err);
        return [];
      }
    }

    /**
     * Save a new card / sticky note
     * @param {Object} cardData
     * @returns {Promise<Object>} The saved card object
     */
    static async saveCard({ content, title = '', color = 'charcoal', tags = [], isPinned = false, sourceUrl = '' }) {
      if (!content || typeof content !== 'string' || !content.trim()) {
        throw new Error('Card content cannot be empty');
      }

      const cleanContent = content.trim();
      let cleanTitle = title && typeof title === 'string' ? title.trim() : '';

      // Auto-extract first line if title is empty
      if (!cleanTitle) {
        const firstLine = cleanContent.split('\n')[0].trim();
        cleanTitle = firstLine.length > 50 ? firstLine.slice(0, 47) + '...' : firstLine;
      }

      const now = Date.now();
      const newCard = {
        id: 'card_' + now + '_' + Math.random().toString(36).substr(2, 6),
        content: cleanContent,
        title: cleanTitle,
        color: color || 'charcoal',
        tags: Array.isArray(tags) ? tags : [],
        isPinned: !!isPinned,
        sourceUrl: sourceUrl || '',
        savedAt: now,
        updatedAt: now,
      };

      const cards = await this.getCards();
      // Insert at beginning (or after pinned if not pinned)
      if (newCard.isPinned) {
        cards.unshift(newCard);
      } else {
        const firstNonPinnedIndex = cards.findIndex((c) => !c.isPinned);
        if (firstNonPinnedIndex === -1) {
          cards.push(newCard);
        } else {
          cards.splice(firstNonPinnedIndex, 0, newCard);
        }
      }

      await TabVaultAPI.storage.local.set({ savedCards: cards });
      this._emitChange();

      if (typeof TabVaultSyncEngine !== 'undefined') {
        TabVaultSyncEngine.onLocalDataChanged();
      }

      return newCard;
    }

    /**
     * Update an existing card
     * @param {string} cardId
     * @param {Object} updates
     */
    static async updateCard(cardId, updates) {
      const cards = await this.getCards();
      const card = cards.find((c) => c.id === cardId);
      if (card) {
        if (updates.content !== undefined) card.content = updates.content.trim();
        if (updates.title !== undefined) card.title = updates.title.trim();
        if (updates.color !== undefined) card.color = updates.color;
        if (updates.tags !== undefined) card.tags = updates.tags;
        if (updates.isPinned !== undefined) card.isPinned = !!updates.isPinned;
        if (updates.sourceUrl !== undefined) card.sourceUrl = updates.sourceUrl;
        card.updatedAt = Date.now();

        // Sort so pinned are first
        cards.sort((a, b) => {
          if (a.isPinned === b.isPinned) {
            return (b.savedAt || 0) - (a.savedAt || 0);
          }
          return a.isPinned ? -1 : 1;
        });

        await TabVaultAPI.storage.local.set({ savedCards: cards });
        this._emitChange();

        if (typeof TabVaultSyncEngine !== 'undefined') {
          TabVaultSyncEngine.onLocalDataChanged();
        }
      }
    }

    /**
     * Toggle pin status of a card
     * @param {string} cardId
     */
    static async togglePin(cardId) {
      const cards = await this.getCards();
      const card = cards.find((c) => c.id === cardId);
      if (card) {
        card.isPinned = !card.isPinned;
        card.updatedAt = Date.now();

        cards.sort((a, b) => {
          if (a.isPinned === b.isPinned) {
            return (b.savedAt || 0) - (a.savedAt || 0);
          }
          return a.isPinned ? -1 : 1;
        });

        await TabVaultAPI.storage.local.set({ savedCards: cards });
        this._emitChange();

        if (typeof TabVaultSyncEngine !== 'undefined') {
          TabVaultSyncEngine.onLocalDataChanged();
        }
        return card.isPinned;
      }
      return false;
    }

    /**
     * Delete a card by ID (tracks pending deletion for delta sync)
     * @param {string} cardId
     */
    static async deleteCard(cardId) {
      const cards = await this.getCards();
      const filtered = cards.filter((c) => c.id !== cardId);

      // Track pending deletion for server delta-sync
      const data = await TabVaultAPI.storage.local.get(['tabvault_pending_card_deletions']);
      const pendingDeletions = data.tabvault_pending_card_deletions || [];
      pendingDeletions.push({ id: cardId, deletedAt: Date.now() });

      await TabVaultAPI.storage.local.set({
        savedCards: filtered,
        tabvault_pending_card_deletions: pendingDeletions,
      });

      this._emitChange();

      if (typeof TabVaultSyncEngine !== 'undefined') {
        TabVaultSyncEngine.onLocalDataChanged();
      }
    }

    /**
     * Copy card content directly to clipboard
     * @param {string} text
     * @returns {Promise<boolean>}
     */
    static async copyToClipboard(text) {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
          return true;
        }
        // Fallback for non-secure / extension contexts
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        return success;
      } catch (err) {
        console.error('Failed to copy card text:', err);
        return false;
      }
    }

    /**
     * Internal emitter for card updates
     */
    static _emitChange() {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tabvault:cards-updated'));
      }
    }
  }

  global.TabVaultCardsManager = TabVaultCardsManager;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
