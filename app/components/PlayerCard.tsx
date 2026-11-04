import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '@/constants/theme';
import { levelLabel } from '@/lib/level';
import { Player } from '@/lib/types';
import { Led, ledLevel, ledNum } from './Led';

/** The player's card, built like a scoreboard plate, to share as a story. */
export function PlayerCard({ player }: { player: Player }) {
  const winRate = player.matchesPlayed ? Math.round((player.wins / player.matchesPlayed) * 100) : 0;
  return (
    <View style={s.card}>
      <View style={s.head}>
        <Text style={s.brand}>RALLY</Text>
        <Text style={s.city}>{player.city}</Text>
      </View>
      <View style={s.mid}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{player.name[0]}</Text>
        </View>
        <View style={{ gap: 8, alignItems: 'flex-start' }}>
          <Led value={ledLevel(player.level)} dot={7} />
          <Text style={s.label}>{levelLabel(player.level)}</Text>
        </View>
      </View>
      <Text style={s.name} numberOfLines={1}>
        {player.name}
      </Text>
      <View style={s.stats}>
        <Stat k="مباريات" v={ledNum(player.matchesPlayed)} />
        <View style={s.div} />
        <Stat k="فوز" v={ledNum(player.wins)} />
        <View style={s.div} />
        <Stat k="نسبة الفوز %" v={ledNum(winRate)} />
      </View>
    </View>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <View style={{ alignItems: 'center', gap: 6, flex: 1 }}>
      <Led value={v} dot={3} />
      <Text style={s.statK}>{k}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: { alignSelf: 'center', width: 320, maxWidth: '100%', backgroundColor: colors.ink, borderRadius: radius.lg, borderWidth: 3, borderColor: '#0B1430', overflow: 'hidden' },
  head: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: colors.led },
  brand: { fontFamily: fonts.black, fontSize: 14, lineHeight: 26, color: colors.ink, letterSpacing: 3 },
  city: { fontFamily: fonts.kufi, fontSize: 12, lineHeight: 26, color: colors.ink },
  mid: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18 },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.turf, borderWidth: 3, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.text, fontSize: 40, lineHeight: 80, fontFamily: fonts.black },
  label: { fontFamily: fonts.kufi, fontSize: 13, lineHeight: 22, color: colors.led },
  name: { color: colors.text, fontSize: 26, lineHeight: 44, fontFamily: fonts.black, paddingHorizontal: 18, textAlign: 'right' },
  stats: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 2, borderColor: '#1A2340', paddingVertical: 14, marginTop: 6 },
  div: { width: 2, alignSelf: 'stretch', backgroundColor: '#1A2340' },
  statK: { color: colors.inkMuted, fontSize: 11, fontFamily: fonts.medium },
});
