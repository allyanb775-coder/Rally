import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Led, ledNum } from '@/components/Led';
import { MatchCard } from '@/components/MatchCard';
import { Chip, Heading, Lined, Row, Screen, T } from '@/components/ui';
import { colors, fonts, space } from '@/constants/theme';
import { sameDay } from '@/lib/format';
import { levelFits } from '@/lib/level';
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
    .filter((m) => (filters.includes('mine-level') ? levelFits(me.level, m) : true))
    .filter((m) => (filters.includes('my-city') ? m.city === me.city : true))
    .filter((m) => (filters.includes('competitive') ? m.kind === 'competitive' : true))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  return (
    <Screen tabBar>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Heading en="Matches" ar="المباريات المفتوحة في القصيم" size="xl" />
        <View style={s.count}>
          <Led value={ledNum(list.length)} dot={4} color="#FFFFFF" />
        </View>
      </Row>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space(2) }}>
        <Pressable onPress={() => setDay(null)} style={[s.day, !day && s.dayOn]}>
          <T style={[s.dayName, !day && s.ink]}>كل</T>
          <T style={[s.dayAll, !day && s.ink]}>الأيام</T>
        </Pressable>
        {days.map((d, i) => {
          const on = !!day && sameDay(d, day);
          const n = open.filter((m) => sameDay(new Date(m.startsAt), d)).length;
          return (
            <Pressable key={i} onPress={() => setDay(d)} style={[s.day, on && s.dayOn]}>
              <T style={[s.dayName, on && s.ink]}>{i === 0 ? 'اليوم' : d.toLocaleDateString('ar-SA-u-nu-latn', { weekday: 'short' })}</T>
              <Led value={ledNum(d.getDate())} dot={3} color={on ? colors.ink : colors.led} off={false} />
              <View style={[s.pip, { opacity: n ? 1 : 0 }, on && { backgroundColor: colors.ink }]} />
            </Pressable>
          );
        })}
      </ScrollView>

      <Row style={{ flexWrap: 'wrap' }}>
        <Chip label="بمستواي" active={filters.includes('mine-level')} onPress={() => toggle('mine-level')} />
        <Chip label="بمدينتي" active={filters.includes('my-city')} onPress={() => toggle('my-city')} />
        <Chip label="تنافسية" active={filters.includes('competitive')} onPress={() => toggle('competitive')} />
      </Row>

      <View style={{ gap: space(3) }}>
        {list.length === 0 ? (
          <Lined style={{ alignItems: 'center', paddingVertical: space(8) }}>
            <T variant="h3">ما فيه مباريات بهالاختيار</T>
            <T variant="muted">جرّب يوم ثاني، أو افتح مباراة من زر +</T>
          </Lined>
        ) : (
          list.map((m) => <MatchCard key={m.id} match={m} />)
        )}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  count: { backgroundColor: colors.blue, paddingHorizontal: 14, paddingVertical: 4, borderRadius: 999 },
  day: { width: 62, height: 84, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', backgroundColor: 'transparent', borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 6 },
  dayOn: { backgroundColor: colors.led, borderColor: colors.led },
  dayName: { fontFamily: fonts.kufi, fontSize: 10, lineHeight: 18, textAlign: 'center' },
  dayAll: { fontFamily: fonts.black, fontSize: 14, lineHeight: 26, textAlign: 'center' },
  ink: { color: colors.ink },
  pip: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.led },
});
