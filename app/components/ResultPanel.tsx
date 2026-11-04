import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { colors, fonts, space } from '@/constants/theme';
import { fmtLevel, ltr } from '@/lib/format';
import { levelChanges, needsResult, teamOf, teams } from '@/lib/result';
import { useStore } from '@/lib/store';
import { Match } from '@/lib/types';
import { Board, Button, Row, T } from './ui';

/** Result section on a match page: report, wait, confirm/dispute, or the final score. */
export function ResultPanel({ match: m }: { match: Match }) {
  const { me, players, confirmResult } = useStore();
  const [busy, setBusy] = useState(false);
  const myTeam = teamOf(m, me.id);
  if (!myTeam || m.kind !== 'competitive') return null;
  const r = m.result;
  const names = (team: 1 | 2) => teams(m)[team].map((id) => players[id]?.name ?? '').join(' و ');

  if (r?.status === 'confirmed') {
    const won = r.winningTeam === myTeam;
    return (
      <Board style={{ gap: space(2) }}>
        <T style={{ fontFamily: fonts.kufi, fontSize: 11, lineHeight: 18, color: colors.inkMuted }}>النتيجة النهائية</T>
        <T variant="h2" style={{ color: won ? colors.led : colors.text }}>{won ? 'فزتوا 🏆' : 'خسرتوا هالمرة'}</T>
        <T style={{ color: colors.text }}>فاز {names(r.winningTeam)}{r.score ? ` · ${ltr(r.score)}` : ''}</T>
      </Board>
    );
  }

  if (!needsResult(m)) return null;

  if (!r) {
    return (
      <Board style={{ gap: space(3) }}>
        <T variant="h3">انتهت المباراة؟</T>
        <T style={{ color: colors.inkMuted }}>سجّل النتيجة، وبعد ما يأكدها الفريق الثاني يتعدل مستوى الأربعة.</T>
        <Button title="سجّل النتيجة" icon="trophy" onPress={() => router.push({ pathname: '/result/[id]', params: { id: m.id } })} />
      </Board>
    );
  }

  const reporterTeam = teamOf(m, r.reportedBy);
  const reporter = players[r.reportedBy]?.name ?? 'لاعب';
  if (reporterTeam === myTeam) {
    return (
      <Board style={{ gap: space(2) }}>
        <T variant="h3">بانتظار تأكيد الفريق الثاني</T>
        <T style={{ color: colors.inkMuted }}>
          {reporter} سجّل: فاز {names(r.winningTeam)}{r.score ? ` · ${ltr(r.score)}` : ''}
        </T>
      </Board>
    );
  }

  const mine = levelChanges(m, players, r.winningTeam)[me.id];
  const act = async (accept: boolean) => {
    setBusy(true);
    await confirmResult(m.id, accept);
    setBusy(false);
  };
  return (
    <Board style={{ gap: space(3) }}>
      <T variant="h3">{reporter} سجّل النتيجة</T>
      <T style={{ color: colors.text }}>
        فاز {names(r.winningTeam)}{r.score ? ` · ${ltr(r.score)}` : ''}
      </T>
      {mine && (
        <T style={{ color: colors.inkMuted }}>
          إذا أكدتها يصير مستواك {fmtLevel(mine.after)} (كان {fmtLevel(mine.before)})
        </T>
      )}
      <Row style={{ gap: space(3) }}>
        <View style={{ flex: 1 }}>
          <Button title="أكّد" icon="check" disabled={busy} onPress={() => act(true)} />
        </View>
        <View style={{ flex: 1 }}>
          <Button title="مو صحيحة" variant="ghost" disabled={busy} onPress={() => act(false)} />
        </View>
      </Row>
    </Board>
  );
}
