import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, fonts, space } from '@/constants/theme';
import { fmtDay, fmtNum, fmtRange } from '@/lib/format';
import { needsResult, teamOf } from '@/lib/result';
import { useStore } from '@/lib/store';
import { Match, MATCH_SIZE } from '@/lib/types';
import { Glass } from './Glass';
import { Led, ledTime } from './Led';
import { LevelBadge, Row, T } from './ui';
import { tr } from '@/lib/i18n';
import { cityLabel } from '@/lib/cities';

/** One fixture on the schedule board: LED time block, venue, and the four spots. */
export function MatchCard({ match }: { match: Match; highlight?: boolean; compact?: boolean }) {
  const { players, me, communities } = useStore();
  const community = match.communityId ? communities.find((c) => c.id === match.communityId) : undefined;
  const missing = MATCH_SIZE - match.playerIds.length;
  // After the match: what the result needs from me, if anything.
  let resultNote: string | null = null;
  if (needsResult(match) && match.playerIds.includes(me.id)) {
    const r = match.result;
    resultNote = !r ? tr('سجّل النتيجة', 'Enter result') : teamOf(match, r.reportedBy) === teamOf(match, me.id) ? tr('بانتظار تأكيدهم', 'Awaiting their confirmation') : tr('أكّد النتيجة', 'Confirm result');
  }
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/match/[id]', params: { id: match.id } })}
      style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
      <Glass style={s.row}>
      <View style={s.time}>
        <Led value={ledTime(match.startsAt)} dot={3.6} color="#FFFFFF" />
        <T style={s.day}>{fmtDay(match.startsAt)}</T>
      </View>
      <View style={{ flex: 1, gap: 4, minWidth: 0 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <T variant="h3" numberOfLines={1} style={{ flexShrink: 1 }}>{match.court}</T>
          {match.kind === 'competitive' && <T style={s.comp}>RANKED</T>}
        </Row>
        <T variant="small">
          {community ? `${community.name} · ` : ''}{cityLabel(match.city)} · {tr('المستوى', 'Level')} {fmtRange(match.minLevel, match.maxLevel)}
        </T>
        <Row style={{ justifyContent: 'space-between', marginTop: 2 }}>
          <Row style={{ gap: 5 }}>
            {Array.from({ length: MATCH_SIZE }).map((_, i) => {
              const id = match.playerIds[i];
              const p = id ? players[id] : undefined;
              return <View key={i} style={[s.spot, p ? { backgroundColor: id === me.id ? colors.blue : colors.text } : s.spotEmpty]} />;
            })}
          </Row>
          {resultNote ? (
            <T style={[s.missing, { color: resultNote === tr('بانتظار تأكيدهم', 'Awaiting their confirmation') ? colors.muted : colors.led }]}>{resultNote} {tr('←', '→')}</T>
          ) : (
            <T style={[s.missing, missing === 0 && { color: colors.muted }]}>
              {missing === 0 ? tr('مكتملة', 'Full') : missing === 1 ? tr('ناقص لاعب', 'Need 1 player') : tr(`ناقص ${fmtNum(missing)}`, `Need ${fmtNum(missing)}`)}
            </T>
          )}
        </Row>
      </View>
      </Glass>
    </Pressable>
  );
}

export function PlayerRow({ id, host, hostLabel = tr('صاحب المباراة', 'Host') }: { id: string; host?: boolean; hostLabel?: string }) {
  const { players, me } = useStore();
  const p = players[id];
  if (!p) return null;
  return (
    <Pressable onPress={() => (id === me.id ? router.push('/profile') : router.push({ pathname: '/player/[id]', params: { id } }))}>
    <Row style={s.player}>
      <View style={[s.avatar, id === me.id && { backgroundColor: colors.blue }]}>
        <T style={{ fontFamily: fonts.kufi, color: colors.ink, lineHeight: 24 }}>{p.name[0]}</T>
      </View>
      <View style={{ flex: 1 }}>
        <T variant="h3">{p.name}</T>
        <T variant="small">{host ? hostLabel : `${fmtNum(p.matchesPlayed)} ${tr('مباراة', 'matches')}`}</T>
      </View>
      <LevelBadge level={p.level} />
    </Row>
    </Pressable>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: space(3), alignItems: 'stretch', padding: space(3), paddingHorizontal: space(4) },
  time: { backgroundColor: colors.blue, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', gap: 2, minWidth: 84 },
  day: { fontFamily: fonts.bold, fontSize: 11, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  comp: { fontFamily: fonts.display, fontSize: 10, letterSpacing: 1, lineHeight: 18, color: '#FFFFFF', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 8, borderRadius: 999, overflow: 'hidden' },
  spot: { width: 16, height: 16, borderRadius: 8 },
  spotEmpty: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.5)' },
  missing: { fontFamily: fonts.bold, fontSize: 13, color: '#8FB0FF' },
  player: { paddingVertical: 8, borderTopWidth: 1, borderColor: colors.lineSoft, gap: space(3) },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center' },
});
