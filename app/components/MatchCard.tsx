import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, fonts, radius, space } from '@/constants/theme';
import { fmtDay, fmtLevel, fmtNum, fmtTime } from '@/lib/format';
import { useStore } from '@/lib/store';
import { Match, MATCH_SIZE } from '@/lib/types';
import { Court } from './Court';
import { Icon, LevelBadge, Row, T } from './ui';

/** A match as a ticket: time stub, the court with its players, then the venue. */
export function MatchCard({ match, highlight, compact }: { match: Match; highlight?: boolean; compact?: boolean }) {
  const missing = MATCH_SIZE - match.playerIds.length;
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/match/[id]', params: { id: match.id } })}
      style={({ pressed }) => [pressed && { transform: [{ scale: 0.985 }] }, compact && { width: 280 }]}>
      <View style={[s.ticket, highlight && { borderColor: colors.accent }]}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <T variant="label">{fmtDay(match.startsAt)}</T>
            <T style={s.time}>{fmtTime(match.startsAt)}</T>
          </View>
          <View style={[s.kind, match.kind === 'competitive' && s.kindComp]}>
            <T style={[s.kindText, match.kind === 'competitive' && { color: colors.accentInk }]}>
              {match.kind === 'competitive' ? 'تنافسية' : 'ودية'}
            </T>
          </View>
        </Row>

        <Court playerIds={match.playerIds} size={compact ? 'sm' : 'md'} />

        <View style={s.perf}>
          <View style={[s.notch, { left: -26 }]} />
          <View style={s.dash} />
          <View style={[s.notch, { right: -26 }]} />
        </View>

        <Row style={{ justifyContent: 'space-between' }}>
          <View style={{ flexShrink: 1, gap: 2 }}>
            <T variant="h3" numberOfLines={1}>{match.court}</T>
            <Row style={{ gap: 4 }}>
              <Icon name="pin" size={12} color={colors.muted} />
              <T variant="small">{match.city}</T>
            </Row>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <Row style={{ gap: 6 }}>
              <T variant="small">المستوى</T>
              <T style={s.range}>
                {fmtLevel(match.minLevel)}–{fmtLevel(match.maxLevel)}
              </T>
            </Row>
            {missing > 0 ? (
              <T style={s.missing}>{missing === 1 ? 'ناقص لاعب واحد' : `ناقص ${fmtNum(missing)}`}</T>
            ) : (
              <T variant="small">مكتملة</T>
            )}
          </View>
        </Row>
      </View>
    </Pressable>
  );
}

export function PlayerRow({ id, host }: { id: string; host?: boolean }) {
  const { players, me } = useStore();
  const p = players[id];
  if (!p) return null;
  return (
    <Row style={{ justifyContent: 'space-between', paddingVertical: 6 }}>
      <Row>
        <View style={[s.avatar, id === me.id && { backgroundColor: colors.accent }]}>
          <T style={{ fontFamily: fonts.extra, color: id === me.id ? colors.accentInk : colors.text }}>{p.name[0]}</T>
        </View>
        <View>
          <T variant="h3">{p.name}</T>
          <T variant="small">{host ? 'صاحب المباراة' : `${fmtNum(p.matchesPlayed)} مباراة`}</T>
        </View>
      </Row>
      <LevelBadge level={p.level} />
    </Row>
  );
}

const s = StyleSheet.create({
  ticket: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space(4), gap: space(3), borderWidth: 1.5, borderColor: colors.border, overflow: 'hidden' },
  time: { fontFamily: fonts.black, fontSize: 28, lineHeight: 34 },
  kind: { borderRadius: radius.pill, paddingHorizontal: 12, height: 28, justifyContent: 'center', backgroundColor: colors.surface2 },
  kindComp: { backgroundColor: colors.accent },
  kindText: { fontFamily: fonts.bold, fontSize: 12 },
  perf: { height: 14, justifyContent: 'center' },
  dash: { borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: colors.border, marginHorizontal: 4 },
  notch: { position: 'absolute', width: 28, height: 28, borderRadius: 14, backgroundColor: colors.bg, top: -7 },
  range: { fontFamily: fonts.bold, fontSize: 14 },
  missing: { color: colors.accent, fontFamily: fonts.bold, fontSize: 13 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
});
