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
        <Icon name={m.icon} size={22} color={focused ? colors.led : colors.inkMuted} />
        <Text style={[s.label, focused && { color: colors.led }]}>{m.title}</Text>
      </Pressable>
    );
  });
  const mid = Math.ceil(items.length / 2);
  return (
    <View style={[s.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {items.slice(0, mid)}
      <Pressable accessibilityRole="button" accessibilityLabel="افتح مباراة" onPress={() => router.push('/create-match')} style={s.plus}>
        <View style={{ transform: [{ rotate: '-45deg' }] }}>
          <Icon name="plus" size={28} color={colors.ink} />
        </View>
      </Pressable>
      {items.slice(mid)}
    </View>
  );
}

const s = StyleSheet.create({
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.ink, borderTopWidth: 3, borderTopColor: '#0B1430', paddingHorizontal: 4 },
  item: { flex: 1, alignItems: 'center', gap: 3, paddingBottom: 6 },
  lamp: { width: 26, height: 3, marginBottom: 8, backgroundColor: 'transparent' },
  lampOn: { backgroundColor: colors.led, shadowColor: colors.led, shadowOpacity: 0.9, shadowRadius: 6 },
  label: { fontFamily: fonts.kufi, fontSize: 10, lineHeight: 18, color: colors.inkMuted },
  plus: { width: 56, height: 56, borderRadius: 4, backgroundColor: colors.led, alignItems: 'center', justifyContent: 'center', marginTop: -18, transform: [{ rotate: '45deg' }] },
});
