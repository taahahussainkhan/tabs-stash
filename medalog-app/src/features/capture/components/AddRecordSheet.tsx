import React, { useEffect, useState } from 'react';
import { Row, Button, Chip, Field, Sheet } from '../../../design';
import { MEDIA_COLOR, MEDIA_LABEL, MEDIA_TYPES, type MediaType } from '../types';

/**
 * Create a record: pick what it is, name it. One sheet, reused wherever a
 * record is created.
 */
export function AddRecordSheet({
  visible,
  onClose,
  onSubmit,
  initialType = 'movie',
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (mediaType: MediaType, title: string) => void;
  initialType?: MediaType;
}) {
  const [mediaType, setMediaType] = useState<MediaType>(initialType);
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (visible) {
      setMediaType(initialType);
      setTitle('');
    }
  }, [visible, initialType]);

  const canSubmit = title.trim().length > 0;
  const submit = () => {
    if (!canSubmit) return;
    onSubmit(mediaType, title.trim());
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="New record"
      subtitle="Pick what it is and name it. Then stamp logs on it whenever something happens."
    >
      <Row gap={2}>
        {MEDIA_TYPES.map(t => (
          <Chip
            key={t}
            label={MEDIA_LABEL[t]}
            active={mediaType === t}
            tint={MEDIA_COLOR[t]}
            onPress={() => setMediaType(t)}
          />
        ))}
      </Row>

      <Field
        label="Name"
        placeholder="e.g. Breaking Bad"
        value={title}
        onChangeText={setTitle}
        autoFocus
        returnKeyType="done"
        onSubmitEditing={submit}
      />

      <Row gap={2} justify="flex-end">
        <Button label="Cancel" variant="ghost" onPress={onClose} />
        <Button label="Create" onPress={submit} disabled={!canSubmit} />
      </Row>
    </Sheet>
  );
}
