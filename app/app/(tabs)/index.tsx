import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { LevelMeter } from '@/components/LevelMeter';
import { MatchCard } from '@/components/MatchCard';
import { Card, Icon, Row, Screen, SectionHeader, T } from '@/components/ui';
import { colors, fonts, radius, space } from '@/constants/theme';
import { findBestMatch } from '@/lib/findMatch';
import { greeting } from '@/lib/format';
import { useStore } from '@/lib/store';
import { Match, MATCH_SIZE } from '@/lib/types';

export default function Home() {
  const { me, matches } = useStore();
  const [found, setFound] = useState<Match | null | undefined>(undefined);
  const now = new Date();
  const upcoming = matches.filter((m) => new Date(m.startsAt) > now);
  const mine = upcoming.filter((m) => m.playerIds.includes(me.id));
  const open = upcoming.filter((m) => m.playerIds.length < MATCH_SIZE && !m.playerIds.includes(me.id));

  return (
    <Screen tabBar>
      <Row style={{ justifyContent: 'space-between' }}>
        <View>
          <T variant="muted">{greeting()}</T>
          <T variant="h1">{me.name === 'أنت' ? 'يا بطل' : me.name}</T>
        </View>
        <Pressable onPress={() => router.push('/profile')} style={s.avatar}>
          <T style={{ fontFamily: fonts.black, fontSize: 20, color: colors.accentInk }}>{me.name[0]}</T>
        </Pressable>
      </Row>

      <Pressable onPress={() => setFound(findBestMatch(matches, me))} style={({ pressed }) => [pressed && { transform: [{ scale: 0.98 }] }]}>
        <LinearGradient colors={[colors.accent, '#A8E61D']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
          <View style={s.ball} />
          <View style={[s.ball, s.ballSeam]} />
          <T style={s.heroKicker}>ضغطة وحدة</T>
          <T style={s.heroTitle}>العب{'\n'}الحين</T>
          <Row style={{ justifyContent: 'space-between', marginTop: space(2) }}>
            <T style={s.heroSub}>أقرب مباراة بمستواك وناقصها لاعب</T>
            <View style={s.heroBtn}>
              <Icon name="bolt" size={22} color={colors.accent} />
            </View>
          </Row>
        </LinearGradient>
      </Pressable>

      {found === null && (
        <Card>
          <T variant="h3">ما فيه مباراة مفتوحة بمستواك الحين</T>
          <T variant="muted">افتح مباراة من زر + وخل الباقين ينضمون لك.</T>
        </Card>
      )}
      {found && (
        <View style={{ gap: space(3) }}>
          <SectionHeader title="هذي تناسبك 🎾" />
          <MatchCard match={found} highlight />
        </View>
      )}

      <Card style={{ padding: space(5) }}>
        <LevelMeter level={me.level} />
        {me.matchesPlayed === 0 && (
          <Pressable onPress={() => router.push('/level')} style={s.inline}>
            <Icon name="chart" size={16} color={colors.accent} />
            <T style={{ color: colors.accent, fontFamily: fonts.bold }}>حدد مستواك بـ٥ أسئلة</T>
          </Pressable>
        )}
      </Card>

      {mine.length > 0 && (
        <>
          <SectionHeader title="مبارياتي" />
          {mine.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </>
      )}

      {open.length > 0 && (
        <>
          <SectionHeader title="ناقصها لاعبين" action="الكل" onAction={() => router.push('/matches')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space(3) }} style={{ marginHorizontal: -space(5) }} contentInset={{ left: space(5), right: space(5) }}>
            <View style={{ width: space(2) }} />
            {open.map((m) => (
              <MatchCard key={m.id} match={m} compact />
            ))}
            <View style={{ width: space(2) }} />
          </ScrollView>
        </>
      )}
    </Screen>
  );
}

const s = StyleSheet.create({
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  hero: { borderRadius: radius.lg, padding: space(6), overflow: 'hidden', minHeight: 210 },
  heroKicker: { fontFamily: fonts.bold, fontSize: 13, color: colors.accentInk, opacity: 0.7 },
  heroTitle: { fontFamily: fonts.black, fontSize: 48, lineHeight: 52, color: colors.accentInk },
  heroSub: { fontFamily: fonts.medium, fontSize: 14, color: colors.accentInk, flexShrink: 1 },
  heroBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.accentInk, alignItems: 'center', justifyContent: 'center' },
  ball: { position: 'absolute', width: 220, height: 220, borderRadius: 110, borderWidth: 18, borderColor: 'rgba(10,13,5,0.07)', left: -70, top: -60 },
  ballSeam: { width: 300, height: 300, borderRadius: 150, borderWidth: 3, left: -110, top: -100 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space(2) },
});
