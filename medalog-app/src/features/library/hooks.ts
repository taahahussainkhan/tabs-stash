import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { libraryApi } from './api';
import type { BookDetail, LibraryKind, MediaDetail, MediaKind, Page } from './types';

export const libraryKeys = {
  all: ['library'] as const,
  list: (kind: LibraryKind, search: string) => [...libraryKeys.all, 'list', kind, search] as const,
  detail: (kind: LibraryKind, id: string) => [...libraryKeys.all, 'detail', kind, id] as const,
};

/** Paged movies or series. Search is part of the key, so results are cached. */
export function useMediaList(kind: MediaKind, search = '') {
  return useInfiniteQuery({
    queryKey: libraryKeys.list(kind, search),
    initialPageParam: 1,
    queryFn: ({ pageParam }) => libraryApi.watchPage(kind, pageParam, search),
    getNextPageParam: last => (last.has_next ? last.page + 1 : undefined),
  });
}

export function useBookList(search = '') {
  return useInfiniteQuery({
    queryKey: libraryKeys.list('book', search),
    initialPageParam: 1,
    queryFn: ({ pageParam }) => libraryApi.bookPage(pageParam, search),
    getNextPageParam: last => (last.has_next ? last.page + 1 : undefined),
  });
}

export function useMediaDetail(kind: MediaKind, id: string) {
  return useQuery<MediaDetail>({
    queryKey: libraryKeys.detail(kind, id),
    queryFn: () => libraryApi.mediaDetail(kind, id),
    enabled: !!id,
  });
}

export function useBookDetail(id: string) {
  return useQuery<BookDetail>({
    queryKey: libraryKeys.detail('book', id),
    queryFn: () => libraryApi.bookDetail(id),
    enabled: !!id,
  });
}

/** Infinite pages -> one flat array, memoised by the caller. */
export function flattenPages<T>(pages?: Page<T>[]): T[] {
  return pages?.flatMap(page => page.items) ?? [];
}
