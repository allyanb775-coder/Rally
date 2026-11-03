import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '@/constants/theme';
import { useStore } from '@/lib/store';
import { MATCH_SIZE } from '@/lib/types';

/**
 * Top-down padel court (20m × 10m, ratio 2:1) with the four player spots.
 * Service lines sit 6.95m from the net, i.e. 30.5% of the court length from each back wall.
 * Players fill team A (two spots on one half) then team B.
 */
export function Court({ playerIds, size = 'md' }: { playerIds: string[]; size?: 'sm' | 'md' | 'lg' }) {
  const { players, me } = useStore();
  const dot = size === 'sm' ? 28 : size === 'md' ? 38 : 52;
  const slots = Array.from({ length: MATCH_SIZE }, (_, i) => playerIds[i]);
  // spot order: A1, B1, A2, B2 so a 2-player match shows one per side
  const spots = [
    { side: 'a', pos: 'top', id: slots[0] },
    { side: 'b', pos: 'top', id: slots[1] },
    { side: 'a', pos: 'bottom', id: slots[2] },
    { side: 'b', pos: 'bottom', id: slots[3] },
  ];

  return (
    <View style={[s.glass, size === 'sm' && { padding: 3, borderRadius: 12 }]}>
      <View style={[s.turf, size === 'sm' && { borderRadius: 9 }]}>
        <View style={[s.line, s.serviceA]} />
        <View style={[s.line, s.serviceB]} />
        <View style={[s.line, s.centerA]} />
        <View style={[s.line, s.centerB]} />
        <View style={s.net} />
        {(['a', 'b'] as const).map((side) => (
          <View key={side} style={[s.half, side === 'a' ? { left: 0 } : { right: 0 }]}>
            {spots
              .filter((sp) => sp.side === side)
              .map((sp, i) => {
                const p = sp.id ? players[sp.id] : undefined;
                const mine = sp.id === me.id;
                return (
                  <View
                    key={i}
                    style={[
                      s.dot,
                      { width: dot, height: dot, borderRadius: dot / 2 },
                      p ? { backgroundColor: mine ? colors.accent : colors.text } : s.empty,
                    ]}>
                    <Text style={{ fontFamily: fonts.extra, fontSize: dot * 0.42, color: p ? colors.accentInk : colors.courtLine }}>
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
  glass: { aspectRatio: 2, width: '100%', maxWidth: '100%', padding: 5, borderRadius: 16, backgroundColor: colors.glass },
  turf: { flex: 1, borderRadius: 12, backgroundColor: colors.court, borderWidth: 2, borderColor: colors.courtLine, overflow: 'hidden' },
  line: { position: 'absolute', backgroundColor: colors.courtLine },
  serviceA: { left: '30.5%', top: 0, bottom: 0, width: 2 },
  serviceB: { right: '30.5%', top: 0, bottom: 0, width: 2 },
  centerA: { left: '30.5%', right: '50%', top: '50%', height: 2 },
  centerB: { right: '30.5%', left: '50%', top: '50%', height: 2 },
  net: { position: 'absolute', left: '50%', marginLeft: -2, top: -2, bottom: -2, width: 4, backgroundColor: '#0B1020', opacity: 0.85 },
  half: { position: 'absolute', top: 0, bottom: 0, width: '50%', justifyContent: 'space-around', alignItems: 'center', paddingVertical: '4%' },
  dot: { alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
  empty: { borderWidth: 2, borderStyle: 'dashed', borderColor: colors.courtLine, backgroundColor: 'rgba(255,255,255,0.08)' },
});
