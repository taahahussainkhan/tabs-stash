import React from 'react';
import { FlatList, RefreshControl, StyleProp, ViewStyle } from 'react-native';
import { color, space } from './theme';
import { ErrorState } from './Feedback';
import { Spinner } from './Controls';

/**
 * The list every screen uses.
 *
 * Owns the four states a remote list always has - loading, error, empty, data -
 * plus pull-to-refresh and pagination, so screens only describe their row.
 * Passing `data === undefined` while `loading` shows the spinner, which keeps
 * the "first load vs refresh" distinction out of every feature.
 */
export interface DataListProps<T> {
  data: T[] | undefined;
  renderItem: (item: T, index: number) => React.ReactElement;
  keyExtractor: (item: T) => string;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  empty?: React.ReactNode;
  header?: React.ReactElement | null;
  footer?: React.ReactElement | null;
  onEndReached?: () => void;
  /** horizontal padding in 4dp units, 0 for edge-to-edge rows */
  inset?: number;
  /** top padding in 4dp units, for screens with a fixed header above the list */
  contentTop?: number;
  /** bottom padding in 4dp units */
  bottom?: number;
  style?: StyleProp<ViewStyle>;
}

export function DataList<T>({
  data,
  renderItem,
  keyExtractor,
  loading,
  error,
  onRetry,
  refreshing,
  onRefresh,
  empty,
  header,
  footer,
  onEndReached,
  inset = 4,
  contentTop = 0,
  bottom = 24,
  style,
}: DataListProps<T>) {
  if (loading && !data?.length) return <Spinner label="Loading…" />;
  if (error && !data?.length) return <ErrorState error={error} onRetry={onRetry} />;

  return (
    <FlatList
      style={[{ flex: 1 }, style]}
      data={data ?? []}
      keyExtractor={keyExtractor}
      renderItem={({ item, index }) => renderItem(item, index)}
      contentContainerStyle={{
        paddingHorizontal: space(inset),
        paddingTop: space(contentTop),
        paddingBottom: space(bottom),
        flexGrow: 1,
      }}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={header ?? undefined}
      ListFooterComponent={footer ?? undefined}
      ListEmptyComponent={<>{empty}</>}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.4}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={!!refreshing}
            onRefresh={onRefresh}
            tintColor={color.accent}
            colors={[color.accent]}
            progressBackgroundColor={color.surface}
          />
        ) : undefined
      }
    />
  );
}
