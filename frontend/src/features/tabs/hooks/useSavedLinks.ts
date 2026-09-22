import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { tabService, type SavedLink } from '../../../services/tabService';

export function useSavedLinks() {
  const queryClient = useQueryClient();
  const [selectedLinkIds, setSelectedLinkIds] = useState<Set<string>>(new Set());

  const {
    data: savedLinks = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['tab-saved-links'],
    queryFn: () => tabService.getSavedLinks(),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const toggleLinkReadMutation = useMutation({
    mutationFn: ({ linkId, isRead }: { linkId: string; isRead: boolean }) =>
      tabService.toggleLinkRead(linkId, isRead),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tab-saved-links'] });
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: (linkId: string) => tabService.deleteLink(linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tab-saved-links'] });
      toast.success('Link removed from reading list');
    },
  });

  const convertLinksMutation = useMutation({
    mutationFn: (ids: string[]) => tabService.convertLinksToSession(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tab-saved-links'] });
      queryClient.invalidateQueries({ queryKey: ['tab-sessions'] });
      setSelectedLinkIds(new Set());
      toast.success('Converted links into a new Stashed Session');
    },
    onError: () => {
      toast.error('Failed to convert links to session');
    },
  });

  const unreadLinksCount = useMemo(() => {
    return (savedLinks || []).filter((l) => !l.isRead).length;
  }, [savedLinks]);

  const handleToggleSelectLink = (id: string) => {
    const updated = new Set(selectedLinkIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedLinkIds(updated);
  };

  const handleSelectAllFilteredLinks = (filteredLinks: SavedLink[]) => {
    if (selectedLinkIds.size === filteredLinks.length && filteredLinks.length > 0) {
      setSelectedLinkIds(new Set());
    } else {
      setSelectedLinkIds(new Set(filteredLinks.map((l) => l.id)));
    }
  };

  const clearSelection = () => {
    setSelectedLinkIds(new Set());
  };

  return {
    savedLinks,
    isLoading,
    isRefetching,
    refetch,
    selectedLinkIds,
    toggleLinkRead: (linkId: string, isRead: boolean) =>
      toggleLinkReadMutation.mutate({ linkId, isRead }),
    deleteLink: deleteLinkMutation.mutate,
    convertLinks: convertLinksMutation.mutate,
    isConverting: convertLinksMutation.isPending,
    unreadLinksCount,
    handleToggleSelectLink,
    handleSelectAllFilteredLinks,
    clearSelection,
  };
}
