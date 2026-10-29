import React from 'react';
import { Poster, Row, Stack, StatGrid, Text, space } from '../../../design';

/**
 * The top of every detail screen: cover, title, subtitle, status chips and a
 * couple of secondary lines. Shared by movies, series and books so all three
 * look like the same product.
 */
export function DetailHero({
  poster,
  tint,
  glyph,
  title,
  subtitle,
  badges,
  lines,
}: {
  poster?: string;
  tint: string;
  glyph: string;
  title: string;
  subtitle?: string;
  badges?: React.ReactNode;
  lines?: string[];
}) {
  return (
    <Row gap={4} align="flex-start" style={{ paddingVertical: space(2) }}>
      <Poster uri={poster} width={96} height={144} tint={tint} glyph={glyph} radiusSize="lg" />
      <Stack flex={1} gap={2}>
        <Text variant="heading" numberOfLines={3}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" tone="muted" numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
        {badges ? (
          <Row gap={2} wrap style={{ marginTop: space(1) }}>
            {badges}
          </Row>
        ) : null}
        {lines?.filter(Boolean).map(line => (
          <Text key={line} variant="caption" tone="faint" numberOfLines={1}>
            {line}
          </Text>
        ))}
      </Stack>
    </Row>
  );
}

/** Label/value tiles for metadata (edition facts, watch facts). */
export function Facts({ items }: { items: Array<{ label: string; value?: string | number | null }> }) {
  return <StatGrid items={items} />;
}
