import { router } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '@/constants/theme';
import { Icon, IconName } from './ui';

const meta: Record<string, { title: string; icon: IconName }> = {
  index: { title: 'الملعب', icon: 'home' },
  matches: { title: 'الجدول', icon: 'tennis' },
  tournaments: { title: 'البطولات', icon: 'trophy' },
  profile: { title: 'بطاقتي', icon: 'person' },
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
        <Icon name={m.icon} size={22} color={focused ? colors.led : 'rgba(255,255,255,0.55)'} />
        <Text style={[s.label, focused && { color: colors.led }]}>{m.title}</Text>
      </Pressable>
    );
  });
  const mid = Math.ceil(items.length / 2);
  return (
    <View style={s.bar}>
      <View style={[s.glass, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {items.slice(0, mid)}
      <Pressable accessibilityRole="button" accessibilityLabel="افتح مباراة" onPress={() => router.push('/create-match')} style={s.plus}>
        <Icon name="plus" size={26} color={colors.ink} />
      </Pressable>
      {items.slice(mid)}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  glass: { flexDirection: 'row', alignItems: 'flex-start', paddingTop: 8, paddingHorizontal: 4, backgroundColor: colors.ink, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  item: { flex: 1, alignItems: 'center', gap: 3, paddingBottom: 6 },
  lamp: { height: 0 },
  lampOn: {},
  label: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 16, color: 'rgba(255,255,255,0.55)' },
  plus: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.led, alignItems: 'center', justifyContent: 'center', marginTop: -4 },
});
