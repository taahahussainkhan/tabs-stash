import React, { useEffect, useMemo, useState } from 'react';
import { Button, Chip, Field, Row, Sheet, Text, useToast } from '../../../design';
import { useRecords } from '../store';
import { MEDIA_COLOR } from '../types';

/**
 * Stamp a timestamped log on an existing record.
 *
 * The timestamp is the point of the app, so this stays one tap away from the
 * capture screen: choose what you touched, say what happened, save.
 */
export function LogSheet({
  visible,
  onClose,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (recordId: string, note: string) => void;
}) {
  const records = useRecords();
  const toast = useToast();
  const active = useMemo(() => records.filter(r => r.status === 'active'), [records]);
  const [recordId, setRecordId] = useState<string>('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!visible) return;
    setNote('');
    setRecordId(active[0]?.id ?? '');
  }, [visible, active]);

  const save = () => {
    if (!recordId) {
      toast.show('Pick what this log is about first.', 'danger');
      return;
    }
    onSave(recordId, note.trim());
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Stamp a log"
      subtitle="Mark the moment on something you already added."
      scrollable
    >
      {active.length === 0 ? (
        <Text variant="body" tone="muted">
          Nothing to log on yet. Add a movie, series or book first - then every log you stamp
          lives on its timeline.
        </Text>
      ) : (
        <>
          <Text variant="label">What happened</Text>
          <Field
            placeholder="e.g. Episode 4, or where I stopped"
            value={note}
            onChangeText={setNote}
            multiline
            textAlignVertical="top"
            style={{ minHeight: 96 }}
          />

          <Text variant="label">On</Text>
          <Row wrap gap={2}>
            {active.map(record => (
              <Chip
                key={record.id}
                label={record.title}
                active={recordId === record.id}
                tint={MEDIA_COLOR[record.mediaType]}
                onPress={() => setRecordId(record.id)}
              />
            ))}
          </Row>
        </>
      )}

      <Button
        label="Save log"
        onPress={save}
        disabled={active.length === 0 || !recordId}
        block
      />
    </Sheet>
  );
}
