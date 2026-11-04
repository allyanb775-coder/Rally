import { ReactNode, useState } from 'react';
import { Image, ImageSourcePropType, StyleSheet, View, ViewStyle } from 'react-native';
import { radius } from '@/constants/theme';

/**
 * A photo at its own aspect ratio (never cropped), with optional content laid over it.
 * Sized in pixels from the measured width so it renders the same on web and native.
 */
export function Photo({ source, aspect, children, style }: { source: ImageSourcePropType; aspect: number; children?: ReactNode; style?: ViewStyle }) {
  const [w, setW] = useState(0);
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={[s.wrap, { aspectRatio: aspect }, style]}>
      {w > 0 && <Image source={source} style={{ position: 'absolute', top: 0, left: 0, width: w, height: w / aspect }} resizeMode="cover" accessibilityIgnoresInvertColors />}
      {children}
    </View>
  );
}

export const HIGH_FIVE_WIDE = { source: require('@/assets/images/high-five-wide.jpg'), aspect: 1179 / 600 };

const s = StyleSheet.create({
  wrap: { width: '100%', overflow: 'hidden', borderRadius: radius.lg, backgroundColor: '#000' },
});
