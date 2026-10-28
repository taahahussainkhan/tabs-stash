import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cardService } from '../../services/cardService';
import type { CardItem, CardColor } from '../../services/cardService';
import { 
  Copy, 
  Check, 
  Pin, 
  Trash2, 
  Search, 
  Plus, 
  Sparkles, 
  StickyNote, 
  X,
  ExternalLink,
  Tag
} from 'lucide-react';
import { toast } from 'sonner';

const COLOR_CONFIG: Record<CardColor, { label: string; bg: string; border: string; accent: string }> = {
  charcoal: { label: 'Charcoal', bg: 'bg-[#1e2026]', border: 'border-[#31343e]', accent: '#4a5061' },
  terracotta: { label: 'Terracotta', bg: 'bg-[#221716]', border: 'border-[#5c241c]', accent: '#e05a47' },
  ochre: { label: 'Warm Ochre', bg: 'bg-[#251f15]', border: 'border-[#5e4418]', accent: '#e5a83b' },
  sage: { label: 'Sage Green', bg: 'bg-[#15221b]', border: 'border-[#1f5436]', accent: '#38a169' },
  cyan: { label: 'Teal Cyan', bg: 'bg-[#132224]', border: 'border-[#154d52]', accent: '#0d9488' },
  purple: { label: 'Royal Purple', bg: 'bg-[#1c1829]', border: 'border-[#3f316b]', accent: '#5c67f2' },
};

