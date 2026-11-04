import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { MatchCard } from '@/components/MatchCard';
import { HIGH_FIVE_WIDE, Photo } from '@/components/Photo';
import { SwipeDeck } from '@/components/SwipeDeck';
import { Button, Lined, Row, Screen, SectionHeader, T } from '@/components/ui';
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
      <Photo source={HIGH_FIVE_WIDE.source} aspect={HIGH_FIVE_WIDE.aspect}>
        <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.75)']} locations={[0.45, 1]} style={StyleSheet.absoluteFill} />
        <Pressable onPress={() => router.push('/profile')} style={[s.avatar, s.heroAvatar]} accessibilityLabel="ملفي">
          <T style={{ fontFamily: fonts.bold, fontSize: 18, lineHeight: 24, color: colors.ink }}>{me.name[0]}</T>
        </Pressable>
        <View style={s.heroText}>
          <T style={s.heroHello}>{greeting()}</T>
          <T style={s.heroTitle}>جاهز {firstName}؟</T>
        </View>
      </Photo>

      <Row style={{ gap: space(2) }}>
        <Stat label="مستواك" value={me.level.toFixed(1)} accent />
        <Stat label="مباريات الليلة" value={String(tonight.length)} />
        <Stat label="ناقصها لاعب" value={String(missing.length)} />
      </Row>

      {awaiting.length > 0 && (
        <View style={{ gap: space(3) }}>
          <T variant="h2">بانتظار النتيجة</T>
          {awaiting.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </View>
      )}

      <View>
        <T variant="h2">العب الحين</T>
        <T variant="small">مباريات تناسب مستواك، اسحب يمين تنضم</T>
      </View>

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
          <SectionHeader title="مبارياتي" />
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
      <T style={[s.statValue, accent && { color: colors.led }]}>{value}</T>
      <T style={s.statLabel}>{label}</T>
    </View>
  );
}

const s = StyleSheet.create({
  stat: { flex: 1, backgroundColor: '#13203F', borderRadius: 14, paddingVertical: space(3), alignItems: 'center', gap: 2 },
  statValue: { fontFamily: fonts.bold, fontSize: 22, lineHeight: 28, textAlign: 'center' },
  statLabel: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 16, color: colors.muted, textAlign: 'center' },
  heroText: { position: 'absolute', bottom: space(4), left: space(4), right: space(4) },
  heroAvatar: { position: 'absolute', top: space(4), left: space(4) },
  heroHello: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: 'rgba(255,255,255,0.75)' },
  heroTitle: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 32, color: '#FFFFFF' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.led, alignItems: 'center', justifyContent: 'center' },
});
