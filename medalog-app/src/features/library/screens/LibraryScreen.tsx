import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import {
  DataList,
  EmptyState,
  Field,
  Screen,
  ScreenHeader,
  Segmented,
  Spinner,
  space,
} from '../../../design';
import { useDebouncedValue } from '../../../core/useDebouncedValue';
import { useNavigation } from '../../../navigation/Navigator';
import { BookRow } from '../components/BookRow';
import { MediaRow } from '../components/MediaRow';
import { flattenPages, useBookList, useMediaList } from '../hooks';
import { useStats } from '../../stats';
import type { BookItem, LibraryKind, MediaItem, MediaKind } from '../types';

const PLACEHOLDER: Record<LibraryKind, string> = {
  movie: 'Search movies',
  series: 'Search series',
  book: 'Search books, authors, publishers',
};

/**
 * The library: everything logged in the web dashboard, filtered by kind.
 *
 * Movies/series and books come from different endpoints with different page
 * shapes, so each has its own list, but the chrome (header, filter, search) is
 * shared here once.
 */
export function LibraryScreen() {
  const [kind, setKind] = useState<LibraryKind>('movie');
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search.trim(), 350);
  const stats = useStats();
  const counts = stats.data;

  const subtitle = counts
    ? `${counts.total_movies} movies · ${counts.total_series} series · ${counts.total_books} books`
    : 'Everything you watch and read';

  return (
    <Screen padded={false} style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: space(4) }}>
        <ScreenHeader title="Library" subtitle={subtitle} />
        <Segmented<LibraryKind>
          options={[
            { value: 'movie', label: 'Movies', count: counts?.total_movies },
            { value: 'series', label: 'Series', count: counts?.total_series },
            { value: 'book', label: 'Books', count: counts?.total_books },
          ]}
          value={kind}
          onChange={next => {
            setKind(next);
            setSearch('');
          }}
        />
        <View style={{ height: space(3) }} />
        <Field
          placeholder={PLACEHOLDER[kind]}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        <View style={{ height: space(3) }} />
      </View>

      {kind === 'book' ? (
        <BooksList search={debounced} />
      ) : (
        <MediaList kind={kind} search={debounced} />
      )}
    </Screen>
  );
}

function MediaList({ kind, search }: { kind: MediaKind; search: string }) {
  const nav = useNavigation();
  const query = useMediaList(kind, search);
  const items = useMemo(() => flattenPages<MediaItem>(query.data?.pages), [query.data]);

  return (
    <DataList
      data={items}
      loading={query.isPending}
      error={query.error}
      onRetry={query.refetch}
      refreshing={query.isRefetching}
      onRefresh={query.refetch}
      keyExtractor={item => item.id}
      renderItem={item => (
        <MediaRow
          item={item}
          onPress={() =>
            nav.push(
              item.kind === 'movie'
                ? { name: 'movie', id: item.id }
                : { name: 'series', id: item.id }
            )
          }
        />
      )}
      onEndReached={() => {
        if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
      }}
      footer={query.isFetchingNextPage ? <Spinner /> : null}
      empty={
        search ? (
          <EmptyState glyph="⌕" title="No matches" message={`Nothing in your ${kind}s matches “${search}”.`} />
        ) : (
          <EmptyState
            glyph="▤"
            title={`No ${kind}s yet`}
            message={`Anything you log as a ${kind} in the dashboard shows up here.`}
          />
        )
      }
    />
  );
}

function BooksList({ search }: { search: string }) {
  const nav = useNavigation();
  const query = useBookList(search);
  const items = useMemo(() => flattenPages<BookItem>(query.data?.pages), [query.data]);

  return (
    <DataList
      data={items}
      loading={query.isPending}
      error={query.error}
      onRetry={query.refetch}
      refreshing={query.isRefetching}
      onRefresh={query.refetch}
      keyExtractor={book => String(book.publicId || book.id)}
      renderItem={book => (
        <BookRow
          book={book}
          onPress={() => nav.push({ name: 'book', id: book.publicId || String(book.id) })}
        />
      )}
      onEndReached={() => {
        if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
      }}
      footer={query.isFetchingNextPage ? <Spinner /> : null}
      empty={
        search ? (
          <EmptyState glyph="⌕" title="No matches" message={`No books match “${search}”.`} />
        ) : (
          <EmptyState
            glyph="▥"
            title="No books yet"
            message="Books you add to the collection appear here, with their edition details."
          />
        )
      }
    />
  );
}