export const CardsPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Composer state
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [selectedColor, setSelectedColor] = useState<CardColor>('charcoal');
  const [isPinned, setIsPinned] = useState(false);
  const [isComposerExpanded, setIsComposerExpanded] = useState(false);

  // Filter & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'pinned' | CardColor>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch cards
  const { data: cards = [], isLoading } = useQuery({
    queryKey: ['cards'],
    queryFn: () => cardService.getCards(),
  });

  // Create card mutation
  const createCardMutation = useMutation({
    mutationFn: (data: {
      content: string;
      title?: string;
      color?: CardColor;
      tags?: string[];
      isPinned?: boolean;
    }) => cardService.saveCard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      setContent('');
      setTitle('');
      setTagsInput('');
      setIsPinned(false);
      setIsComposerExpanded(false);
      toast.success('Card saved successfully');
    },
    onError: () => {
      toast.error('Failed to save card');
    },
  });

  // Toggle pin mutation
  const togglePinMutation = useMutation({
    mutationFn: ({ id, isPinned }: { id: string; isPinned: boolean }) =>
      cardService.togglePin(id, isPinned),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      toast.success(variables.isPinned ? 'Card unpinned' : 'Card pinned to top');
    },
  });

  // Delete card mutation
  const deleteCardMutation = useMutation({
    mutationFn: (id: string) => cardService.deleteCard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      toast.success('Card deleted');
    },
  });

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim()) {
      toast.error('Please enter some text or paste content');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    createCardMutation.mutate({
      content,
      title,
      color: selectedColor,
      tags,
      isPinned,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  const handleCopy = async (card: CardItem) => {
    try {
      await navigator.clipboard.writeText(card.content);
      setCopiedId(card.id);
      toast.success('Copied to clipboard! ✨');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  // Filtered Cards
  const filteredCards = useMemo(() => {
    let result = cards;

    // Filter by type or color
    if (activeFilter === 'pinned') {
      result = result.filter((c) => c.isPinned);
    } else if (activeFilter !== 'all') {
      result = result.filter((c) => c.color === activeFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.content.toLowerCase().includes(q) ||
          (c.title || '').toLowerCase().includes(q) ||
          (c.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [cards, activeFilter, searchQuery]);

  const pinnedCount = cards.filter((c) => c.isPinned).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#272a32] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#202228] border border-[#31343e] flex items-center justify-center text-[#e5a83b]">
              <StickyNote className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Quick Cards & Sticky Notes
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-[#202228] border border-[#31343e] text-[#e5a83b]">
                  {cards.length}
                </span>
              </h1>
              <p className="text-sm text-[#a1a6b4] mt-0.5">
                Instant scratchpad for thoughts, code snippets, memos, and reminders. Synced from your extension.
              </p>
            </div>
          </div>
        </div>

        {/* Global Stats / Quick Counter */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-md bg-[#191b20] border border-[#31343e] text-xs font-mono text-[#a1a6b4]">
            Pinned: <span className="text-[#e5a83b] font-bold">{pinnedCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-md bg-[#191b20] border border-[#31343e] text-xs font-mono text-[#a1a6b4]">
            Total: <span className="text-white font-bold">{cards.length}</span>
          </div>
        </div>
      </div>

      {/* Card Composer Box */}
      <div className="bg-[#191b20] border border-[#31343e] rounded-xl p-5 shadow-xl transition-all duration-200 focus-within:border-[#e05a47]">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#e5a83b] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Quick Capture Card
            </span>
            <span className="text-xs font-mono text-[#6d7280]">
              Press <kbd className="px-1.5 py-0.5 rounded bg-[#202228] border border-[#31343e] text-white">Ctrl+Enter</kbd> to save
            </span>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsComposerExpanded(true)}
            placeholder="Paste or write anything here... text, code, ideas, quotes, reminders..."
            rows={isComposerExpanded ? 4 : 2}
            className="w-full bg-[#121316] border border-[#272a32] rounded-lg p-3 text-sm text-white placeholder-[#6d7280] focus:outline-none focus:border-[#e05a47] transition-all duration-150 resize-y"
          />

          {isComposerExpanded && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title (optional, auto-detected from 1st line)"
                className="bg-[#121316] border border-[#272a32] rounded-md px-3 py-2 text-xs text-white placeholder-[#6d7280] focus:outline-none focus:border-[#31343e]"
              />
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Tags (comma-separated, e.g. dev, ideas, read)"
                className="bg-[#121316] border border-[#272a32] rounded-md px-3 py-2 text-xs text-white placeholder-[#6d7280] focus:outline-none focus:border-[#31343e]"
              />
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#272a32]">
            {/* Color Palette Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#a1a6b4] mr-1">Color:</span>
              {(Object.keys(COLOR_CONFIG) as CardColor[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  style={{ backgroundColor: COLOR_CONFIG[c].accent }}
                  title={COLOR_CONFIG[c].label}
                  className={`w-5 h-5 rounded-full transition-all duration-150 ${
                    selectedColor === c
                      ? 'ring-2 ring-white scale-125'
                      : 'opacity-70 hover:opacity-100 hover:scale-110'
                  }`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPinned(!isPinned)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                  isPinned
                    ? 'bg-[#251f15] border-[#5e4418] text-[#e5a83b]'
                    : 'bg-[#202228] border-[#31343e] text-[#a1a6b4] hover:text-white'
                }`}
              >
                <Pin className="w-3.5 h-3.5" />
                <span>{isPinned ? 'Pinned' : 'Pin to top'}</span>
              </button>

              <button
                type="submit"
                disabled={!content.trim() || createCardMutation.isPending}
                className="flex items-center gap-2 px-4 py-1.5 rounded-md bg-[#e05a47] hover:bg-[#cc4a38] text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                <span>{createCardMutation.isPending ? 'Saving...' : 'Save Card'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
              activeFilter === 'all'
                ? 'bg-[#e05a47] border-[#e05a47] text-white'
                : 'bg-[#191b20] border-[#31343e] text-[#a1a6b4] hover:text-white'
            }`}
          >
            All Cards ({cards.length})
          </button>
          <button
            onClick={() => setActiveFilter('pinned')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border flex items-center gap-1 ${
              activeFilter === 'pinned'
                ? 'bg-[#e5a83b] border-[#e5a83b] text-black font-semibold'
                : 'bg-[#191b20] border-[#31343e] text-[#a1a6b4] hover:text-white'
            }`}
          >
            <Pin className="w-3 h-3" />
            Pinned ({pinnedCount})
          </button>

          <div className="h-4 w-[1px] bg-[#31343e] mx-1 hidden sm:block" />

          {/* Color filter dots */}
          {(Object.keys(COLOR_CONFIG) as CardColor[]).map((c) => {
            const countForColor = cards.filter((item) => item.color === c).length;
            if (countForColor === 0) return null;
            return (
              <button
                key={c}
                onClick={() => setActiveFilter(activeFilter === c ? 'all' : c)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono border flex items-center gap-1.5 transition-colors ${
                  activeFilter === c
                    ? 'border-white text-white bg-[#202228]'
                    : 'bg-[#191b20] border-[#31343e] text-[#a1a6b4] hover:text-white'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: COLOR_CONFIG[c].accent }}
                />
                <span>{countForColor}</span>
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7280]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cards or #tags..."
            className="w-full bg-[#191b20] border border-[#31343e] rounded-md pl-9 pr-8 py-1.5 text-xs text-white placeholder-[#6d7280] focus:outline-none focus:border-[#e05a47]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6d7280] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-44 rounded-xl bg-[#191b20] border border-[#31343e] animate-pulse" />
          ))}
        </div>
      ) : filteredCards.length === 0 ? (
        <div className="text-center py-20 bg-[#191b20]/40 border border-dashed border-[#31343e] rounded-xl p-8">
          <div className="w-12 h-12 rounded-full bg-[#202228] border border-[#31343e] flex items-center justify-center mx-auto mb-3 text-[#e5a83b]">
            <StickyNote className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No quick cards found</h3>
          <p className="text-xs text-[#a1a6b4] mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'No cards match your search query. Try clearing filters.'
              : 'Paste any text in the box above or right-click any selected text on the web in your extension!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCards.map((card) => {
            const cardColor = card.color || 'charcoal';
            const colorMeta = COLOR_CONFIG[cardColor];

            return (
              <div
                key={card.id}
                className={`relative group rounded-xl p-5 border flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl ${colorMeta.bg} ${colorMeta.border}`}
                style={{ borderLeftWidth: '4px', borderLeftColor: colorMeta.accent }}
              >
                <div>
                  {/* Top Bar: Title & Actions */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate" title={card.title}>
                        {card.title || 'Quick Note'}
                      </h4>
                      {card.isPinned && (
                        <span className="text-[#e5a83b] text-xs" title="Pinned to top">
                          <Pin className="w-3.5 h-3.5 fill-[#e5a83b]" />
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100">
                      {/* 1-Click Copy Button */}
                      <button
                        onClick={() => handleCopy(card)}
                        title="Copy to clipboard"
                        className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold border transition-all ${
                          copiedId === card.id
                            ? 'bg-[#38a169] border-[#38a169] text-white'
                            : 'bg-[#121316]/70 border-[#31343e] text-[#a1a6b4] hover:text-white hover:border-[#a1a6b4]'
                        }`}
                      >
                        {copiedId === card.id ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      {/* Pin button */}
                      <button
                        onClick={() => togglePinMutation.mutate({ id: card.id, isPinned: card.isPinned })}
                        title={card.isPinned ? 'Unpin card' : 'Pin card to top'}
                        className="p-1 rounded text-[#a1a6b4] hover:text-white hover:bg-[#202228] transition-colors"
                      >
                        <Pin className={`w-3.5 h-3.5 ${card.isPinned ? 'text-[#e5a83b] fill-[#e5a83b]' : ''}`} />
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => deleteCardMutation.mutate(card.id)}
                        title="Delete card"
                        className="p-1 rounded text-[#a1a6b4] hover:text-[#e05a47] hover:bg-[#202228] transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="text-xs leading-relaxed text-[#d1d5db] font-sans whitespace-pre-wrap break-words max-h-56 overflow-y-auto bg-[#121316]/40 p-3 rounded-lg border border-[#272a32]/60">
                    {card.content}
                  </div>
                </div>

                {/* Footer Bar: Tags & Date */}
                <div className="mt-4 pt-3 border-t border-[#272a32]/60 flex items-center justify-between text-[11px] text-[#6d7280]">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {card.tags && card.tags.length > 0 ? (
                      card.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 rounded bg-[#121316] border border-[#272a32] text-[#a1a6b4] font-mono text-[10px]"
                        >
                          #{tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-[#4b5563] flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5" /> card
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[10px]">
                    {card.sourceUrl && (
                      <a
                        href={card.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        title={card.sourceUrl}
                        className="text-[#a1a6b4] hover:text-white"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <span>
                      {new Date(card.savedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
