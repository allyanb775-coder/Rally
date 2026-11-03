import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '@/constants/theme';
import { fmtLevel, fmtNum } from '@/lib/format';
import { levelLabel } from '@/lib/level';
import { Player } from '@/lib/types';

/** FIFA-style card to share as a story. */
export function PlayerCard({ player }: { player: Player }) {
  const winRate = player.matchesPlayed ? Math.round((player.wins / player.matchesPlayed) * 100) : 0;
  return (
    <LinearGradient colors={['#FBE7A1', colors.gold, colors.goldDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.frame}>
      <LinearGradient colors={['#1B1A12', '#0C0B07']} style={s.card}>
        <View style={s.top}>
          <View style={{ alignItems: 'center' }}>
            <Text style={s.level}>{fmtLevel(player.level)}</Text>
            <Text style={s.label}>{levelLabel(player.level)}</Text>
          </View>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{player.name[0]}</Text>
          </View>
        </View>
        <Text style={s.name} numberOfLines={1}>
          {player.name}
        </Text>
        <View style={s.divider} />
        <View style={s.stats}>
          <Stat k="مباريات" v={fmtNum(player.matchesPlayed)} />
          <Stat k="فوز" v={fmtNum(player.wins)} />
          <Stat k="نسبة الفوز" v={`${fmtNum(winRate)}٪`} />
        </View>
        <View style={s.foot}>
          <Text style={s.city}>{player.city}</Text>
          <Text style={s.brand}>RALLY</Text>
        </View>
      </LinearGradient>
    </LinearGradient>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <View style={{ alignItems: 'center', gap: 2 }}>
      <Text style={s.statV}>{v}</Text>
      <Text style={s.statK}>{k}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  frame: { alignSelf: 'center', width: 280, maxWidth: '100%', borderRadius: radius.lg + 4, padding: 3 },
  card: { borderRadius: radius.lg, padding: 22, gap: 12 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  level: { color: colors.gold, fontSize: 52, lineHeight: 58, fontFamily: fonts.black },
  label: { color: colors.gold, fontSize: 13, fontFamily: fonts.bold },
  avatar: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#2A2717', borderWidth: 2, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.text, fontSize: 48, fontFamily: fonts.black },
  name: { color: colors.text, fontSize: 26, fontFamily: fonts.extra, textAlign: 'center' },
  divider: { height: 1, backgroundColor: colors.gold, opacity: 0.4 },
  stats: { flexDirection: 'row', justifyContent: 'space-around' },
  statV: { color: colors.text, fontSize: 22, fontFamily: fonts.extra },
  statK: { color: '#B9AE86', fontSize: 11, fontFamily: fonts.medium },
  foot: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  city: { color: '#B9AE86', fontSize: 12, fontFamily: fonts.medium },
  brand: { color: colors.gold, fontSize: 12, fontFamily: fonts.black, letterSpacing: 3 },
});
