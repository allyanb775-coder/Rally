import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Arena } from '@/components/Arena';
import { Scoreboard } from '@/components/Scoreboard';
import { Button, Icon } from '@/components/ui';
import { colors, fonts, radius, space } from '@/constants/theme';
import { setsFromScore, teams } from '@/lib/result';
import { useStore } from '@/lib/store';
import { Team } from '@/lib/types';

/** Winners' poster: a dark arena, «أبطال» in huge type, the event and the final scoreboard. */
export default function Champions() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { matches, players } = useStore();
  const m = matches.find((x) => x.id === id);
  const rise = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(rise, { toValue: 1, friction: 7, tension: 40, useNativeDriver: false }).start();
  }, [rise]);

  if (!m?.result || m.result.status !== 'confirmed') {
    return (
      <View style={{ flex: 1, backgroundColor: '#05060C' }}>
        <Stack.Screen options={{ headerShown: false }} />
      </View>
    );
  }
  const r = m.result;
  const t = teams(m);
  const names = { 1: t[1].map((p) => players[p]?.name ?? ''), 2: t[2].map((p) => players[p]?.name ?? '') } as Record<Team, string[]>;
  const winners = names[r.winningTeam];
  const year = new Date(m.startsAt).getFullYear();
  const event = `${m.court.toUpperCase()} · ${m.city} · ${year}`;

  const share = () => {
    const message = `🏆 أبطال ${m.court} — ${winners.join(' و ')} (${r.score}) على Rally`;
    if (Platform.OS === 'web') (navigator as any).share?.({ text: message });
    else Share.share({ message });
  };

  const scale = rise.interpolate({ inputRange: [0, 1], outputRange: [1.25, 1] });
  return (
    <View style={{ flex: 1, backgroundColor: '#05060C', overflow: 'hidden' }}>
      <Stack.Screen options={{ headerShown: false }} />
      <Arena />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={s.top}>
          <Pressable onPress={() => router.back()} style={s.close} accessibilityLabel="إغلاق">
            <Icon name="close" size={20} />
          </Pressable>
        </View>

        <View style={s.hero}>
          <Text style={s.event}>{event}</Text>
          <Animated.Text style={[s.title, { opacity: rise, transform: [{ scale }] }]} adjustsFontSizeToFit numberOfLines={1}>
            أبطال
          </Animated.Text>
          <Text style={s.names}>{winners.join('  ·  ')}</Text>
        </View>

        <View style={s.bottom}>
          <Scoreboard teams={names} sets={setsFromScore(r.score, r.winningTeam)} status="النتيجة النهائية" venue={m.court} />
          <Button title="شاركها ستوري" icon="share" onPress={share} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: space(4), paddingTop: space(2) },
  close: { width: 44, height: 44, borderRadius: radius.sm, borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center' },
  hero: { alignItems: 'center', paddingHorizontal: space(4), marginTop: space(6) },
  event: { fontFamily: fonts.bold, fontSize: 14, letterSpacing: 2, color: '#E5E7EB', textAlign: 'center' },
  title: {
    fontFamily: fonts.black,
    fontSize: 96,
    lineHeight: 160,
    color: '#FFFFFF',
    textAlign: 'center',
    width: '100%',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 18,
    textShadowOffset: { width: 0, height: 6 },
  },
  names: { fontFamily: fonts.kufi, fontSize: 18, lineHeight: 32, color: colors.led, textAlign: 'center' },
  bottom: { marginTop: 'auto', paddingHorizontal: space(4), paddingBottom: space(4), gap: space(3), width: '100%', maxWidth: 560, alignSelf: 'center' },
});
