import { SymbolView } from 'expo-symbols';
import { ReactNode } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TextInputProps, TextProps, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius, space } from '@/constants/theme';
import { fmtLevel } from '@/lib/format';
import { Glass } from './Glass';

/** Flat night-blue background behind every screen. */
export function Turf() {
  return <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg }]} pointerEvents="none" />;
}

/** Bottom padding leaves room for the tab bar. */
export function Screen({ children, scroll = true, tabBar = false }: { children: ReactNode; scroll?: boolean; tabBar?: boolean }) {
  const pad = { paddingBottom: tabBar ? 110 : space(10) };
  return (
    <View style={{ flex: 1 }}>
      <Turf />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {scroll ? (
          <ScrollView contentContainerStyle={[s.content, pad]} showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        ) : (
          <View style={[s.content, pad, { flex: 1 }]}>{children}</View>
        )}
      </SafeAreaView>
    </View>
  );
}

type Variant = 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'muted' | 'small' | 'label';
export function T({ style, variant = 'body', ...p }: TextProps & { variant?: Variant }) {
  return <Text {...p} style={[s.text, s[variant], style]} />;
}

/** Black scoreboard panel. */
export function Board({ children, style }: { children: ReactNode; style?: ViewStyle | ViewStyle[] }) {
  return <View style={[s.board, style as ViewStyle]}>{children}</View>;
}

/** A pane of court glass for grouping on the turf. */
export function Lined({ children, style }: { children: ReactNode; style?: ViewStyle | ViewStyle[] }) {
  return <Glass style={style as ViewStyle}>{children}</Glass>;
}

// Kept for screens that still use the generic name.
export const Card = Lined;

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
  const fg = variant === 'primary' ? colors.ink : colors.text;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.btn,
        variant === 'primary' ? s.btnPrimary : variant === 'dark' ? s.btnDark : s.btnGhost,
        pressed && { transform: [{ scale: 0.98 }] },
        disabled && { opacity: 0.45 },
      ]}>
      {icon && <Icon name={icon} color={fg} size={20} />}
      <Text style={[s.btnText, { color: fg }]}>{title}</Text>
    </Pressable>
  );
}

export function Input(props: TextInputProps) {
  return <TextInput placeholderTextColor={colors.inkMuted} {...props} style={[s.input, props.style]} />;
}

export function Row({ children, style }: { children: ReactNode; style?: ViewStyle | ViewStyle[] }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap: space(2) }, style as ViewStyle]}>{children}</View>;
}

export function LevelBadge({ level }: { level: number }) {
  return (
    <View style={s.badge}>
      <Text style={s.badgeText}>{fmtLevel(level)}</Text>
    </View>
  );
}

export function Chip({ label, active, onPress, icon }: { label: string; active?: boolean; onPress?: () => void; icon?: IconName }) {
  const body = (
    <View style={[s.chip, active && s.chipActive]}>
      {icon && <Icon name={icon} size={14} color={active ? colors.ink : colors.text} />}
      <Text style={[s.chipText, active && { color: colors.ink }]}>{label}</Text>
    </View>
  );
  return onPress ? <Pressable onPress={onPress}>{body}</Pressable> : body;
}

/**
 * The Rally headline: a big English word in the condensed display face, with the
 * Arabic meaning underneath. `size` 'xl' for screen titles, 'md' for sections.
 */
export function Heading({ en, ar, size = 'md', align = 'start' }: { en: string; ar?: string; size?: 'xl' | 'md'; align?: 'start' | 'center' }) {
  const big = size === 'xl';
  const center = align === 'center';
  return (
    <View style={{ alignItems: center ? 'center' : 'flex-start' }}>
      <Text style={[s.display, { fontSize: big ? 52 : 30, lineHeight: big ? 60 : 36 }, center && { textAlign: 'center' }]}>{en}</Text>
      {!!ar && <Text style={[s.text, s.headingAr, center && { textAlign: 'center' }]}>{ar}</Text>}
    </View>
  );
}

export function SectionHeader({ title, en, action, onAction }: { title: string; en?: string; action?: string; onAction?: () => void }) {
  return (
    <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end', marginTop: space(3) }}>
      {en ? <Heading en={en} ar={title} /> : <T variant="h2">{title}</T>}
      {action && (
        <Pressable onPress={onAction} hitSlop={8}>
          <T style={{ color: colors.muted, fontFamily: fonts.bold, fontSize: 13 }}>{action}</T>
        </Pressable>
      )}
    </Row>
  );
}

