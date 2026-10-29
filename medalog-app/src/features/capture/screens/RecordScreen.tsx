import React, { useCallback, useState } from 'react';
import { FlatList, View } from 'react-native';
import {
  Badge,
  Button,
  EmptyState,
  Field,
  KeyboardFooter,
  ListRow,
  Row,
  Screen,
  ScreenHeader,
  SectionLabel,
  Text,
  color,
  space,
  useToast,
} from '../../../design';
import { formatDateTime, formatStamp, formatRelative, pluralize } from '../../../core/format';
import { appendLog, dissolveRecord, restoreRecord, useRecord } from '../store';
import { syncNow } from '../sync';
import { MEDIA_COLOR, MEDIA_LABEL } from '../types';

/**
 * One record: its stamp history plus the composer.
 *
 * Stamping must never wait on anything, so the log is written locally first and
 * the sync is fired afterwards without blocking the UI.
 */
export function RecordScreen({ id, onBack }: { id: string; onBack: () => void }) {
  const record = useRecord(id);
  const toast = useToast();
  const [note, setNote] = useState('');

  const submit = useCallback(() => {
    const text = note.trim();
    appendLog(id, text);
    setNote('');
    void syncNow();
  }, [id, note]);

  const toggleStatus = useCallback(() => {
    if (!record) return;
    if (record.status === 'active') {
      dissolveRecord(id);
      toast.show('Dissolved. Restore it any time.', 'default');
    } else {
      restoreRecord(id);
      toast.show('Restored.', 'success');
    }
    void syncNow();
  }, [id, record, toast]);

  if (!record) {
    return (
      <Screen>
        <ScreenHeader title="Record" onBack={onBack} />
        <EmptyState glyph="∅" title="Record not found" message="It may have been removed on another device." />
      </Screen>
    );
  }

  const dissolved = record.status === 'dissolved';
  const tint = MEDIA_COLOR[record.mediaType];

  return (
    <Screen padded={false} style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: space(4) }}>
        <ScreenHeader
          title={record.title}
          subtitle={`${MEDIA_LABEL[record.mediaType]} · started ${formatRelative(record.createdAt)}`}
          onBack={onBack}
          right={
            <Row gap={2} align="center">
              {dissolved ? <Badge label="DISSOLVED" tint={color.danger} /> : null}
              <Button
                label={dissolved ? 'Restore' : 'Dissolve'}
                size="sm"
                variant={dissolved ? 'success' : 'ghost'}
                onPress={toggleStatus}
              />
            </Row>
          }
        />
      </View>

      <FlatList
        data={record.logs}
        keyExtractor={item => item.id}
        contentContainerStyle={{
          paddingHorizontal: space(4),
          paddingBottom: space(32),
          flexGrow: 1,
        }}
        ListHeaderComponent={
          <SectionLabel>{`${record.logs.length} ${pluralize(record.logs.length, 'STAMP').toUpperCase()}`}</SectionLabel>
        }
        renderItem={({ item }) => (
          <ListRow
            accent={tint}
            title={item.note || 'Stamped'}
            subtitle={formatDateTime(item.stampedAt)}
            meta={item.synced ? undefined : 'pending'}
            dim={dissolved}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            glyph="⌁"
            title="No stamps yet"
            message={`Use the bar below to stamp this ${MEDIA_LABEL[record.mediaType].toLowerCase()} with the exact moment it happened.`}
          />
        }
      />

      <KeyboardFooter>
        <Row gap={2} align="center">
          <Field
            containerStyle={{ flex: 1 }}
            placeholder={dissolved ? 'Dissolved - restore to stamp' : 'What just happened?'}
            value={note}
            onChangeText={setNote}
            editable={!dissolved}
            returnKeyType="send"
            onSubmitEditing={submit}
            blurOnSubmit={false}
            maxLength={280}
          />
          <Button label="Stamp" onPress={submit} disabled={dissolved} />
        </Row>
        <Text variant="caption" tone="faint" align="center" style={{ marginTop: space(2) }}>
          {dissolved ? 'Dissolved records keep their history but stop accepting stamps.' : `Next stamp: ${formatStamp(Date.now())}`}
        </Text>
      </KeyboardFooter>
    </Screen>
  );
}
