import { Text } from 'react-native';
import { colors, fonts } from '@/constants/theme';

/**
 * Big score-style number. (Was a dot-matrix display; now plain bold digits.)
 * `dot` keeps the old size scale: the digits are about 7 dots tall.
 */
export function Led({ value, dot = 4, color = colors.led }: { value: string; dot?: number; color?: string; off?: boolean }) {
  const size = Math.round(dot * 7);
  return (
    <Text style={{ fontFamily: fonts.display, fontSize: size, lineHeight: Math.round(size * 1.25), color, writingDirection: 'ltr', letterSpacing: 0.5 }}>
      {`⁦${value}⁩`}
    </Text>
  );
}

/** "20:30" in 24h. */
export const ledTime = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
export const ledNum = (n: number, _digits = 2) => String(n);
export const ledLevel = (n: number) => n.toFixed(1);