/** Progress bar; fills from the reading start (right). */
export function Bar({ value, color = colors.led, height = 6, track = colors.lineSoft }: { value: number; color?: string; height?: number; track?: string }) {
  return (
    <View style={{ height, backgroundColor: track, overflow: 'hidden' }}>
      <View style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, height: '100%', backgroundColor: color }} />
    </View>
  );
}

const icons = {
  home: { ios: 'sportscourt.fill', android: 'sports_tennis', web: 'sports_tennis' },
  tennis: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
  trophy: { ios: 'trophy.fill', android: 'emoji_events', web: 'emoji_events' },
  person: { ios: 'person.text.rectangle.fill', android: 'badge', web: 'badge' },
  bolt: { ios: 'bolt.fill', android: 'bolt', web: 'bolt' },
  plus: { ios: 'plus', android: 'add', web: 'add' },
  pin: { ios: 'mappin', android: 'location_on', web: 'location_on' },
  clock: { ios: 'clock', android: 'schedule', web: 'schedule' },
  arrow: { ios: 'arrow.left', android: 'arrow_back', web: 'arrow_back' },
  share: { ios: 'square.and.arrow.up', android: 'ios_share', web: 'ios_share' },
  chart: { ios: 'chart.line.uptrend.xyaxis', android: 'trending_up', web: 'trending_up' },
  check: { ios: 'checkmark', android: 'check', web: 'check' },
  close: { ios: 'xmark', android: 'close', web: 'close' },
  calendar: { ios: 'calendar', android: 'calendar_today', web: 'calendar_today' },
  users: { ios: 'person.2.fill', android: 'group', web: 'group' },
  play: { ios: 'play.fill', android: 'play_arrow', web: 'play_arrow' },
  trash: { ios: 'trash', android: 'delete', web: 'delete' },
  video: { ios: 'video.fill', android: 'videocam', web: 'videocam' },
} as const;
export type IconName = keyof typeof icons;

export function Icon({ name, color = colors.text, size = 20 }: { name: IconName; color?: string; size?: number }) {
  return <SymbolView name={icons[name] as any} tintColor={color} size={size} />;
}

const align = Platform.OS === 'web' ? 'right' : 'left'; // native flips 'left' under forced RTL
/** Physical side where a 0→max scale starts in RTL: native mirrors 'left' itself, web needs 'right'. */
export const scaleStart = Platform.OS === 'web' ? ('right' as const) : ('left' as const);

const s = StyleSheet.create({
  content: { paddingHorizontal: space(4), paddingTop: space(3), gap: space(4), width: '100%', maxWidth: 560, alignSelf: 'center' },
  text: { color: colors.text, textAlign: align, writingDirection: 'rtl', fontFamily: fonts.body },
  display: { fontFamily: fonts.display, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: 0.5, writingDirection: 'ltr' },
  headingAr: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colors.muted, marginTop: 2 },
  h1: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 36 },
  h2: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 26 },
  h3: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 22 },
  body: { fontSize: 15, lineHeight: 22 },
  muted: { fontSize: 14, lineHeight: 20, color: colors.muted },
  small: { fontSize: 12, lineHeight: 16, color: colors.muted },
  label: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 18, color: colors.muted },
  board: { backgroundColor: colors.ink, borderRadius: radius.md, padding: space(4), gap: space(2), borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  lined: { borderWidth: 2, borderColor: colors.line, borderRadius: radius.sm, padding: space(4), gap: space(2), backgroundColor: 'rgba(6,11,26,0.18)' },
  btn: { flexDirection: 'row', gap: space(2), alignItems: 'center', justifyContent: 'center', height: 54, paddingHorizontal: space(6), borderRadius: 999 },
  btnPrimary: { backgroundColor: colors.led },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  btnDark: { backgroundColor: colors.ink },
  btnText: { fontSize: 16, fontFamily: fonts.bold },
  input: { backgroundColor: colors.ink, borderRadius: radius.sm, color: colors.text, fontSize: 20, fontFamily: fonts.medium, height: 60, paddingHorizontal: space(4), textAlign: 'right' },
  badge: { backgroundColor: 'rgba(47,98,255,0.18)', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 2, minWidth: 40, alignItems: 'center' },
  badgeText: { color: '#8FB0FF', fontFamily: fonts.bold, fontSize: 13 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', backgroundColor: 'transparent', borderRadius: radius.pill, paddingHorizontal: 16, height: 38 },
  chipActive: { backgroundColor: colors.led, borderColor: colors.led },
  chipText: { color: colors.text, fontFamily: fonts.bold, fontSize: 13 },
});
