import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { space } from '@/constants/theme';

/**
 * A plain card. (Kept under its old name; the glass effects were dropped to keep the UI calm.)
 * `strong` is a slightly lighter card for the item in focus.
 */
export function Glass({
  children,
  style,
  strong = false,
}: {
  children?: ReactNode;
  style?: ViewStyle | (ViewStyle | false | undefined)[];
  bolts?: boolean;
  sheen?: boolean;
  strong?: boolean;
}) {
  return <View style={[s.card, strong && s.strong, style as ViewStyle]}>{children}</View>;
}

const s = StyleSheet.create({
  card: { backgroundColor: '#0F0F11', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: space(4), gap: space(2) },
  strong: { backgroundColor: '#151518', borderColor: 'rgba(255,255,255,0.14)' },
});
