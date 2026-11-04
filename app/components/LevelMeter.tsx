import { StyleSheet, View } from 'react-native';
import { colors, fonts } from '@/constants/theme';
import { fmtNum } from '@/lib/format';
import { levelLabel, MAX_LEVEL } from '@/lib/level';
import { Led, ledLevel } from './Led';
import { Board, Row, scaleStart, T } from './ui';

/** Scoreboard readout of the 0–7 level with a segment per whole level. */
export function LevelMeter({ level }: { level: number }) {
  return (
    <Board style={{ gap: 12 }}>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <View style={{ gap: 6 }}>
          <T variant="label" style={{ color: colors.inkMuted }}>مستواك من ٧</T>
          <Led value={ledLevel(level)} dot={6} />
        </View>
        <T style={s.tag}>{levelLabel(level)}</T>
      </Row>
      <View style={s.track}>
        {Array.from({ length: MAX_LEVEL }, (_, i) => {
          const fill = Math.max(0, Math.min(1, level - i));
          return (
            <View key={i} style={s.seg}>
              <View style={[s.segFill, { [scaleStart]: 0, width: `${fill * 100}%` }]} />
            </View>
          );
        })}
      </View>
      <Row style={{ justifyContent: 'space-between' }}>
        {Array.from({ length: MAX_LEVEL + 1 }, (_, i) => (
          <T key={i} style={s.num}>
            {fmtNum(i)}
          </T>
        ))}
      </Row>
    </Board>
  );
}

const s = StyleSheet.create({
  tag: { fontFamily: fonts.kufi, fontSize: 12, lineHeight: 24, color: colors.led, borderWidth: 1.5, borderColor: colors.led, paddingHorizontal: 10, borderRadius: 2 },
  track: { flexDirection: 'row', gap: 3, height: 10 },
  seg: { flex: 1, backgroundColor: colors.ledOff, overflow: 'hidden' },
  segFill: { position: 'absolute', top: 0, bottom: 0, backgroundColor: colors.led },
  num: { fontFamily: fonts.medium, fontSize: 11, color: colors.inkMuted, width: 14, textAlign: 'center' },
});
