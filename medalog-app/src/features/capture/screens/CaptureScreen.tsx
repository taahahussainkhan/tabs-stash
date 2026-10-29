import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Button,
  DataList,
  EmptyState,
  Fab,
  Screen,
  ScreenHeader,
  Text,
  color,
  space,
  useToast,
  type FabAction,
} from '../../../design';
import { useSession } from '../../../core/session';
import { useNavigation } from '../../../navigation/Navigator';
import { CardComposer, useCreateCard, type CardDraft } from '../../cards';
import { AddRecordSheet } from '../components/AddRecordSheet';
import { LogSheet } from '../components/LogSheet';
import { RecordRow } from '../components/RecordRow';
import { appendLog, createRecord, useRecords } from '../store';
import { syncNow, useSyncState } from '../sync';
import { MEDIA_COLOR, type MediaType } from '../types';

/**
 * The capture tab: everything you stamped, newest first, plus one FAB that
 * fans out into every kind of thing you can create.
 *
 * Mobile never stashes tabs - the extension does that - but it is the fastest
 * place to save a movie, a log, or a card.
 */
export function CaptureScreen() {
  const nav = useNavigation();
  const session = useSession();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const records = useRecords();
  const { syncing, pending } = useSyncState();

  const [addOpen, setAddOpen] = useState(false);
  const [addType, setAddType] = useState<MediaType>('movie');
  const [logOpen, setLogOpen] = useState(false);
  const [cardMode, setCardMode] = useState<'card' | 'note' | null>(null);
  const createCard = useCreateCard();

  const openAdd = useCallback((type: MediaType) => {
    setAddType(type);
    setAddOpen(true);
  }, []);

  const onCreate = useCallback((mediaType: MediaType, title: string) => {
    createRecord(mediaType, title);
    setAddOpen(false);
    void syncNow();
  }, []);

  const onLog = useCallback((recordId: string, note: string) => {
    appendLog(recordId, note);
    setLogOpen(false);
    void syncNow();
  }, []);

  const onCard = useCallback(
    async (draft: CardDraft) => {
      try {
        await createCard.mutateAsync(draft);
        setCardMode(null);
        toast.show(cardMode === 'note' ? 'Note saved.' : 'Card saved.', 'success');
      } catch {
        toast.show('Could not save. It will work once you are back online.', 'danger');
      }
    },
    [createCard, cardMode, toast]
  );

  const actions: FabAction[] = [
    { key: 'book', label: 'Book', glyph: '▥', tint: MEDIA_COLOR.book, onPress: () => openAdd('book') },
    { key: 'series', label: 'Series', glyph: '❐', tint: MEDIA_COLOR.series, onPress: () => openAdd('series') },
    { key: 'movie', label: 'Movie', glyph: '▶', tint: MEDIA_COLOR.movie, onPress: () => openAdd('movie') },
    { key: 'card', label: 'Card', glyph: '◫', tint: color.accent, onPress: () => setCardMode('card') },
    { key: 'note', label: 'Note', glyph: '✎', tint: color.success, onPress: () => setCardMode('note') },
    { key: 'log', label: 'Log', glyph: '◷', tint: color.warning, onPress: () => setLogOpen(true) },
  ];

  return (
    <Screen padded={false} style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: space(4), paddingBottom: space(1) }}>
        <ScreenHeader
          title="Capture"
          subtitle={`${session.email} · ${records.length} ${records.length === 1 ? 'record' : 'records'}`}
          right={
            <Button
              label={pending ? `Sync ${pending}` : 'Sync'}
              size="sm"
              variant="secondary"
              loading={syncing}
              onPress={() => void syncNow()}
            />
          }
        />
      </View>

      <DataList
        data={records}
        loading={syncing && records.length === 0}
        keyExtractor={item => item.id}
        bottom={26}
        contentTop={2}
        renderItem={item => (
          <RecordRow
            record={item}
            pending={(!item.synced ? 1 : 0) + item.logs.filter(l => !l.synced).length}
            onPress={() => nav.push({ name: 'record', id: item.id })}
          />
        )}
        empty={
          <EmptyState
            glyph="＋"
            title="Nothing captured yet"
            message="Tap + to save a movie, series or book, write a card, or stamp a log. The timestamp is what matters."
            actionLabel="Add the first one"
            onAction={() => openAdd('movie')}
          />
        }
      />

      <Fab actions={actions} bottom={insets.bottom + space(6)} label="Capture" />

      {pending > 0 ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: space(4),
            bottom: insets.bottom + space(6),
            backgroundColor: color.warningSoft,
            borderColor: color.warning,
            borderWidth: 1,
            borderRadius: 999,
            paddingVertical: space(2),
            paddingHorizontal: space(3),
          }}
        >
          <Text variant="caption" tint={color.warning}>
            {pending} waiting to sync
          </Text>
        </View>
      ) : null}

      <AddRecordSheet
        visible={addOpen}
        initialType={addType}
        onClose={() => setAddOpen(false)}
        onSubmit={onCreate}
      />
      <LogSheet visible={logOpen} onClose={() => setLogOpen(false)} onSave={onLog} />
      <CardComposer
        visible={cardMode !== null}
        mode={cardMode ?? 'card'}
        saving={createCard.isPending}
        onClose={() => setCardMode(null)}
        onSubmit={onCard}
      />
    </Screen>
  );
}
