import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { colors } from '@/constants/theme';

export const BALL_HIT_MS = 620;

/**
 * A padel ball flies in and strikes the glass: impact rings spread from the hit
 * and the pane flashes. Plays each time `play` changes to a new positive number.
 * Overlay it on the glass that gets hit; it never takes touches.
 */
export function BallHit({ play }: { play: number }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!play) return;
    t.setValue(0);
    Animated.timing(t, { toValue: 1, duration: BALL_HIT_MS, easing: Easing.linear, useNativeDriver: false }).start();
  }, [play, t]);
  if (!play) return null;

  // 0 → 0.4: ball flies from below-right into the centre and shrinks (moving away from you, into the glass)
  // 0.4: impact. 0.4 → 1: ball drops back, rings expand, flash fades.
  const ballY = t.interpolate({ inputRange: [0, 0.4, 1], outputRange: [260, 0, 90] });
  const ballX = t.interpolate({ inputRange: [0, 0.4, 1], outputRange: [120, 0, -30] });
  const ballScale = t.interpolate({ inputRange: [0, 0.4, 0.5, 1], outputRange: [2.2, 1, 0.8, 0.9] });
  const ballOpacity = t.interpolate({ inputRange: [0, 0.05, 0.75, 1], outputRange: [0, 1, 1, 0] });
  const ring = (delay: number) => ({
    transform: [{ scale: t.interpolate({ inputRange: [0, 0.4 + delay, 1], outputRange: [0.1, 0.1, 3.4], extrapolate: 'clamp' }) }],
    opacity: t.interpolate({ inputRange: [0, 0.4 + delay, 0.42 + delay, 1], outputRange: [0, 0, 0.9, 0], extrapolate: 'clamp' }),
  });
  const flash = t.interpolate({ inputRange: [0, 0.38, 0.42, 0.7], outputRange: [0, 0, 0.35, 0], extrapolate: 'clamp' });

  return (
    <View pointerEvents="none" style={s.layer}>
      <Animated.View style={[s.layer, { backgroundColor: '#FFFFFF', opacity: flash }]} />
      <Animated.View style={[s.ring, ring(0)]} />
      <Animated.View style={[s.ring, { borderColor: colors.led }, ring(0.08)]} />
      <Animated.View style={[s.ball, { opacity: ballOpacity, transform: [{ translateX: ballX }, { translateY: ballY }, { scale: ballScale }] }]}>
        <View style={s.seamA} />
        <View style={s.seamB} />
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  layer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#FFFFFF' },
  ball: { position: 'absolute', width: 34, height: 34, borderRadius: 17, backgroundColor: '#E8F23A', overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 8 },
  seamA: { position: 'absolute', width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: 'rgba(255,255,255,0.95)', left: -20 },
  seamB: { position: 'absolute', width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: 'rgba(255,255,255,0.95)', right: -20 },
});
