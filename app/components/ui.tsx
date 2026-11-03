import { SymbolView } from 'expo-symbols';
import { ReactNode } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TextInputProps, TextProps, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius, space } from '@/constants/theme';
import { fmtLevel } from '@/lib/format';

/** Bottom padding leaves room for the floating tab bar. */
export function Screen({ children, scroll = true, tabBar = false }: { children: ReactNode; scroll?: boolean; tabBar?: boolean }) {
  const pad = { paddingBottom: tabBar ? 120 : space(10) };
  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      {scroll ? (
        <ScrollView contentContainerStyle={[s.content, pad]} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={[s.content, pad, { flex: 1 }]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

type Variant = 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'muted' | 'small' | 'label';
export function T({ style, variant = 'body', ...p }: TextProps & { variant?: Variant }) {
  return <Text {...p} style={[s.text, s[variant], style]} />;
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle | ViewStyle[] }) {
  return <View style={[s.card, style as ViewStyle]}>{children}</View>;
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
  variant?: 'primary' | 'ghost' | 'dark';
  disabled?: boolean;
  icon?: IconName;
}) {
  const fg = variant === 'primary' ? colors.accentInk : colors.text;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.btn,
        variant === 'primary' ? s.btnPrimary : variant === 'dark' ? s.btnDark : s.btnGhost,
        pressed && { transform: [{ scale: 0.98 }] },
        disabled && { opacity: 0.4 },
      ]}>
      {icon && <Icon name={icon} color={fg} size={20} />}
      <Text style={[s.btnText, { color: fg }]}>{title}</Text>
    </Pressable>
  );
}

export function Input(props: TextInputProps) {
  return <TextInput placeholderTextColor={colors.muted} {...props} style={[s.input, props.style]} />;
}

export function Row({ children, style }: { children: ReactNode; style?: ViewStyle | ViewStyle[] }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap: space(2) }, style as ViewStyle]}>{children}</View>;
}

export function Spacer() {
  return <View style={{ flex: 1 }} />;
}

export function LevelBadge({ level, size = 'md' }: { level: number; size?: 'md' | 'lg' }) {
  return (
    <View style={[s.badge, size === 'lg' && { paddingHorizontal: 12, paddingVertical: 6 }]}>
      <Text style={[s.badgeText, size === 'lg' && { fontSize: 18 }]}>{fmtLevel(level)}</Text>
    </View>
  );
}

export function Chip({ label, active, onPress, icon }: { label: string; active?: boolean; onPress?: () => void; icon?: IconName }) {
  const body = (
    <View style={[s.chip, active && s.chipActive]}>
      {icon && <Icon name={icon} size={14} color={active ? colors.accentInk : colors.muted} />}
      <Text style={[s.chipText, active && { color: colors.accentInk }]}>{label}</Text>
    </View>
  );
  return onPress ? <Pressable onPress={onPress}>{body}</Pressable> : body;
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <Row style={{ justifyContent: 'space-between', marginTop: space(2) }}>
      <T variant="h2">{title}</T>
      {action && (
        <Pressable onPress={onAction} hitSlop={8}>
          <T style={{ color: colors.accent, fontFamily: fonts.medium }}>{action}</T>
        </Pressable>
      )}
    </Row>
  );
}

/** Progress bar, e.g. tournament spots or questionnaire steps. */
export function Bar({ value, color = colors.accent, height = 6 }: { value: number; color?: string; height?: number }) {
  return (
    <View style={{ height, borderRadius: height, backgroundColor: colors.surface2, overflow: 'hidden' }}>
      <View style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, height: '100%', backgroundColor: color, borderRadius: height }} />
    </View>
  );
}

const icons = {
  home: { ios: 'house.fill', android: 'home', web: 'home' },
  tennis: { ios: 'figure.tennis', android: 'sports_tennis', web: 'sports_tennis' },
  trophy: { ios: 'trophy.fill', android: 'emoji_events', web: 'emoji_events' },
  person: { ios: 'person.fill', android: 'person', web: 'person' },
  bolt: { ios: 'bolt.fill', android: 'bolt', web: 'bolt' },
  plus: { ios: 'plus', android: 'add', web: 'add' },
  pin: { ios: 'mappin', android: 'location_on', web: 'location_on' },
  clock: { ios: 'clock', android: 'schedule', web: 'schedule' },
  arrow: { ios: 'arrow.left', android: 'arrow_back', web: 'arrow_back' },
  share: { ios: 'square.and.arrow.up', android: 'ios_share', web: 'ios_share' },
  chart: { ios: 'chart.line.uptrend.xyaxis', android: 'trending_up', web: 'trending_up' },
  check: { ios: 'checkmark', android: 'check', web: 'check' },
  calendar: { ios: 'calendar', android: 'calendar_today', web: 'calendar_today' },
  users: { ios: 'person.2.fill', android: 'group', web: 'group' },
} as const;
export type IconName = keyof typeof icons;

export function Icon({ name, color = colors.text, size = 20 }: { name: IconName; color?: string; size?: number }) {
  return <SymbolView name={icons[name] as any} tintColor={color} size={size} />;
}

const align = Platform.OS === 'web' ? 'right' : 'left'; // native flips 'left' under forced RTL
/** Physical side where a 0→max scale starts in RTL: native mirrors 'left' itself, web needs 'right'. */
export const scaleStart = Platform.OS === 'web' ? ('right' as const) : ('left' as const);

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: space(5), paddingTop: space(3), gap: space(4), width: '100%', maxWidth: 560, alignSelf: 'center' },
  text: { color: colors.text, textAlign: align, writingDirection: 'rtl', fontFamily: fonts.body },
  display: { fontFamily: fonts.black, fontSize: 40, lineHeight: 48 },
  h1: { fontFamily: fonts.extra, fontSize: 30, lineHeight: 38 },
  h2: { fontFamily: fonts.bold, fontSize: 19, lineHeight: 26 },
  h3: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 22 },
  body: { fontSize: 15, lineHeight: 22 },
  muted: { fontSize: 14, lineHeight: 20, color: colors.muted },
  small: { fontSize: 12, lineHeight: 16, color: colors.muted },
  label: { fontFamily: fonts.medium, fontSize: 12, letterSpacing: 0.5, color: colors.muted },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: space(4), gap: space(2), borderWidth: 1, borderColor: colors.border },
  btn: { flexDirection: 'row', gap: space(2), alignItems: 'center', justifyContent: 'center', height: 56, paddingHorizontal: space(6), borderRadius: radius.pill },
  btnPrimary: { backgroundColor: colors.accent },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.border },
  btnDark: { backgroundColor: colors.surface2 },
  btnText: { fontSize: 17, fontFamily: fonts.bold },
  input: { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, color: colors.text, fontSize: 20, fontFamily: fonts.medium, height: 60, paddingHorizontal: space(4), textAlign: 'right' },
  badge: { backgroundColor: colors.accent, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 3, minWidth: 38, alignItems: 'center' },
  badgeText: { color: colors.accentInk, fontFamily: fonts.extra, fontSize: 13 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: 14, height: 36 },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.text, fontFamily: fonts.medium, fontSize: 13 },
});
