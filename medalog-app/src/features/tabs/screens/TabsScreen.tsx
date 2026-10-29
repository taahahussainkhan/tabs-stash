import React, { useState } from 'react';
import { View } from 'react-native';
import {
  DataList,
  EmptyState,
  Screen,
  ScreenHeader,
  SectionLabel,
  Segmented,
  space,
} from '../../../design';
import { useNavigation } from '../../../navigation/Navigator';
import {
  CardSheet,
  CardTile,
  cardKey,
  useCards,
  useToggleCardPin,
  type CardItem,
} from '../../cards';
import { LinkRow } from '../components/LinkRow';
import { SessionCard } from '../components/SessionCard';
import { useSavedLinks, useSessions, useToggleLinkRead } from '../hooks';
import { sessionKey, type TabSegment } from '../types';

/**
 * Everything the extension stashed, read-only.
 *
 * Mobile never creates sessions or tabs - it is the place you *use* them when
 * you are away from the desktop: open a tab, tick off the reading shelf, read a
 * note.
 */
export function TabsScreen() {
  const [segment, setSegment] = useState<TabSegment>('sessions');
  const sessions = useSessions();
  const links = useSavedLinks();
  const cards = useCards();

  return (
    <Screen padded={false} style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: space(4) }}>
        <ScreenHeader
          title="Tabs"
          subtitle="Stashed on your desktop · opens here"
        />
        <Segmented<TabSegment>
          options={[
            { value: 'sessions', label: 'Sessions', count: sessions.data?.length },
            { value: 'links', label: 'Shelf', count: links.data?.length },
            { value: 'cards', label: 'Cards', count: cards.data?.length },
          ]}
          value={segment}
          onChange={setSegment}
        />
        <View style={{ height: space(3) }} />
      </View>

      {segment === 'sessions' ? <SessionsList /> : null}
      {segment === 'links' ? <LinksList /> : null}
      {segment === 'cards' ? <CardsList /> : null}
    </Screen>
  );
}

function SessionsList() {
  const nav = useNavigation();
  const query = useSessions();

  return (
    <DataList
      data={query.data}
      loading={query.isPending}
      error={query.error}
      onRetry={query.refetch}
      refreshing={query.isRefetching}
      onRefresh={query.refetch}
      keyExtractor={sessionKey}
      renderItem={session => (
        <SessionCard
          session={session}
          onPress={() =>
            nav.push({ name: 'session', id: sessionKey(session), title: session.title || 'Session' })
          }
        />
      )}
      empty={
        <EmptyState
          glyph="▤"
          title="No stashed sessions"
          message="Stash your windows from the extension and they appear here, ready to open."
        />
      }
    />
  );
}

function LinksList() {
  const query = useSavedLinks();
  const toggle = useToggleLinkRead();

  return (
    <DataList
      data={query.data}
      loading={query.isPending}
      error={query.error}
      onRetry={query.refetch}
      refreshing={query.isRefetching}
      onRefresh={query.refetch}
      keyExtractor={link => link.id}
      header={<SectionLabel>{`${query.data?.filter(l => !l.isRead).length ?? 0} UNREAD`}</SectionLabel>}
      renderItem={link => (
        <LinkRow
          link={link}
          onToggleRead={isRead => toggle.mutate({ id: link.id, isRead })}
        />
      )}
      empty={
        <EmptyState
          glyph="⊹"
          title="Shelf is empty"
          message="Pages you save while reading land here, with a read/unread state."
        />
      }
    />
  );
}

function CardsList() {
  const query = useCards();
  const pin = useToggleCardPin();
  const [open, setOpen] = useState<CardItem | null>(null);

  return (
    <>
      <DataList
        data={query.data}
        loading={query.isPending}
        error={query.error}
        onRetry={query.refetch}
        refreshing={query.isRefetching}
        onRefresh={query.refetch}
        keyExtractor={cardKey}
        renderItem={card => <CardTile card={card} onPress={() => setOpen(card)} />}
        empty={
          <EmptyState
            glyph="◫"
            title="No cards yet"
            message="Quick notes and snippets from the extension show up here."
          />
        }
      />
      <CardSheet
        card={open}
        visible={!!open}
        onClose={() => setOpen(null)}
        onTogglePin={card => {
          pin.mutate({ id: cardKey(card), isPinned: !card.isPinned });
          setOpen(null);
        }}
      />
    </>
  );
}
