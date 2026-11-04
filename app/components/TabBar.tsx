import { router } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '@/constants/theme';
import { Icon, IconName } from './ui';

const meta: Record<string, { title: string; icon: IconName }> = {
  index: { title: 'PLAY', icon: 'home' },
  matches: { title: 'MATCHES', icon: 'tennis' },
  tournaments: { title: 'EVENTS', icon: 'trophy' },
  profile: { title: 'CARD', icon: 'person' },
};

/** Scoreboard base: a black strip with a lit bar over the current tab, and a + to open a match. */
export function TabBar({ state, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const items = state.routes.map((r, i) => {
    const m = meta[r.name];
    if (!m) return null;
    const focused = state.index === i;
    return (
      <Pressable key={r.key} accessibilityRole="tab" accessibilityState={{ selected: focused }} onPress={() => !focused && navigateToTab(r.key)} style={s.item}>
        <View style={[s.lamp, focused && s.lampOn]} />
        <Icon name={m.icon} size={22} color={focused ? '#FFFFFF' : 'rgba(255,255,255,0.45)'} />
        <Text style={[s.label, focused && { color: '#FFFFFF' }]}>{m.title}</Text>
      </Pressable>
    );
  });
  const mid = Math.ceil(items.length / 2);
  return (
    <View style={s.bar}>
      <View style={[s.glass, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {items.slice(0, mid)}
      <Pressable accessibilityRole="button" accessibilityLabel="افتح مباراة" onPress={() => router.push('/create-match')} style={s.plus}>
        <Icon name="plus" size={26} color="#FFFFFF" />
      </Pressable>
      {items.slice(mid)}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  glass: { flexDirection: 'row', alignItems: 'flex-start', paddingTop: 8, paddingHorizontal: 4, backgroundColor: '#000000', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  item: { flex: 1, alignItems: 'center', gap: 3, paddingBottom: 6 },
  lamp: { width: 5, height: 5, borderRadius: 3, marginBottom: 4, backgroundColor: 'transparent' },
  lampOn: { backgroundColor: colors.blue },
  label: { fontFamily: fonts.display, fontSize: 12, lineHeight: 16, letterSpacing: 1, color: 'rgba(255,255,255,0.45)' },
  plus: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center', marginTop: -4 },
});
