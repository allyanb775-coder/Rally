import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '@/constants/theme';
import { SetScore, winnerFromSets } from '@/lib/result';
import { Team } from '@/lib/types';

/**
 * Tournament-broadcast scoreboard: a slim header strip, then one bar per pair with
 * their names and a box per set. The box of whoever took the set is lit; a ball marks
 * the winning pair. With `onTap`, each box is a button the scorer taps to add a game.
 */
export function Scoreboard({
  teams,
  sets,
  status,
  venue,
  onTap,
  highlightTeam,
}: {
  teams: Record<Team, string[]>; // player names per team
  sets: SetScore[];
  status: string;
  venue?: string;
  onTap?: (setIndex: number, team: Team) => void;
  highlightTeam?: Team | null; // your pair, marked with a thin stripe
}) {
  const winner = winnerFromSets(sets);
  const shown = onTap ? sets : sets.filter(([a, b]) => a !== null || b !== null);

  return (
    <View style={s.wrap}>
      <View style={s.strip}>
        <Text style={s.brand}>RALLY</Text>
        {!!venue && <Text style={s.venue} numberOfLines={1}>{venue}</Text>}
        <View style={s.statusPill}>
          <View style={[s.lamp, winner ? s.lampOn : null]} />
          <Text style={s.status}>{status}</Text>
        </View>
      </View>

      <View style={s.headRow}>
        <View style={{ flex: 1 }} />
        {shown.map((_, i) => (
          <Text key={i} style={s.setHead}>
            {i + 1}
          </Text>
        ))}
      </View>

      {([1, 2] as Team[]).map((team) => {
        const won = winner === team;
        return (
          <View key={team} style={[s.bar, team === 1 && { marginBottom: 3 }]}>
            <View style={[s.side, highlightTeam === team && s.sideMine, won && s.sideWon]} />
            <View style={s.names}>
              {teams[team].map((n, i) => (
                <Text key={i} numberOfLines={1} style={[s.name, won && s.nameWon]}>
                  {n}
                </Text>
              ))}
            </View>
            <View style={[s.ball, !won && { opacity: 0 }]}>
              <View style={s.seam} />
            </View>
            {shown.map((set, i) => {
              const v = set[team - 1];
              const other = set[team === 1 ? 1 : 0];
              const took = v !== null && other !== null && v > other;
              const box = (
                <View style={[s.box, took && s.boxTook, onTap && v === null && s.boxEmpty]}>
                  <Text style={[s.num, took && s.numTook, v === null && s.numEmpty]}>{v === null ? '–' : v}</Text>
                </View>
              );
              return onTap ? (
                <Pressable
                  key={i}
                  onPress={() => onTap(i, team)}
                  accessibilityRole="button"
                  accessibilityLabel={`الشوط ${i + 1}، ${teams[team].join(' و ')}: ${v ?? 'فاضي'}`}
                  style={({ pressed }) => pressed && { transform: [{ scale: 0.94 }] }}>
                  {box}
                </Pressable>
              ) : (
                <View key={i}>{box}</View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

const BOX = 46;
const s = StyleSheet.create({
  wrap: { gap: 0 },
  strip: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.led, paddingHorizontal: 12, height: 30, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  brand: { fontFamily: fonts.black, fontSize: 12, lineHeight: 22, color: colors.ink, letterSpacing: 2 },
  venue: { flex: 1, fontFamily: fonts.bold, fontSize: 12, color: colors.ink },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.ink, borderRadius: 3, paddingHorizontal: 8, height: 20 },
  lamp: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.danger },
  lampOn: { backgroundColor: '#3BE37F' },
  status: { fontFamily: fonts.bold, fontSize: 10, color: colors.text },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#0B1226', paddingHorizontal: 8, height: 22 },
  setHead: { width: BOX, textAlign: 'center', fontFamily: fonts.bold, fontSize: 10, color: colors.inkMuted, letterSpacing: 1 },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.ink, paddingVertical: 6, paddingEnd: 8, minHeight: 64 },
  side: { width: 5, alignSelf: 'stretch', backgroundColor: '#1A2340', marginEnd: 8 },
  sideMine: { backgroundColor: colors.text },
  sideWon: { backgroundColor: colors.led },
  names: { flex: 1, minWidth: 0, justifyContent: 'center' },
  name: { fontFamily: fonts.kufi, fontSize: 14, lineHeight: 24, color: '#C9D2E6' },
  nameWon: { color: colors.text },
  ball: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#E8F23A', overflow: 'hidden', marginHorizontal: 6 },
  seam: { position: 'absolute', width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: '#FFFFFF', left: -8 },
  box: { width: BOX, height: BOX, borderRadius: 3, backgroundColor: '#18213D', alignItems: 'center', justifyContent: 'center' },
  boxTook: { backgroundColor: colors.led },
  boxEmpty: { backgroundColor: 'transparent', borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#33406A' },
  num: { fontFamily: fonts.black, fontSize: 24, lineHeight: 40, color: colors.text, textAlign: 'center' },
  numTook: { color: colors.ink },
  numEmpty: { color: colors.inkMuted, fontSize: 18 },
});
