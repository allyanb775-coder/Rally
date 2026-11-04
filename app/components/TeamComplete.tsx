import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Modal, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, space } from '@/constants/theme';
import { fmtDay, fmtTime } from '@/lib/format';
import { teamOf, teams } from '@/lib/result';
import { useStore } from '@/lib/store';
import { Match, MATCH_SIZE } from '@/lib/types';
import { Button } from './ui';

const SEEN_KEY = 'rally.teamCompleteSeen';
const highFive = require('@/assets/images/high-five.jpg');

/**
 * When one of your upcoming matches reaches four players, show the partners'
 * high-five once: «اكتمل الفريق», who plays with whom, and when.
 */
export function TeamComplete() {
  const { matches, me, players } = useStore();
  const [seen, setSeen] = useState<string[] | null>(null);
  const [current, setCurrent] = useState<Match | null>(null);
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AsyncStorage.getItem(SEEN_KEY)
      .then((v) => setSeen(v ? JSON.parse(v) : []))
      .catch(() => setSeen([]));
  }, []);

  useEffect(() => {
    if (seen === null || current) return;
    const now = Date.now();
    const next = matches.find(
      (m) => m.playerIds.length === MATCH_SIZE && m.playerIds.includes(me.id) && new Date(m.startsAt).getTime() > now && !seen.includes(m.id),
    );
    if (next) {
      setCurrent(next);
      fade.setValue(0);
      Animated.timing(fade, { toValue: 1, duration: 450, useNativeDriver: false }).start();
    }
  }, [matches, me.id, seen, current, fade]);

  const close = (open?: boolean) => {
    if (!current) return;
    const ids = [...(seen ?? []), current.id];
    setSeen(ids);
    AsyncStorage.setItem(SEEN_KEY, JSON.stringify(ids.slice(-100))).catch(() => {});
    const id = current.id;
    setCurrent(null);
    if (open) router.push({ pathname: '/match/[id]', params: { id } });
  };

  if (!current) return null;
  const t = teams(current);
  const mine = teamOf(current, me.id) ?? 1;
  const pair = (ids: string[]) => ids.map((id) => (id === me.id ? 'أنت' : players[id]?.name ?? '')).join(' و ');
  const imageScale = fade.interpolate({ inputRange: [0, 1], outputRange: [1.12, 1] });

  return (
    <Modal visible transparent animationType="none" onRequestClose={() => close()}>
      <Animated.View style={[s.root, { opacity: fade }]}>
        <Animated.Image source={highFive} resizeMode="cover" style={[s.photo, { transform: [{ scale: imageScale }] }]} accessibilityIgnoresInvertColors />
        <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.85)', '#000']} locations={[0.35, 0.7, 1]} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={s.content}>
          <View style={s.text}>
            <Text style={s.kicker}>
              {current.court} · {fmtDay(current.startsAt)} {fmtTime(current.startsAt)}
            </Text>
            <Text style={s.title}>اكتمل الفريق</Text>
            <Text style={s.pairs}>
              <Text style={{ color: colors.led }}>{pair(t[mine])}</Text>
              <Text style={s.vs}>  ضد  </Text>
              <Text>{pair(t[mine === 1 ? 2 : 1])}</Text>
            </Text>
          </View>
          <View style={{ gap: space(3) }}>
            <Button title="شوف المباراة" onPress={() => close(true)} />
            <Button title="تمام" variant="ghost" onPress={() => close()} />
          </View>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  photo: { ...StyleSheet.absoluteFill, width: '100%', height: '75%' } as any,
  content: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: space(5), paddingBottom: space(6), width: '100%', maxWidth: 560, alignSelf: 'center' },
  text: { gap: space(2), marginBottom: space(6) },
  kicker: { fontFamily: fonts.bold, fontSize: 13, letterSpacing: 1, color: 'rgba(255,255,255,0.75)', textAlign: 'center' },
  title: { fontFamily: fonts.black, fontSize: 48, lineHeight: 84, color: '#FFFFFF', textAlign: 'center' },
  pairs: { fontFamily: fonts.kufi, fontSize: 17, lineHeight: 30, color: '#FFFFFF', textAlign: 'center' },
  vs: { color: 'rgba(255,255,255,0.6)', fontFamily: fonts.bold, fontSize: 14 },
});
