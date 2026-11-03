import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable } from 'react-native';
import { MatchCard } from '@/components/MatchCard';
import { Button, Pill, Row, Screen, T } from '@/components/ui';
import { useStore } from '@/lib/store';
import { MATCH_SIZE } from '@/lib/types';

type Filter = 'all' | 'mine-level' | 'competitive';
const filters: { key: Filter; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'mine-level', label: 'بمستواي' },
  { key: 'competitive', label: 'تنافسية' },
];

export default function Matches() {
  const { matches, me } = useStore();
  const [filter, setFilter] = useState<Filter>('all');
  const list = matches
    .filter((m) => m.playerIds.length < MATCH_SIZE && new Date(m.startsAt) > new Date())
    .filter((m) => (filter === 'mine-level' ? me.level >= m.minLevel && me.level <= m.maxLevel : true))
    .filter((m) => (filter === 'competitive' ? m.kind === 'competitive' : true))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  return (
    <Screen>
      <T variant="h1">المباريات المفتوحة</T>
      <Row>
        {filters.map((f) => (
          <Pressable key={f.key} onPress={() => setFilter(f.key)}>
            <Pill label={f.label} active={filter === f.key} />
          </Pressable>
        ))}
      </Row>
      {list.length === 0 && <T variant="muted">ما فيه مباريات مفتوحة بهالفلتر.</T>}
      {list.map((m) => (
        <MatchCard key={m.id} match={m} />
      ))}
      <Button title="افتح مباراة" icon="plus" onPress={() => router.push('/create-match')} />
    </Screen>
  );
}
