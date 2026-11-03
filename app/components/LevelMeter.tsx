import { StyleSheet, View } from 'react-native';
import { colors, fonts } from '@/constants/theme';
import { fmtLevel, fmtNum } from '@/lib/format';
import { levelLabel, MAX_LEVEL } from '@/lib/level';
import { Row, scaleStart, T } from './ui';

/** 0–7 scale with a tick per whole level and a marker at the player's level. */
export function LevelMeter({ level }: { level: number }) {
  const pct = (level / MAX_LEVEL) * 100;
  return (
    <View style={{ gap: 10 }}>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <View>
          <T variant="label">مستواك</T>
          <Row style={{ alignItems: 'flex-end', gap: 8 }}>
            <T style={s.big}>{fmtLevel(level)}</T>
            <T style={s.of}>/ {fmtNum(MAX_LEVEL)}</T>
          </Row>
        </View>
        <View style={s.tag}>
          <T style={s.tagText}>{levelLabel(level)}</T>
        </View>
      </Row>
      <View style={s.track}>
        <View style={[s.fill, { [scaleStart]: 0, width: `${pct}%` }]} />
        {Array.from({ length: MAX_LEVEL - 1 }, (_, i) => (
          <View key={i} style={[s.tick, { [scaleStart]: `${((i + 1) / MAX_LEVEL) * 100}%` }]} />
        ))}
      </View>
      <Row style={{ justifyContent: 'space-between' }}>
        {Array.from({ length: MAX_LEVEL + 1 }, (_, i) => (
          <T key={i} variant="small" style={{ width: 14, textAlign: 'center' }}>
            {fmtNum(i)}
          </T>
        ))}
      </Row>
    </View>
  );
}

const s = StyleSheet.create({
  big: { fontFamily: fonts.black, fontSize: 44, lineHeight: 50, color: colors.accent },
  of: { fontFamily: fonts.bold, fontSize: 18, color: colors.muted, marginBottom: 8 },
  tag: { borderWidth: 1.5, borderColor: colors.accent, borderRadius: 999, paddingHorizontal: 12, height: 30, justifyContent: 'center' },
  tagText: { color: colors.accent, fontFamily: fonts.bold, fontSize: 13 },
  track: { height: 10, borderRadius: 5, backgroundColor: colors.surface2, overflow: 'hidden' },
  fill: { position: 'absolute', top: 0, bottom: 0, backgroundColor: colors.accent, borderRadius: 5 },
  tick: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: colors.bg, opacity: 0.6 },
});
