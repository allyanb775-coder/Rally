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
import { tr } from '@/lib/i18n';

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
        {board(tr('النتيجة النهائية', 'Final score'))}
        <T variant="h3" style={{ color: won ? colors.led : colors.text }}>{won ? tr('فزتوا 🏆', 'You won 🏆') : tr('خسرتوا هالمرة', 'You lost this time')}</T>
      </View>
    );
  }

  if (!needsResult(m)) return null;

  if (!r) {
    return (
      <Board style={{ gap: space(3) }}>
        <T variant="h3">{tr('انتهت المباراة؟', 'Match over?')}</T>
        <T style={{ color: colors.inkMuted }}>{tr('سجّل الأشواط على اللوحة، وبعد ما يأكدها الفريق الثاني يتعدل مستوى الأربعة.', 'Enter the sets on the board. Once the other team confirms, all four levels update.')}</T>
        <Button title={tr('سجّل النتيجة', 'Enter result')} icon="trophy" onPress={() => router.push({ pathname: '/result/[id]', params: { id: m.id } })} />
      </Board>
    );
  }

  const reporter = players[r.reportedBy]?.name ?? tr('لاعب', 'Player');
  if (teamOf(m, r.reportedBy) === myTeam) {
    return (
      <View style={{ gap: space(2) }}>
        {board(tr('بانتظار التأكيد', 'Awaiting confirmation'))}
        <T variant="small">{tr(`${reporter} سجّلها، وننتظر واحد من الفريق الثاني يأكدها.`, `${reporter} reported it. Waiting for a player from the other team to confirm.`)}</T>
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
      {board(tr(`${reporter} سجّلها`, `Reported by ${reporter}`))}
      {mine && (
        <T variant="small">
          {tr(`إذا أكدتها يصير مستواك ${fmtLevel(mine.after)} (كان ${fmtLevel(mine.before)})`, `If you confirm, your level becomes ${fmtLevel(mine.after)} (was ${fmtLevel(mine.before)})`)}
        </T>
      )}
      <Row style={{ gap: space(3) }}>
        <View style={{ flex: 1 }}>
          <Button title={tr('أكّد النتيجة', 'Confirm result')} icon="check" disabled={busy} onPress={() => act(true)} />
        </View>
        <View style={{ flex: 1 }}>
          <Button title={tr('مو صحيحة', 'Not correct')} variant="ghost" disabled={busy} onPress={() => act(false)} />
        </View>
      </Row>
    </View>
  );
}
