import React from 'react';
import { ScrollView, View } from 'react-native';
import {
  Badge,
  ErrorState,
  ListRow,
  Screen,
  ScreenHeader,
  SectionLabel,
  Spinner,
  Surface,
  Text,
  color,
  space,
} from '../../../design';
import { formatDate, formatRange } from '../../../core/format';
import { DetailHero, Facts } from '../components/DetailHero';
import { useBookDetail } from '../hooks';
import { STATUS_TINT, statusLabel } from '../types';

/** One physical copy: edition data, ownership, lending and reading history. */
export function BookDetailScreen({ id, onBack }: { id: string; onBack: () => void }) {
  const query = useBookDetail(id);

  if (query.isPending) {
    return (
      <Screen padded={false}>
        <View style={{ paddingHorizontal: space(4) }}>
          <ScreenHeader title="Book" onBack={onBack} />
        </View>
        <Spinner label="Loading book…" />
      </Screen>
    );
  }

  if (query.isError || !query.data) {
    return (
      <Screen padded={false}>
        <View style={{ paddingHorizontal: space(4) }}>
          <ScreenHeader title="Book" onBack={onBack} />
        </View>
        <ErrorState error={query.error} onRetry={query.refetch} />
      </Screen>
    );
  }

  const { item, sessions } = query.data;
  const price =
    item.paidPrice !== undefined
      ? `${item.currency ?? ''} ${item.paidPrice}`.trim()
      : undefined;

  return (
    <Screen padded={false} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: space(4), paddingBottom: space(10) }}>
        <ScreenHeader title="Book" onBack={onBack} />

        <DetailHero
          poster={item.cover}
          tint={color.book}
          glyph="▥"
          title={item.title}
          subtitle={[item.subtitle, item.authors.join(', ')].filter(Boolean).join(' · ')}
          badges={
            <>
              {item.isLent ? (
                <Badge label={item.lentTo ? `LENT · ${item.lentTo.toUpperCase()}` : 'LENT OUT'} tint={color.warning} />
              ) : null}
              {item.isSigned ? <Badge label="SIGNED" tint={color.success} /> : null}
              {item.format ? <Badge label={item.format.toUpperCase()} tint={color.book} /> : null}
              {item.ownership ? <Badge label={item.ownership.toUpperCase()} tint={color.textMuted} /> : null}
            </>
          }
          lines={[
            [item.publisher, item.publishYear].filter(Boolean).join(' · '),
            item.pageCount ? `${item.pageCount} pages` : '',
            item.genres.join(' · '),
          ]}
        />

        <SectionLabel>EDITION</SectionLabel>
        <Facts
          items={[
            { label: 'Publisher', value: item.publisher },
            { label: 'Published', value: item.publishYear },
            { label: 'Pages', value: item.pageCount },
            { label: 'Language', value: item.language },
            { label: 'Format', value: item.format },
            { label: 'ISBN', value: item.isbn },
            { label: 'Condition', value: item.condition },
            { label: 'Acquired', value: item.acquiredAt ? formatDate(item.acquiredAt) : null },
            { label: 'Paid', value: price },
            { label: 'Owner status', value: item.ownership },
          ]}
        />

        <SectionLabel>{`READING (${sessions.length})`}</SectionLabel>
        {sessions.length ? (
          sessions
            .slice()
            .reverse()
            .map(session => (
              <ListRow
                key={session.id}
                accent={STATUS_TINT[session.status]}
                title={`${statusLabel(session.status, 'book')}${session.isRewatch ? ' · reread' : ''}`}
                subtitle={formatRange(session.startedAt, session.endedAt)}
                meta={session.rating ? `★ ${session.rating}` : undefined}
              />
            ))
        ) : (
          <Text variant="caption" tone="muted" style={{ marginBottom: space(2) }}>
            No reading sessions logged yet.
          </Text>
        )}

        {item.notes ? (
          <>
            <SectionLabel>NOTES</SectionLabel>
            <Surface padding={4}>
              <Text variant="body">{item.notes}</Text>
            </Surface>
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
