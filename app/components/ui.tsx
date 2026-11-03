import { SymbolView } from 'expo-symbols';
import { ReactNode } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextProps, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, space } from '@/constants/theme';
import { fmtLevel } from '@/lib/format';

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      {scroll ? <ScrollView contentContainerStyle={s.content}>{children}</ScrollView> : <View style={s.content}>{children}</View>}
    </SafeAreaView>
  );
}

export function T({ style, variant = 'body', ...p }: TextProps & { variant?: 'h1' | 'h2' | 'body' | 'muted' | 'small' }) {
  return <Text {...p} style={[s.text, s[variant], style]} />;
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  icon,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
  icon?: IconName;
}) {
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [s.btn, primary ? s.btnPrimary : s.btnGhost, (pressed || disabled) && { opacity: 0.6 }]}>
      {icon && <Icon name={icon} color={primary ? colors.accentText : colors.text} size={18} />}
      <Text style={[s.btnText, { color: primary ? colors.accentText : colors.text }]}>{title}</Text>
    </Pressable>
  );
}

export function Row({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap: space(2) }, style]}>{children}</View>;
}

export function LevelBadge({ level }: { level: number }) {
  return (
    <View style={s.badge}>
      <Text style={s.badgeText}>{fmtLevel(level)}</Text>
    </View>
  );
}

export function Pill({ label, active }: { label: string; active?: boolean }) {
  return (
    <View style={[s.pill, active && { backgroundColor: colors.accent }]}>
      <Text style={[s.small, s.text, active && { color: colors.accentText }]}>{label}</Text>
    </View>
  );
}

const icons = {
  home: { ios: 'house.fill', android: 'home', web: 'home' },
  tennis: { ios: 'figure.tennis', android: 'sports_tennis', web: 'sports_tennis' },
  trophy: { ios: 'trophy.fill', android: 'emoji_events', web: 'emoji_events' },
  person: { ios: 'person.crop.circle.fill', android: 'account_circle', web: 'account_circle' },
  bolt: { ios: 'bolt.fill', android: 'bolt', web: 'bolt' },
  plus: { ios: 'plus', android: 'add', web: 'add' },
  pin: { ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' },
  clock: { ios: 'clock', android: 'schedule', web: 'schedule' },
} as const;
export type IconName = keyof typeof icons;

export function Icon({ name, color = colors.text, size = 20 }: { name: IconName; color?: string; size?: number }) {
  return <SymbolView name={icons[name] as any} tintColor={color} size={size} />;
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space(4), gap: space(4), paddingBottom: space(10), width: '100%', maxWidth: 640, alignSelf: 'center' },
  // Native flips 'left' to the start edge under forced RTL; web needs the explicit side.
  text: { color: colors.text, textAlign: Platform.OS === 'web' ? 'right' : 'left', writingDirection: 'rtl' },
  h1: { fontSize: 28, fontWeight: '800' },
  h2: { fontSize: 19, fontWeight: '700' },
  body: { fontSize: 15 },
  muted: { fontSize: 14, color: colors.muted },
  small: { fontSize: 12 },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: space(4), gap: space(2), borderWidth: 1, borderColor: colors.border },
  btn: { flexDirection: 'row', gap: space(2), alignItems: 'center', justifyContent: 'center', paddingVertical: space(3.5), paddingHorizontal: space(5), borderRadius: radius.md },
  btnPrimary: { backgroundColor: colors.accent },
  btnGhost: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  btnText: { fontSize: 16, fontWeight: '700' },
  badge: { backgroundColor: colors.accent, borderRadius: radius.sm, paddingHorizontal: space(2), paddingVertical: 2, minWidth: 36, alignItems: 'center' },
  badgeText: { color: colors.accentText, fontWeight: '800', fontSize: 13 },
  pill: { backgroundColor: colors.surfaceAlt, borderRadius: 99, paddingHorizontal: space(3), paddingVertical: space(1) },
});
