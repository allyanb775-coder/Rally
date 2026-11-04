import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { colors, space } from '@/constants/theme';
import { fmtLevel } from '@/lib/format';
import { levelChanges, needsResult, setsFromScore, teamOf, teams } from '@/lib/result';
import { useStore } from '@/lib/store';
import { Match, Team } from '@/lib/types';
import { Scoreboard } from './Scoreboard';
import { Board, Button, Row, T } from './ui';

/** Result section on a match page: report, wait, confirm/dispute, or the final scoreboard. */
export function ResultPanel({ match: m }: { match: Match }) {
  const { me, players, confirmResult } = useStore();
  const [busy, setBusy] = useState(false);
  const myTeam = teamOf(m, me.id);
  if (!myTeam || m.kind !== 'competitive') return null;
  const r = m.result;
  const t = teams(m);
  const names = { 1: t[1].map((p) => players[p]?.name ?? ''), 2: t[2].map((p) => players[p]?.name ?? '') } as Record<Team, string[]>;

  // A reported result with no set scores still shows who won.
  const board = (status: string) => {
    if (!r) return null;
    const sets = setsFromScore(r.score, r.winningTeam);
    return (
      <Scoreboard
        teams={names}
        sets={sets.length ? sets : [r.winningTeam === 1 ? [1, 0] : [0, 1]]}
        status={status}
        venue={m.court}
        highlightTeam={myTeam}
      />
    );
  };

  if (r?.status === 'confirmed') {
    const won = r.winningTeam === myTeam;
    return (
      <View style={{ gap: space(2) }}>
        {board('النتيجة النهائية')}
        <T variant="h3" style={{ color: won ? colors.led : colors.text }}>{won ? 'فزتوا 🏆' : 'خسرتوا هالمرة'}</T>
      </View>
    );
  }

  if (!needsResult(m)) return null;

  if (!r) {
    return (
      <Board style={{ gap: space(3) }}>
        <T variant="h3">انتهت المباراة؟</T>
        <T style={{ color: colors.inkMuted }}>سجّل الأشواط على اللوحة، وبعد ما يأكدها الفريق الثاني يتعدل مستوى الأربعة.</T>
        <Button title="سجّل النتيجة" icon="trophy" onPress={() => router.push({ pathname: '/result/[id]', params: { id: m.id } })} />
      </Board>
    );
  }

  const reporter = players[r.reportedBy]?.name ?? 'لاعب';
  if (teamOf(m, r.reportedBy) === myTeam) {
    return (
      <View style={{ gap: space(2) }}>
        {board('بانتظار التأكيد')}
        <T variant="small">{reporter} سجّلها، وننتظر واحد من الفريق الثاني يأكدها.</T>
      </View>
    );
  }

  const mine = levelChanges(m, players, r.winningTeam)[me.id];
  const act = async (accept: boolean) => {
    setBusy(true);
    await confirmResult(m.id, accept);
    setBusy(false);
  };
  return (
    <View style={{ gap: space(3) }}>
      {board(`${reporter} سجّلها`)}
      {mine && (
        <T variant="small">
          إذا أكدتها يصير مستواك {fmtLevel(mine.after)} (كان {fmtLevel(mine.before)})
        </T>
      )}
      <Row style={{ gap: space(3) }}>
        <View style={{ flex: 1 }}>
          <Button title="أكّد النتيجة" icon="check" disabled={busy} onPress={() => act(true)} />
        </View>
        <View style={{ flex: 1 }}>
          <Button title="مو صحيحة" variant="ghost" disabled={busy} onPress={() => act(false)} />
        </View>
      </Row>
    </View>
  );
}
