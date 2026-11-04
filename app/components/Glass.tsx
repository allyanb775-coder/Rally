import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View, ViewStyle } from 'react-native';
import { space } from '@/constants/theme';

/**
 * A panel of padel-court glass: frosted so the court shows through, a green-tinted
 * edge where the 12mm glass is thick, a bolt in each corner like the clamps that
 * hold real court panels, and a slow sheen of light sliding across.
 */
export function Glass({
  children,
  style,
  bolts = true,
  sheen = true,
  strong = false,
}: {
  children?: ReactNode;
  style?: ViewStyle | (ViewStyle | false | undefined)[];
  bolts?: boolean;
  sheen?: boolean;
  strong?: boolean;
}) {
  return (
    <View style={[s.glass, style as ViewStyle]}>
      <BlurView intensity={strong ? 40 : 24} tint="dark" style={s.fill} />
      <View style={[s.fill, { backgroundColor: strong ? 'rgba(170,205,255,0.16)' : 'rgba(190,225,255,0.10)' }]} />
      {sheen && <Sheen />}
      <View style={s.topEdge} pointerEvents="none" />
      <View style={s.thickEdge} pointerEvents="none" />
      {bolts && (
        <>
          <Bolt style={{ top: 7, left: 7 }} />
          <Bolt style={{ top: 7, right: 7 }} />
          <Bolt style={{ bottom: 7, left: 7 }} />
          <Bolt style={{ bottom: 7, right: 7 }} />
        </>
      )}
      {children}
    </View>
  );
}

function Bolt({ style }: { style: ViewStyle }) {
  return (
    <View style={[s.bolt, style]} pointerEvents="none">
      <View style={s.boltCore} />
    </View>
  );
}

/** Diagonal light that slides across the glass every few seconds. Off when the user asks for reduced motion. */
function Sheen() {
  const x = useRef(new Animated.Value(0)).current;
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduce).catch(() => {});
  }, []);
  useEffect(() => {
    if (reduce) return;
    const delay = 2500 + Math.random() * 4000; // panels catch the light at different moments
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(x, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
        Animated.timing(x, { toValue: 0, duration: 0, useNativeDriver: false }),
        Animated.delay(5000),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reduce, x]);
  const left = x.interpolate({ inputRange: [0, 1], outputRange: ['-70%', '130%'] });
  return (
    <Animated.View pointerEvents="none" style={[s.sheen, { left }]}>
      <LinearGradient
        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.16)', 'rgba(255,255,255,0)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ flex: 1 }}
      />
    </Animated.View>
  );
}

const s = StyleSheet.create({
  glass: { position: 'relative', overflow: 'hidden', borderRadius: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.38)', padding: space(4), gap: space(2) },
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  topEdge: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.75)' },
  thickEdge: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: 'rgba(120,220,195,0.45)' },
  sheen: { position: 'absolute', top: -40, bottom: -40, width: '45%', transform: [{ skewX: '-18deg' }] },
  bolt: { position: 'absolute', width: 9, height: 9, borderRadius: 5, backgroundColor: '#C9D3E3', borderWidth: 1, borderColor: '#6F7C96', alignItems: 'center', justifyContent: 'center' },
  boltCore: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#5B6782' },
});
