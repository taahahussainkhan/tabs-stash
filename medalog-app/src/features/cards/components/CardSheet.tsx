import React from 'react';
import { ScrollView, View } from 'react-native';
import { Badge, Button, Row, Sheet, Stack, Text, color, space, useToast } from '../../../design';
import { formatDateTime } from '../../../core/format';
import { openUrl } from '../../../core/link';
import { cardHeading, cardTint, type CardItem } from '../types';

/**
 * Full-card view. A note can be long, so the sheet scrolls and the source link
 * (if the extension captured one) is one tap away.
 */
export function CardSheet({
  card,
  visible,
  onClose,
  onTogglePin,
  onDelete,
}: {
  card: CardItem | null;
  visible: boolean;
  onClose: () => void;
  onTogglePin: (card: CardItem) => void;
  onDelete?: (card: CardItem) => void;
}) {
  const toast = useToast();

  return (
    <Sheet
      visible={visible && !!card}
      onClose={onClose}
      title={card ? cardHeading(card) : 'Card'}
      subtitle={card ? formatDateTime(card.savedAt) : undefined}
      scrollable
    >
      {card ? (
        <>
          <View
            style={{
              borderLeftWidth: 3,
              borderLeftColor: cardTint(card.color).border,
              paddingLeft: space(3),
            }}
          >
            <ScrollView style={{ maxHeight: 320 }}>
              <Text variant="body">{card.content}</Text>
            </ScrollView>
          </View>

          {card.tags?.length ? (
            <Row gap={2} wrap>
              {card.tags.map(tag => (
                <Badge key={tag} label={`#${tag}`} tint={color.textMuted} />
              ))}
            </Row>
          ) : null}

          <Stack gap={2}>
            <Button
              label={card.isPinned ? 'Unpin card' : 'Pin to top'}
              variant="secondary"
              onPress={() => onTogglePin(card)}
            />
            {card.sourceUrl ? (
              <Button
                label="Open source page"
                variant="ghost"
                onPress={async () => {
                  const opened = await openUrl(card.sourceUrl!);
                  if (!opened) toast.show('Could not open that link.', 'danger');
                }}
              />
            ) : null}
            {onDelete ? (
              <Button label="Delete card" variant="danger" onPress={() => onDelete(card)} />
            ) : null}
          </Stack>
        </>
      ) : null}
    </Sheet>
  );
}
