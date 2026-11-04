import { I18nManager, Platform, View } from 'react-native';
import { colors } from '@/constants/theme';

// 5×7 dot-matrix glyphs, like a stadium scoreboard. Each row is 5 bits, left to right.
const GLYPHS: Record<string, number[]> = {
  '0': [0b01110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
  '1': [0b00100, 0b01100, 0b00100, 0b00100, 0b00100, 0b00100, 0b01110],
  '2': [0b01110, 0b10001, 0b00001, 0b00010, 0b00100, 0b01000, 0b11111],
  '3': [0b11111, 0b00010, 0b00100, 0b00010, 0b00001, 0b10001, 0b01110],
  '4': [0b00010, 0b00110, 0b01010, 0b10010, 0b11111, 0b00010, 0b00010],
  '5': [0b11111, 0b10000, 0b11110, 0b00001, 0b00001, 0b10001, 0b01110],
  '6': [0b00110, 0b01000, 0b10000, 0b11110, 0b10001, 0b10001, 0b01110],
  '7': [0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b01000, 0b01000],
  '8': [0b01110, 0b10001, 0b10001, 0b01110, 0b10001, 0b10001, 0b01110],
  '9': [0b01110, 0b10001, 0b10001, 0b01111, 0b00001, 0b00010, 0b01100],
  ':': [0b0, 0b00100, 0b00100, 0b0, 0b00100, 0b00100, 0b0],
  '.': [0b0, 0b0, 0b0, 0b0, 0b0, 0b01100, 0b01100],
  '-': [0b0, 0b0, 0b0, 0b01110, 0b0, 0b0, 0b0],
  '/': [0b00001, 0b00010, 0b00010, 0b00100, 0b01000, 0b01000, 0b10000],
  ' ': [0, 0, 0, 0, 0, 0, 0],
};
const NARROW = new Set([':', '.']); // drawn 3 columns wide
// The app runs right-to-left, where 'row' lays out from the right; numbers must read left-to-right.
const LTR_ROW = (Platform.OS === 'web' || I18nManager.isRTL ? 'row-reverse' : 'row') as 'row' | 'row-reverse';

/**
 * Dot-matrix number (Latin digits, as on Saudi stadium boards).
 * `dot` is the dot size in px; unlit dots are drawn faintly unless `off` is false.
 */
export function Led({ value, dot = 4, color = colors.led, off = true }: { value: string; dot?: number; color?: string; off?: boolean }) {
  const gap = Math.max(1, Math.round(dot * 0.35));
  return (
    <View style={{ flexDirection: LTR_ROW, gap: dot + gap }}>
      {[...value].map((ch, i) => {
        const rows = GLYPHS[ch] ?? GLYPHS[' '];
        const cols = NARROW.has(ch) ? [1, 2, 3] : [0, 1, 2, 3, 4];
        return (
          <View key={i} style={{ gap }}>
            {rows.map((bits, r) => (
              <View key={r} style={{ flexDirection: LTR_ROW, gap }}>
                {cols.map((c) => {
                  const lit = (bits >> (4 - c)) & 1;
                  return (
                    <View
                      key={c}
                      style={{
                        width: dot,
                        height: dot,
                        borderRadius: dot / 2,
                        backgroundColor: lit ? color : off ? colors.ledOff : 'transparent',
                        shadowColor: color,
                        shadowOpacity: lit ? 0.9 : 0,
                        shadowRadius: dot,
                      }}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
}

/** "20:30" in 24h, as a scoreboard shows it. */
export const ledTime = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
export const ledNum = (n: number, digits = 2) => String(n).padStart(digits, '0');
export const ledLevel = (n: number) => n.toFixed(1);
