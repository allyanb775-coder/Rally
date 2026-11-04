import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Led, ledLevel } from '@/components/Led';
import { Scoreboard } from '@/components/Scoreboard';
import { Board, Button, Heading, Icon, Row, Screen, T } from '@/components/ui';
import { colors, fonts, radius, space } from '@/constants/theme';
import { ltr } from '@/lib/format';
import { levelChanges, needsResult, nextGames, scoreFromSets, SetScore, teamOf, teams, winnerFromSets } from '@/lib/result';
import { useStore } from '@/lib/store';
import { Team } from '@/lib/types';

const EMPTY: SetScore[] = [
  [null, null],
  [null, null],
  [null, null],
];

/** Enter the result on a court-style scoreboard: tap a set box to add a game. */
export default function ReportResult() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { matches, players, me, reportResult } = useStore();
  const m = matches.find((x) => x.id === id);
  const [sets, setSets] = useState<SetScore[]>(EMPTY);
  const [busy, setBusy] = useState(false);

  if (!m || !needsResult(m) || m.result || !teamOf(m, me.id)) {
    return (
      <Screen>
        <Stack.Screen options={{ headerShown: false }} />
        <T variant="h2">ما تقدر تسجل نتيجة هالمباراة.</T>
        <Button title="رجوع" variant="ghost" onPress={() => router.back()} />
      </Screen>
    );
  }

  const myTeam = teamOf(m, me.id)!;
  const t = teams(m);
  const names = { 1: t[1].map((p) => players[p]?.name ?? ''), 2: t[2].map((p) => players[p]?.name ?? '') } as Record<Team, string[]>;
  const winner = winnerFromSets(sets);
  const change = winner ? levelChanges(m, players, winner)[me.id] : null;

  const tap = (i: number, team: Team) =>
    setSets((ss) => ss.map((set, j) => (j !== i ? set : team === 1 ? [nextGames(set[0]), set[1]] : [set[0], nextGames(set[1])])) as SetScore[]);

  const submit = async () => {
    if (!winner) return;
    setBusy(true);
    const ok = await reportResult(m.id, winner, scoreFromSets(sets, winner));
    setBusy(false);
    if (ok) router.back();
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen>
        <Row style={{ justifyContent: 'space-between' }}>
          <Heading en="Result" ar="النتيجة" size="xl" />
          <Pressable onPress={() => router.back()} style={s.close} accessibilityLabel="إغلاق">
            <Icon name="close" size={20} />
          </Pressable>
        </Row>
        <T variant="muted">اضغط على خانة الشوط عشان تزيد الأشواط، مثل لوحة الملعب.</T>

        <Scoreboard teams={names} sets={sets} venue={m.court} status={winner ? 'جاهزة للإرسال' : 'سجّل الأشواط'} onTap={tap} highlightTeam={myTeam} />

        <Row style={{ justifyContent: 'space-between' }}>
          <T variant="small">{winner ? `الفايز: ${names[winner].join(' و ')}` : 'لين يتحدد الفايز من الأشواط'}</T>
          <Pressable onPress={() => setSets(EMPTY)} hitSlop={8}>
            <T style={{ color: colors.led, fontFamily: fonts.bold, textDecorationLine: 'underline' }}>صفّر</T>
          </Pressable>
        </Row>

        {change && (
          <Board style={{ gap: space(2) }}>
            <T style={s.label}>بعد التأكيد يصير مستواك</T>
            <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <Led value={ledLevel(change.after)} dot={6} color={change.after >= change.before ? colors.led : colors.danger} />
              <T style={{ fontFamily: fonts.extra, fontSize: 18, lineHeight: 32, color: change.after >= change.before ? colors.led : colors.danger }}>
                {ltr(`${change.after >= change.before ? '+' : ''}${(change.after - change.before).toFixed(2)}`)}
              </T>
            </Row>
            <T style={{ color: colors.inkMuted, fontSize: 12 }}>يتعدل مستوى الأربعة بعد ما يأكد لاعب من الفريق الثاني.</T>
          </Board>
        )}

        <Button title={busy ? '...' : 'أرسل النتيجة'} icon="check" disabled={!winner || busy} onPress={submit} />
      </Screen>
    </View>
  );
}

const s = StyleSheet.create({
  close: { width: 44, height: 44, borderRadius: radius.sm, borderWidth: 2, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: fonts.kufi, fontSize: 12, lineHeight: 22, color: colors.inkMuted },
});
