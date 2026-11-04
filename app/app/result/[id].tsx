import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Glass } from '@/components/Glass';
import { Led, ledLevel } from '@/components/Led';
import { Board, Button, Icon, Row, Screen, T } from '@/components/ui';
import { colors, fonts, radius, space } from '@/constants/theme';
import { ltr } from '@/lib/format';
import { formatScore, levelChanges, needsResult, teamOf, teams } from '@/lib/result';
import { useStore } from '@/lib/store';
import { Team } from '@/lib/types';

/** Who won, optional set scores, and what it does to your level before you send it. */
export default function ReportResult() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { matches, players, me, reportResult } = useStore();
  const m = matches.find((x) => x.id === id);
  const [winner, setWinner] = useState<Team | null>(null);
  const [sets, setSets] = useState<[string, string][]>([['', ''], ['', ''], ['', '']]);
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
  const change = winner ? levelChanges(m, players, winner)[me.id] : null;
  const setScore = (i: number, side: 0 | 1, v: string) =>
    setSets((ss) => ss.map((s, j) => (j === i ? (side === 0 ? [v.replace(/\D/g, ''), s[1]] : [s[0], v.replace(/\D/g, '')]) : s)) as [string, string][]);

  const submit = async () => {
    if (!winner) return;
    setBusy(true);
    // Scores are entered as "my team – their team"; store them from the winner's side.
    const fromWinner = sets.map(([a, b]) => (winner === myTeam ? [a, b] : [b, a])) as [string, string][];
    const ok = await reportResult(m.id, winner, formatScore(fromWinner));
    setBusy(false);
    if (ok) router.back();
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen>
        <Row style={{ justifyContent: 'space-between' }}>
          <T variant="h1">النتيجة</T>
          <Pressable onPress={() => router.back()} style={s.close} accessibilityLabel="إغلاق">
            <Icon name="close" size={20} />
          </Pressable>
        </Row>
        <T variant="muted">{m.court} · مباراة تنافسية</T>

        <T variant="label">مين فاز؟</T>
        <Row style={{ gap: space(3), alignItems: 'stretch' }}>
          {([1, 2] as Team[]).map((team) => {
            const on = winner === team;
            return (
              <Pressable key={team} onPress={() => setWinner(team)} style={{ flex: 1 }}>
                <Glass strong={on} style={[s.team, on && s.teamOn]}>
                  <T style={s.teamLabel}>{team === myTeam ? 'فريقك' : 'الخصم'}</T>
                  {t[team].map((pid) => (
                    <T key={pid} variant="h3" style={on ? { color: colors.led } : undefined}>
                      {players[pid]?.name}
                    </T>
                  ))}
                  {on && <T style={s.win}>فاز ✓</T>}
                </Glass>
              </Pressable>
            );
          })}
        </Row>

        <T variant="label">الأشواط (اختياري) · فريقك – الخصم</T>
        <Board style={{ gap: space(2) }}>
          {sets.map(([a, b], i) => (
            <Row key={i} style={{ justifyContent: 'space-between' }}>
              <T style={s.setLabel}>الشوط {i + 1}</T>
              <Row style={{ gap: 8 }}>
                <TextInput value={a} onChangeText={(v) => setScore(i, 0, v)} keyboardType="number-pad" maxLength={1} style={s.box} placeholder="-" placeholderTextColor={colors.inkMuted} accessibilityLabel={`شوط ${i + 1} فريقك`} />
                <T style={{ color: colors.inkMuted }}>–</T>
                <TextInput value={b} onChangeText={(v) => setScore(i, 1, v)} keyboardType="number-pad" maxLength={1} style={s.box} placeholder="-" placeholderTextColor={colors.inkMuted} accessibilityLabel={`شوط ${i + 1} الخصم`} />
              </Row>
            </Row>
          ))}
        </Board>

        {change && (
          <Board style={{ gap: space(2) }}>
            <T style={s.setLabel}>بعد التأكيد يصير مستواك</T>
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
  team: { minHeight: 130, gap: 4, paddingVertical: space(5) },
  teamOn: { borderColor: colors.led, borderWidth: 2 },
  teamLabel: { fontFamily: fonts.kufi, fontSize: 11, lineHeight: 20, color: colors.muted },
  win: { fontFamily: fonts.kufi, fontSize: 13, lineHeight: 24, color: colors.led, marginTop: 4 },
  setLabel: { fontFamily: fonts.kufi, fontSize: 12, lineHeight: 22, color: colors.inkMuted },
  box: { width: 44, height: 44, borderRadius: radius.sm, backgroundColor: colors.ledOff, color: colors.led, fontFamily: fonts.extra, fontSize: 20, textAlign: 'center' },
});
