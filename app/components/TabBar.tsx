import type { BottomTabBarProps } from 'expo-router/tabs';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '@/constants/theme';
import { Icon, IconName } from './ui';

const meta: Record<string, { title: string; icon: IconName }> = {
  index: { title: 'الرئيسية', icon: 'home' },
  matches: { title: 'المباريات', icon: 'tennis' },
  tournaments: { title: 'البطولات', icon: 'trophy' },
  profile: { title: 'ملفي', icon: 'person' },
};

/** Floating pill tab bar with a raised "open a match" button in the middle. */
export function TabBar({ state, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const items = state.routes.map((r, i) => {
    const m = meta[r.name];
    if (!m) return null;
    const focused = state.index === i;
    return (
      <Pressable
        key={r.key}
        accessibilityRole="tab"
        accessibilityState={{ selected: focused }}
        accessibilityLabel={m.title}
        onPress={() => !focused && navigateToTab(r.key)}
        style={s.item}>
        <View style={[s.iconWrap, focused && s.iconActive]}>
          <Icon name={m.icon} size={22} color={focused ? colors.accentInk : colors.muted} />
        </View>
        <Text style={[s.label, focused && { color: colors.text }]}>{m.title}</Text>
      </Pressable>
    );
  });
  const mid = Math.ceil(items.length / 2);
  return (
    <View style={[s.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]} pointerEvents="box-none">
      <View style={s.bar}>
        {items.slice(0, mid)}
        <Pressable accessibilityRole="button" accessibilityLabel="افتح مباراة" onPress={() => router.push('/create-match')} style={s.fab}>
          <Icon name="plus" size={28} color={colors.accentInk} />
        </Pressable>
        {items.slice(mid)}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, alignItems: 'center' },
  bar: { flexDirection: 'row', alignItems: 'center', width: '100%', maxWidth: 520, height: 72, borderRadius: 36, backgroundColor: 'rgba(23,28,40,0.96)', borderWidth: 1, borderColor: colors.border, paddingHorizontal: 6, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 20, shadowOffset: { width: 0, height: 8 } },
  item: { flex: 1, alignItems: 'center', gap: 2 },
  iconWrap: { width: 44, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  iconActive: { backgroundColor: colors.accent },
  label: { fontFamily: fonts.medium, fontSize: 10, color: colors.muted },
  fab: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginTop: -30, borderWidth: 5, borderColor: colors.bg },
});
