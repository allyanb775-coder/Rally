import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, fonts, radius, space } from '@/constants/theme';
import { fmtDay, fmtNum, fmtRange } from '@/lib/format';
import { needsResult, teamOf } from '@/lib/result';
import { useStore } from '@/lib/store';
import { Match, MATCH_SIZE } from '@/lib/types';
import { Glass } from './Glass';
import { Led, ledTime } from './Led';
import { LevelBadge, Row, T } from './ui';

/** One fixture on the schedule board: LED time block, venue, and the four spots. */
export function MatchCard({ match }: { match: Match; highlight?: boolean; compact?: boolean }) {
  const { players, me } = useStore();
  const missing = MATCH_SIZE - match.playerIds.length;
  // After the match: what the result needs from me, if anything.
  let resultNote: string | null = null;
  if (match.result?.status === 'confirmed' && match.playerIds.includes(me.id)) {
    resultNote = teamOf(match, me.id) === match.result.winningTeam ? 'فزتوا 🏆' : 'خسرتوا';
  } else if (needsResult(match) && match.playerIds.includes(me.id)) {
    const r = match.result;
    resultNote = !r ? 'سجّل النتيجة' : teamOf(match, r.reportedBy) === teamOf(match, me.id) ? 'بانتظار تأكيدهم' : 'أكّد النتيجة';
  }
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/match/[id]', params: { id: match.id } })}
      style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
      <Glass style={s.row}>
      <View style={s.time}>
        <Led value={ledTime(match.startsAt)} dot={3} />
        <T style={s.day}>{fmtDay(match.startsAt)}</T>
      </View>
      <View style={{ flex: 1, gap: 4, minWidth: 0 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <T variant="h3" numberOfLines={1} style={{ flexShrink: 1 }}>{match.court}</T>
          {match.kind === 'competitive' && <T style={s.comp}>تنافسية</T>}
        </Row>
        <T variant="small">
          {match.city} · المستوى {fmtRange(match.minLevel, match.maxLevel)}
        </T>
        <Row style={{ justifyContent: 'space-between', marginTop: 2 }}>
          <Row style={{ gap: 5 }}>
            {Array.from({ length: MATCH_SIZE }).map((_, i) => {
              const id = match.playerIds[i];
              const p = id ? players[id] : undefined;
              return <View key={i} style={[s.spot, p ? { backgroundColor: id === me.id ? colors.led : colors.text } : s.spotEmpty]} />;
            })}
          </Row>
          {resultNote ? (
            <T style={[s.missing, { color: resultNote === 'بانتظار تأكيدهم' ? colors.muted : colors.led }]}>{resultNote} ←</T>
          ) : (
            <T style={[s.missing, missing === 0 && { color: colors.muted }]}>
              {missing === 0 ? 'مكتملة' : missing === 1 ? 'ناقص لاعب' : `ناقص ${fmtNum(missing)}`}
            </T>
          )}
        </Row>
      </View>
      </Glass>
    </Pressable>
  );
}

export function PlayerRow({ id, host }: { id: string; host?: boolean }) {
  const { players, me } = useStore();
  const p = players[id];
  if (!p) return null;
  return (
    <Pressable onPress={() => (id === me.id ? router.push('/profile') : router.push({ pathname: '/player/[id]', params: { id } }))}>
    <Row style={s.player}>
      <View style={[s.avatar, id === me.id && { backgroundColor: colors.led }]}>
        <T style={{ fontFamily: fonts.kufi, color: colors.ink, lineHeight: 24 }}>{p.name[0]}</T>
      </View>
      <View style={{ flex: 1 }}>
        <T variant="h3">{p.name}</T>
        <T variant="small">{host ? 'صاحب المباراة' : `${fmtNum(p.matchesPlayed)} مباراة`}</T>
      </View>
      <LevelBadge level={p.level} />
    </Row>
    </Pressable>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: space(3), alignItems: 'stretch', padding: space(3), paddingHorizontal: space(4) },
  time: { backgroundColor: colors.ink, borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', gap: 6 },
  day: { fontFamily: fonts.bold, fontSize: 11, color: colors.inkMuted, textAlign: 'center' },
  comp: { fontFamily: fonts.kufi, fontSize: 10, lineHeight: 18, color: colors.led, borderWidth: 1, borderColor: colors.led, paddingHorizontal: 6, borderRadius: 2 },
  spot: { width: 16, height: 16, borderRadius: 8 },
  spotEmpty: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.led },
  missing: { fontFamily: fonts.bold, fontSize: 13, color: colors.led },
  player: { paddingVertical: 8, borderTopWidth: 1, borderColor: colors.lineSoft, gap: space(3) },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center' },
});
