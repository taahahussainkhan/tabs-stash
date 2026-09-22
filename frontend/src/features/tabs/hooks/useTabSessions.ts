import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { tabService, type StashedSession, type TabItem } from '../../../services/tabService';

export function useTabSessions() {
  const queryClient = useQueryClient();

  const {
    data: sessions = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['tab-sessions'],
    queryFn: () => tabService.getSessions(100),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId: string) => tabService.deleteSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tab-sessions'] });
      toast.success('Session deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete session');
    },
  });

  // Segregate Active vs Restored sessions
  const activeSessionsList = useMemo(() => {
    return (sessions || []).filter(
      (s) =>
        !s.isArchived &&
        !(s as any).isRestored &&
        !(s.tabs && s.tabs.length > 0 && s.tabs.every((t) => t.isPopped))
    );
  }, [sessions]);

  const restoredSessionsList = useMemo(() => {
    return (sessions || []).filter(
      (s) =>
        !s.isArchived &&
        ((s as any).isRestored || (s.tabs && s.tabs.length > 0 && s.tabs.every((t) => t.isPopped)))
    );
  }, [sessions]);

  // Extract unique domains with frequency count
  const domains = useMemo(() => {
    const map = new Map<string, number>();
    (sessions || []).forEach((s) => {
      (s.tabs || []).forEach((t) => {
        if (t.hostname && t.hostname !== 'local') {
          map.set(t.hostname, (map.get(t.hostname) || 0) + 1);
        }
      });
    });
    return Array.from(map.entries())
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count);
  }, [sessions]);

  // Extract unique devices
  const devices = useMemo(() => {
    const set = new Set<string>();
    (sessions || []).forEach((s) => {
      if (s.deviceInfo?.deviceName) set.add(s.deviceInfo.deviceName);
    });
    return Array.from(set);
  }, [sessions]);

  // Calculate total active tab count across all sessions
  const totalActiveTabsCount = useMemo(() => {
    return activeSessionsList.reduce((acc, s) => acc + (s.tabs?.length || 0), 0);
  }, [activeSessionsList]);

  const handleOpenAll = (tabs: TabItem[] = []) => {
    tabs.forEach((tab) => {
      if (tab.url) {
        window.open(tab.url, '_blank', 'noopener,noreferrer');
      }
    });
    toast.success(`Opened ${tabs.length} tabs`);
  };

  return {
    sessions,
    activeSessionsList,
    restoredSessionsList,
    domains,
    devices,
    totalActiveTabsCount,
    isLoading,
    isRefetching,
    refetch,
    deleteSession: deleteSessionMutation.mutate,
    isDeletingSession: deleteSessionMutation.isPending,
    handleOpenAll,
  };
}
