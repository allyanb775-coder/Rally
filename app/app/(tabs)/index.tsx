import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Led, ledLevel, ledNum } from '@/components/Led';
import { MatchCard } from '@/components/MatchCard';
import { SwipeDeck } from '@/components/SwipeDeck';
import { Board, Button, Lined, Row, Screen, SectionHeader, T } from '@/components/ui';
import { colors, fonts, space } from '@/constants/theme';
import { rankMatches } from '@/lib/findMatch';
import { needsResult } from '@/lib/result';
import { greeting, sameDay } from '@/lib/format';
import { useStore } from '@/lib/store';
import { MATCH_SIZE } from '@/lib/types';

export default function Home() {
  const { me, matches, joinMatch } = useStore();
  const now = new Date();
  const upcoming = matches.filter((m) => new Date(m.startsAt) > now);
  const tonight = upcoming.filter((m) => sameDay(new Date(m.startsAt), now));
  const missing = upcoming.filter((m) => m.playerIds.length < MATCH_SIZE);
  const mine = upcoming.filter((m) => m.playerIds.includes(me.id));
  const ranked = rankMatches(matches, me, now);
  const awaiting = matches.filter((m) => m.playerIds.includes(me.id) && needsResult(m, now));
  const results = matches
    .filter((m) => m.playerIds.includes(me.id) && m.result?.status === 'confirmed')
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt));
  const firstName = me.name === 'أنت' ? 'يا بطل' : me.name;

  return (
    <Screen tabBar>
      <Board>
        <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Cell label="مباريات الليلة" value={ledNum(tonight.length)} />
          <View style={s.sep} />
          <Cell label="ناقصها لاعب" value={ledNum(missing.length)} />
          <View style={s.sep} />
          <Cell label="مستواك" value={ledLevel(me.level)} />
        </Row>
      </Board>

      <Row style={{ justifyContent: 'space-between' }}>
        <View>
          <T variant="muted">{greeting()}</T>
          <T variant="h1">جاهز {firstName}؟</T>
        </View>
        <Pressable onPress={() => router.push('/profile')} style={s.avatar}>
          <T style={{ fontFamily: fonts.black, fontSize: 18, lineHeight: 34 }}>{me.name[0]}</T>
        </Pressable>
      </Row>

      {awaiting.length > 0 && (
        <View style={{ gap: space(3) }}>
          <Row style={{ gap: 8 }}>
            <View style={[s.lamp, { backgroundColor: colors.danger, shadowColor: colors.danger }]} />
            <T variant="h2">بانتظار النتيجة</T>
          </Row>
          {awaiting.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </View>
      )}

      <Row style={{ gap: 8 }}>
        <View style={s.lamp} />
        <T variant="h2">العب الحين</T>
        <T variant="small">· مباريات تناسب مستواك</T>
      </Row>

      <SwipeDeck
        matches={ranked}
        onOpen={(m) => router.push({ pathname: '/match/[id]', params: { id: m.id } })}
        onJoin={async (m) => {
          await joinMatch(m.id);
          router.push({ pathname: '/match/[id]', params: { id: m.id } });
        }}
        empty={
          <Lined style={{ alignItems: 'center', paddingVertical: space(8) }}>
            <T variant="h2" style={{ textAlign: 'center' }}>ما بقى مباريات تناسبك الحين</T>
            <T variant="muted" style={{ textAlign: 'center' }}>افتح مباراة والباقين ينضمون لك</T>
            <View style={{ alignSelf: 'stretch', marginTop: space(2) }}>
              <Button title="افتح مباراة" icon="plus" onPress={() => router.push('/create-match')} />
            </View>
          </Lined>
        }
      />

      {me.matchesPlayed === 0 && (
        <Pressable onPress={() => router.push('/level')}>
          <Lined style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexShrink: 1 }}>
              <T variant="h3">مستواك مبدئي</T>
              <T variant="small">جاوب 5 أسئلة عشان نطابقك صح</T>
            </View>
            <T style={{ fontFamily: fonts.kufi, color: colors.led, lineHeight: 26 }}>ابدأ ←</T>
          </Lined>
        </Pressable>
      )}

      {results.length > 0 && (
        <View>
          <SectionHeader title="آخر نتائجك" />
          {results.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </View>
      )}

      {mine.length > 0 && (
        <View>
          <SectionHeader title="مبارياتي" />
          {mine.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </View>
      )}
    </Screen>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ gap: 8, alignItems: 'center', flex: 1 }}>
      <T style={s.cellLabel}>{label}</T>
      <Led value={value} dot={4} />
    </View>
  );
}

const s = StyleSheet.create({
  sep: { width: 2, alignSelf: 'stretch', backgroundColor: '#1A2340' },
  cellLabel: { fontFamily: fonts.kufi, fontSize: 10, lineHeight: 18, color: colors.inkMuted, textAlign: 'center' },
  avatar: { width: 46, height: 46, borderRadius: 23, borderWidth: 2, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  lamp: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.led, shadowColor: colors.led, shadowOpacity: 1, shadowRadius: 6 },
});
