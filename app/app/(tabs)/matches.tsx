import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { MatchCard } from '@/components/MatchCard';
import { Card, Chip, Row, Screen, T } from '@/components/ui';
import { colors, fonts, radius, space } from '@/constants/theme';
import { fmtNum, sameDay } from '@/lib/format';
import { useStore } from '@/lib/store';
import { MATCH_SIZE } from '@/lib/types';

type Filter = 'mine-level' | 'my-city' | 'competitive';

export default function Matches() {
  const { matches, me } = useStore();
  const [filters, setFilters] = useState<Filter[]>([]);
  const [day, setDay] = useState<Date | null>(null);
  const now = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    return d;
  });
  const toggle = (f: Filter) => setFilters((fs) => (fs.includes(f) ? fs.filter((x) => x !== f) : [...fs, f]));

  const open = matches.filter((m) => m.playerIds.length < MATCH_SIZE && new Date(m.startsAt) > now);
  const list = open
    .filter((m) => (day ? sameDay(new Date(m.startsAt), day) : true))
    .filter((m) => (filters.includes('mine-level') ? me.level >= m.minLevel && me.level <= m.maxLevel : true))
    .filter((m) => (filters.includes('my-city') ? m.city === me.city : true))
    .filter((m) => (filters.includes('competitive') ? m.kind === 'competitive' : true))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  return (
    <Screen tabBar>
      <View>
        <T variant="h1">المباريات</T>
        <T variant="muted">{fmtNum(open.length)} مباراة مفتوحة في القصيم</T>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space(2) }}>
        <Pressable onPress={() => setDay(null)} style={[s.day, !day && s.dayActive]}>
          <T style={[s.dayName, !day && s.activeInk]}>كل</T>
          <T style={[s.dayNum, !day && s.activeInk]}>الأيام</T>
        </Pressable>
        {days.map((d, i) => {
          const active = !!day && sameDay(d, day);
          const count = open.filter((m) => sameDay(new Date(m.startsAt), d)).length;
          return (
            <Pressable key={i} onPress={() => setDay(d)} style={[s.day, active && s.dayActive]}>
              <T style={[s.dayName, active && s.activeInk]}>{i === 0 ? 'اليوم' : d.toLocaleDateString('ar-SA', { weekday: 'short' })}</T>
              <T style={[s.dayNum, active && s.activeInk]}>{fmtNum(d.getDate())}</T>
              <View style={[s.dot, { opacity: count ? 1 : 0 }, active && { backgroundColor: colors.accentInk }]} />
            </Pressable>
          );
        })}
      </ScrollView>

      <Row style={{ flexWrap: 'wrap' }}>
        <Chip label="بمستواي" icon="chart" active={filters.includes('mine-level')} onPress={() => toggle('mine-level')} />
        <Chip label="بمدينتي" icon="pin" active={filters.includes('my-city')} onPress={() => toggle('my-city')} />
        <Chip label="تنافسية" icon="trophy" active={filters.includes('competitive')} onPress={() => toggle('competitive')} />
      </Row>

      {list.length === 0 && (
        <Card style={{ alignItems: 'center', paddingVertical: space(8) }}>
          <T variant="h3">ما فيه مباريات بهالاختيار</T>
          <T variant="muted">جرّب يوم ثاني، أو افتح مباراة من زر +</T>
        </Card>
      )}
      {list.map((m) => (
        <MatchCard key={m.id} match={m} />
      ))}
    </Screen>
  );
}

const s = StyleSheet.create({
  day: { width: 64, height: 78, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', gap: 2 },
  dayActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  dayName: { fontFamily: fonts.medium, fontSize: 12, color: colors.muted, textAlign: 'center' },
  dayNum: { fontFamily: fonts.extra, fontSize: 20, textAlign: 'center' },
  activeInk: { color: colors.accentInk },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.accent },
});
