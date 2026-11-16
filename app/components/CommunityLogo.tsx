import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '@/constants/theme';
import { Community } from '@/lib/types';

/** Community logo, or its first letter on court blue when it has none. */
export function CommunityLogo({ community, size = 56 }: { community: Pick<Community, 'name' | 'logo'>; size?: number }) {
  const r = size * 0.28;
  if (community.logo) {
    // A bundled image is a module reference (number on native, object on web); a URL is a string.
    const source = typeof community.logo === 'string' ? { uri: community.logo } : community.logo;
    return <Image source={source} style={{ width: size, height: size, borderRadius: r }} resizeMode="cover" accessibilityIgnoresInvertColors />;
  }
  return (
    <View style={[s.fallback, { width: size, height: size, borderRadius: r }]}>
      <Text style={[s.letter, { fontSize: size * 0.45, lineHeight: size * 0.6 }]}>{community.name.trim()[0]?.toUpperCase()}</Text>
    </View>
  );
}

export const KIND_LABEL = { community: 'مجتمع', court: 'ملعب', academy: 'أكاديمية' } as const;

const s = StyleSheet.create({
  fallback: { backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center' },
  letter: { color: '#FFFFFF', fontFamily: fonts.bold },
});
