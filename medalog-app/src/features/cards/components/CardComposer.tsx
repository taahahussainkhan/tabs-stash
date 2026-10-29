import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button, Field, Row, Sheet, Text, color, radius, space } from '../../../design';
import { CARD_COLORS, cardTint, type CardColor, type CardDraft } from '../types';

/**
 * Create a quick card - the mobile twin of the extension's flash-card composer.
 *
 * One component, used by the capture FAB and anywhere else a note is written,
 * so the colour palette and validation live in exactly one place.
 */
export function CardComposer({
  visible,
  onClose,
  onSubmit,
  saving,
  mode = 'card',
  initialColor = 'charcoal',
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (draft: CardDraft) => void;
  saving?: boolean;
  /** same form, different intent - keeps one composer for cards and notes */
  mode?: 'card' | 'note';
  initialColor?: CardColor;
}) {
  const isNote = mode === 'note';
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tint, setTint] = useState<CardColor>(initialColor);

  useEffect(() => {
    if (visible) {
      setTitle('');
      setContent('');
      setTint(initialColor);
    }
  }, [visible, initialColor]);

  const canSave = content.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    onSubmit({ title: title.trim(), content: content.trim(), color: tint });
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={isNote ? 'New note' : 'New card'}
      subtitle={
        isNote
          ? 'A timestamped thought. It lands on the shelf with your other cards.'
          : 'A thought, a quote, a link to follow up. It syncs to the extension.'
      }
      scrollable
    >
      <Field
        label="Title"
        placeholder="Optional"
        value={title}
        onChangeText={setTitle}
        returnKeyType="next"
      />

      <Field
        label={isNote ? 'Note' : 'Card'}
        placeholder="Write the note…"
        value={content}
        onChangeText={setContent}
        multiline
        textAlignVertical="top"
        style={{ minHeight: 132 }}
        autoFocus={!title}
      />

      <View style={{ gap: space(2) }}>
        <Text variant="label">Colour</Text>
        <Row gap={2.5} wrap>
          {CARD_COLORS.map(option => {
            const swatch = cardTint(option.value);
            const active = tint === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => setTint(option.value)}
                accessibilityRole="button"
                accessibilityLabel={option.label}
                accessibilityState={{ selected: active }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: radius.pill,
                  backgroundColor: swatch.bg,
                  borderWidth: active ? 3 : 1,
                  borderColor: active ? color.accent : swatch.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {active ? <Text style={{ fontSize: 13, color: color.accent }}>✓</Text> : null}
              </Pressable>
            );
          })}
        </Row>
      </View>

      <Row gap={2} justify="flex-end">
        <Button label="Cancel" variant="ghost" onPress={onClose} />
        <Button label={isNote ? 'Save note' : 'Save card'} onPress={save} disabled={!canSave} loading={saving} />
      </Row>
    </Sheet>
  );
}
