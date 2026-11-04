import { useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, View } from 'react-native';
import { colors, fonts, radius, space } from '@/constants/theme';
import { fmtDay, fmtLevel } from '@/lib/format';
import { Match } from '@/lib/types';
import { Court } from './Court';
import { Led, ledTime } from './Led';
import { Icon, Row, T } from './ui';

const THRESHOLD = 110;

/**
 * «العب الحين»: a stack of matches. Swipe right (or tap ✓) to join, left (or ✕) for the next one.
 * Directions are physical, like any card stack, regardless of RTL.
 */
export function SwipeDeck({ matches, onJoin, onOpen, empty }: { matches: Match[]; onJoin: (m: Match) => void; onOpen: (m: Match) => void; empty: React.ReactNode }) {
  const [skipped, setSkipped] = useState<string[]>([]);
  const queue = matches.filter((m) => !skipped.includes(m.id));
  const pos = useRef(new Animated.ValueXY()).current;
  const top = queue[0];
  const topRef = useRef(top);
  topRef.current = top;

  const fling = (dir: 1 | -1) => {
    const m = topRef.current;
    if (!m) return;
    Animated.timing(pos, { toValue: { x: dir * 500, y: 40 }, duration: 220, useNativeDriver: false }).start(() => {
      pos.setValue({ x: 0, y: 0 });
      if (dir === 1) onJoin(m);
      else setSkipped((s) => [...s, m.id]);
    });
  };

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: Animated.event([null, { dx: pos.x, dy: pos.y }], { useNativeDriver: false }),
      onPanResponderRelease: (_, g) => {
        if (g.dx > THRESHOLD) fling(1);
        else if (g.dx < -THRESHOLD) fling(-1);
        else Animated.spring(pos, { toValue: { x: 0, y: 0 }, useNativeDriver: false, friction: 6 }).start();
      },
    }),
  ).current;

  if (!top) return <>{empty}</>;

  const rotate = pos.x.interpolate({ inputRange: [-300, 0, 300], outputRange: ['-12deg', '0deg', '12deg'] });
  const joinOpacity = pos.x.interpolate({ inputRange: [0, THRESHOLD], outputRange: [0, 1], extrapolate: 'clamp' });
  const skipOpacity = pos.x.interpolate({ inputRange: [-THRESHOLD, 0], outputRange: [1, 0], extrapolate: 'clamp' });

  return (
    <View style={{ gap: space(4) }}>
      <View style={s.stack}>
        {queue[2] && <View style={[s.ghost, { transform: [{ translateX: -12 }, { translateY: 18 }, { rotate: '-5deg' }] }]} />}
        {queue[1] && <View style={[s.ghost, { transform: [{ translateX: 10 }, { translateY: 9 }, { rotate: '3deg' }], opacity: 0.8 }]} />}
        <Animated.View {...pan.panHandlers} style={[s.card, { transform: [{ translateX: pos.x }, { translateY: pos.y }, { rotate }] }]}>
          <Pressable onPress={() => onOpen(top)} style={{ gap: space(3) }}>
            <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ gap: 6 }}>
                <T variant="label">{fmtDay(top.startsAt)}</T>
                <Led value={ledTime(top.startsAt)} dot={6} />
              </View>
              <T style={[s.kind, top.kind === 'competitive' && s.kindComp]}>{top.kind === 'competitive' ? 'تنافسية' : 'ودية'}</T>
            </Row>
            <Court playerIds={top.playerIds} />
            <Row style={{ justifyContent: 'space-between' }}>
              <View style={{ flexShrink: 1 }}>
                <T variant="h2" numberOfLines={1}>{top.court}</T>
                <T variant="small">{top.city}</T>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <T style={{ fontFamily: fonts.bold, fontSize: 17 }}>
                  {fmtLevel(top.minLevel)}–{fmtLevel(top.maxLevel)}
                </T>
                <T variant="small">المستوى</T>
              </View>
            </Row>
          </Pressable>
          <Animated.View style={[s.stamp, s.stampJoin, { opacity: joinOpacity }]}>
            <T style={[s.stampText, { color: colors.led }]}>انضم</T>
          </Animated.View>
          <Animated.View style={[s.stamp, s.stampSkip, { opacity: skipOpacity }]}>
            <T style={s.stampText}>التالي</T>
          </Animated.View>
        </Animated.View>
      </View>

      <Row style={{ justifyContent: 'center', gap: space(6) }}>
        <Pressable accessibilityLabel="التالي" onPress={() => fling(-1)} style={[s.round, s.no]}>
          <Icon name="close" size={28} color={colors.text} />
        </Pressable>
        <Pressable accessibilityLabel="انضم" onPress={() => fling(1)} style={[s.round, s.yes]}>
          <Icon name="check" size={34} color={colors.ink} />
        </Pressable>
      </Row>
      <T variant="small" style={{ textAlign: 'center' }}>
        اسحب يمين تنضم · يسار للي بعدها
      </T>
    </View>
  );
}

const s = StyleSheet.create({
  stack: { position: 'relative' },
  ghost: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderWidth: 2, borderColor: colors.line, borderRadius: radius.sm, backgroundColor: 'rgba(14,46,138,0.6)' },
  card: { userSelect: 'none', backgroundColor: colors.turfDark, borderWidth: 2, borderColor: colors.line, borderRadius: radius.sm, padding: space(4), shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 20, shadowOffset: { width: 0, height: 14 } },
  kind: { fontFamily: fonts.kufi, fontSize: 12, lineHeight: 22, borderWidth: 1.5, borderColor: colors.text, paddingHorizontal: 10, borderRadius: 2 },
  kindComp: { borderColor: colors.led, color: colors.led },
  stamp: { position: 'absolute', top: 26, borderWidth: 3, paddingHorizontal: 12, borderRadius: 4, backgroundColor: 'rgba(6,11,26,0.7)' },
  stampJoin: { left: 20, borderColor: colors.led, transform: [{ rotate: '-12deg' }] },
  stampSkip: { right: 20, borderColor: colors.text, transform: [{ rotate: '12deg' }] },
  stampText: { fontFamily: fonts.black, fontSize: 24, lineHeight: 44 },
  round: { alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  no: { width: 64, height: 64, backgroundColor: colors.ink, borderWidth: 2, borderColor: colors.line },
  yes: { width: 76, height: 76, backgroundColor: colors.led, shadowColor: colors.led, shadowOpacity: 0.6, shadowRadius: 16 },
});
