import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, space } from '@/constants/theme';
import { fmtLevel, fmtNum, fmtWhen } from '@/lib/format';
import { useStore } from '@/lib/store';
import { Match, MATCH_SIZE } from '@/lib/types';
import { Card, Icon, LevelBadge, Pill, Row, T } from './ui';

export function MatchCard({ match, highlight }: { match: Match; highlight?: boolean }) {
  const { players } = useStore();
  const missing = MATCH_SIZE - match.playerIds.length;
  return (
    <Pressable onPress={() => router.push({ pathname: '/match/[id]', params: { id: match.id } })}>
      <Card style={highlight ? { borderColor: colors.accent, borderWidth: 2 } : undefined}>
        <Row style={{ justifyContent: 'space-between' }}>
          <T variant="h2">{match.court}</T>
          <Pill label={match.kind === 'competitive' ? 'تنافسية' : 'ودية'} active={match.kind === 'competitive'} />
        </Row>
        <Row>
          <Icon name="clock" color={colors.muted} size={14} />
          <T variant="muted">{fmtWhen(match.startsAt)}</T>
          <Icon name="pin" color={colors.muted} size={14} />
          <T variant="muted">{fmtNum(match.distanceKm)} كم</T>
        </Row>
        <T variant="muted">
          المستوى {fmtLevel(match.minLevel)} – {fmtLevel(match.maxLevel)}
        </T>
        <Row style={{ justifyContent: 'space-between', marginTop: space(1) }}>
          <Row style={{ gap: space(1.5) }}>
            {Array.from({ length: MATCH_SIZE }).map((_, i) => {
              const p = players[match.playerIds[i]];
              return (
                <View key={i} style={[styles.slot, !p && styles.empty]}>
                  {p ? <T style={{ fontWeight: '700' }}>{p.name[0]}</T> : <T variant="muted">+</T>}
                </View>
              );
            })}
          </Row>
          {missing > 0 ? (
            <T style={{ color: colors.accent, fontWeight: '700' }}>{missing === 1 ? 'ناقص لاعب' : `ناقص ${fmtNum(missing)}`}</T>
          ) : (
            <T variant="muted">مكتملة</T>
          )}
        </Row>
      </Card>
    </Pressable>
  );
}

export function PlayerRow({ id }: { id: string }) {
  const p = useStore().players[id];
  if (!p) return null;
  return (
    <Row style={{ justifyContent: 'space-between' }}>
      <Row>
        <View style={styles.slot}>
          <T style={{ fontWeight: '700' }}>{p.name[0]}</T>
        </View>
        <T>{p.name}</T>
      </Row>
      <LevelBadge level={p.level} />
    </Row>
  );
}

const styles = StyleSheet.create({
  slot: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  empty: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.muted, backgroundColor: 'transparent' },
});
