import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, space } from '@/constants/theme';
import { fmtLevel, fmtNum } from '@/lib/format';
import { levelLabel } from '@/lib/level';
import { Player } from '@/lib/types';

/** FIFA-style shareable card. */
export function PlayerCard({ player }: { player: Player }) {
  const winRate = player.matchesPlayed ? Math.round((player.wins / player.matchesPlayed) * 100) : 0;
  return (
    <View style={s.card}>
      <View style={s.top}>
        <View>
          <Text style={s.level}>{fmtLevel(player.level)}</Text>
          <Text style={s.label}>{levelLabel(player.level)}</Text>
        </View>
        <Text style={s.brand}>RALLY</Text>
      </View>
      <View style={s.avatar}>
        <Text style={s.avatarText}>{player.name[0]}</Text>
      </View>
      <Text style={s.name}>{player.name}</Text>
      <View style={s.divider} />
      <View style={s.stats}>
        <Stat k="مباريات" v={fmtNum(player.matchesPlayed)} />
        <Stat k="فوز" v={fmtNum(player.wins)} />
        <Stat k="نسبة الفوز" v={`${fmtNum(winRate)}٪`} />
      </View>
      <Text style={s.city}>{player.city}</Text>
    </View>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={s.statV}>{v}</Text>
      <Text style={s.statK}>{k}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: { alignSelf: 'center', width: 260, aspectRatio: 0.7, borderRadius: radius.lg, padding: space(5), backgroundColor: '#1A2236', borderWidth: 2, borderColor: colors.gold, alignItems: 'center', gap: space(2) },
  top: { width: '100%', flexDirection: 'row', justifyContent: 'space-between' },
  level: { color: colors.gold, fontSize: 40, fontWeight: '900' },
  label: { color: colors.gold, fontSize: 13, fontWeight: '700' },
  brand: { color: colors.muted, fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.surfaceAlt, borderWidth: 2, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.text, fontSize: 40, fontWeight: '800' },
  name: { color: colors.text, fontSize: 22, fontWeight: '800' },
  divider: { height: 1, width: '80%', backgroundColor: colors.gold, opacity: 0.5 },
  stats: { width: '100%', flexDirection: 'row', justifyContent: 'space-around' },
  statV: { color: colors.text, fontSize: 18, fontWeight: '800' },
  statK: { color: colors.muted, fontSize: 11 },
  city: { color: colors.muted, fontSize: 12, marginTop: 'auto' },
});
