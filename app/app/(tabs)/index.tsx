import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { MatchCard } from '@/components/MatchCard';
import { HIGH_FIVE_HERO, Photo } from '@/components/Photo';
import { SwipeDeck } from '@/components/SwipeDeck';
import { Button, Heading, Lined, Row, Screen, SectionHeader, T } from '@/components/ui';
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
  const firstName = me.name === 'أنت' ? 'يا بطل' : me.name;

  return (
    <Screen tabBar>
      <View style={s.bleed}>
        <Photo source={HIGH_FIVE_HERO.source} aspect={HIGH_FIVE_HERO.aspect} style={{ borderRadius: 0 }}>
          <LinearGradient colors={['rgba(0,0,0,0.35)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.6)', '#000']} locations={[0, 0.25, 0.7, 1]} style={StyleSheet.absoluteFill} />
          <Row style={s.heroBar}>
            <T style={s.brand}>RALLY · QASSIM</T>
            <Pressable onPress={() => router.push('/profile')} style={s.avatar} accessibilityLabel="ملفي">
              <T style={{ fontFamily: fonts.bold, fontSize: 16, lineHeight: 22, color: '#000' }}>{me.name[0]}</T>
            </Pressable>
          </Row>
          <View style={s.heroText}>
            <T style={s.heroTitle}>READY TO{'\n'}PLAY?</T>
            <T style={s.heroHello}>{greeting()} {firstName} · لاقِ شريكك والعب بمستواك</T>
          </View>
        </Photo>
      </View>

      <Row style={s.stats}>
        <Stat label="LEVEL" value={me.level.toFixed(1)} accent />
        <View style={s.statSep} />
        <Stat label="TONIGHT" value={String(tonight.length)} />
        <View style={s.statSep} />
        <Stat label="OPEN SPOTS" value={String(missing.length)} />
      </Row>

      {awaiting.length > 0 && (
        <View style={{ gap: space(3) }}>
          <Heading en="Awaiting result" ar="بانتظار النتيجة" />
          {awaiting.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </View>
      )}

      <Heading en="Play now" ar="العب الحين · اسحب يمين تنضم، يسار للي بعدها" />

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

      {mine.length > 0 && (
        <View>
          <SectionHeader title="مبارياتي" en="My matches" />
          {mine.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </View>
      )}
    </Screen>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={s.stat}>
      <T style={[s.statValue, accent && { color: colors.blue }]}>{value}</T>
      <T style={s.statLabel}>{label}</T>
    </View>
  );
}

const s = StyleSheet.create({
  bleed: { marginHorizontal: -space(4), marginTop: -space(3) },
  heroBar: { position: 'absolute', top: space(4), left: space(4), right: space(4), justifyContent: 'space-between' },
  brand: { fontFamily: fonts.display, fontSize: 14, letterSpacing: 3, color: '#FFFFFF', writingDirection: 'ltr' },
  stats: { alignItems: 'stretch', borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingVertical: space(3), marginTop: -space(2) },
  statSep: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontFamily: fonts.display, fontSize: 34, lineHeight: 42, textAlign: 'center' },
  statLabel: { fontFamily: fonts.display, fontSize: 11, letterSpacing: 1.5, lineHeight: 14, color: colors.muted, textAlign: 'center' },
  heroText: { position: 'absolute', bottom: space(5), left: space(5), right: space(5) },
  heroHello: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: 'rgba(255,255,255,0.8)', marginTop: 6 },
  heroTitle: { fontFamily: fonts.display, fontSize: 64, lineHeight: 66, color: '#FFFFFF', writingDirection: 'ltr', textAlign: Platform.OS === 'web' ? 'right' : 'left' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
});
