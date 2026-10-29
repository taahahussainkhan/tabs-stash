import React from 'react';
import { Pressable } from 'react-native';
import { Badge, Poster, Row, Stack, Text, color, radius, space } from '../../../design';
import type { BookItem } from '../types';

/** One physical book in the library list. */
export function BookRow({ book, onPress }: { book: BookItem; onPress: () => void }) {
  const facts = [book.publisher, book.publishYear ? String(book.publishYear) : undefined, book.format]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={book.title}
      android_ripple={{ color: 'rgba(255,255,255,0.05)' }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: space(3),
        backgroundColor: color.surface,
        borderColor: color.border,
        borderWidth: 1,
        borderRadius: radius.lg,
        padding: space(2.5),
        marginBottom: space(2),
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <Poster uri={book.cover} width={44} height={66} tint={color.book} glyph="▥" />

      <Stack flex={1} gap={1}>
        <Text variant="bodyStrong" numberOfLines={2}>
          {book.title}
        </Text>
        {book.authors.length ? (
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {book.authors.join(', ')}
          </Text>
        ) : null}
        {facts ? (
          <Text variant="caption" tone="faint" numberOfLines={1}>
            {facts}
          </Text>
        ) : null}
        {book.isLent || book.isSigned ? (
          <Row gap={2} style={{ marginTop: space(1) }}>
            {book.isLent ? <Badge label={book.lentTo ? `LENT · ${book.lentTo}` : 'LENT'} tint={color.warning} /> : null}
            {book.isSigned ? <Badge label="SIGNED" tint={color.success} /> : null}
          </Row>
        ) : null}
      </Stack>

      <Text style={{ color: color.textFaint, fontSize: 20 }}>›</Text>
    </Pressable>
  );
}
