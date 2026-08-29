import { QueryClient } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5, // 5 minutes
			gcTime: 1000 * 60 * 60 * 24, // 24 hours
			retry: 1,
			refetchOnWindowFocus: false,
		},
	},
});

export const persister = createSyncStoragePersister({
	storage: window.localStorage,
	key: "OFFLINE_CACHE",
});
