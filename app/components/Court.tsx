import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '@/constants/theme';
import { useStore } from '@/lib/store';
import { MATCH_SIZE } from '@/lib/types';

/**
 * Top-down padel court (20m × 10m, ratio 2:1) with the four player spots.
 * Service lines sit 6.95m from the net: 30.5% of the length from each back wall.
 * Spots fill A1, B1, A2, B2 so a two-player match shows one per side.
 */
export function Court({ playerIds, size = 'md' }: { playerIds: string[]; size?: 'sm' | 'md' | 'lg' }) {
  const { players, me } = useStore();
  const dot = size === 'sm' ? 26 : size === 'md' ? 36 : 50;
  const ids = Array.from({ length: MATCH_SIZE }, (_, i) => playerIds[i]);
  const sides = { a: [ids[0], ids[2]], b: [ids[1], ids[3]] };

  return (
    <View style={s.glass}>
      <View style={s.turf}>
        <View style={[s.line, { left: '30.5%', top: 0, bottom: 0, width: 2 }]} />
        <View style={[s.line, { right: '30.5%', top: 0, bottom: 0, width: 2 }]} />
        <View style={[s.line, { left: '30.5%', right: '50%', top: '50%', height: 2 }]} />
        <View style={[s.line, { right: '30.5%', left: '50%', top: '50%', height: 2 }]} />
        <View style={s.net} />
        {(['a', 'b'] as const).map((side) => (
          <View key={side} style={[s.half, side === 'a' ? { left: 0 } : { right: 0 }]}>
            {sides[side].map((id, i) => {
              const p = id ? players[id] : undefined;
              const mine = id === me.id;
              return (
                <View
                  key={i}
                  style={[s.dot, { width: dot, height: dot, borderRadius: dot / 2 }, p ? { backgroundColor: mine ? '#FFD400' : colors.text } : s.empty]}>
                  <Text style={{ fontFamily: fonts.kufi, fontSize: dot * 0.4, lineHeight: dot * 0.9, color: p ? '#000' : '#FFFFFF' }}>
                    {p ? p.name[0] : '+'}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  glass: { aspectRatio: 2, width: '100%', padding: 4, backgroundColor: 'rgba(190,215,255,0.28)', borderRadius: 3 },
  turf: { flex: 1, backgroundColor: colors.turf, borderWidth: 2, borderColor: colors.line, overflow: 'hidden' },
  line: { position: 'absolute', backgroundColor: colors.line },
  net: { position: 'absolute', left: '50%', marginLeft: -2, top: -2, bottom: -2, width: 4, backgroundColor: colors.ink },
  half: { position: 'absolute', top: 0, bottom: 0, width: '50%', justifyContent: 'space-around', alignItems: 'center', paddingVertical: '3%' },
  dot: { alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 5, shadowOffset: { width: 0, height: 3 } },
  empty: { borderWidth: 2, borderStyle: 'dashed', borderColor: '#FFFFFF', backgroundColor: 'rgba(0,0,0,0.25)' },
});
