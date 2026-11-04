import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BALL_HIT_MS, BallHit } from '@/components/BallHit';
import { Court } from '@/components/Court';
import { Led, ledNum, ledTime } from '@/components/Led';
import { PlayerRow } from '@/components/MatchCard';
import { Board, Button, Icon, Lined, Row, Screen, T } from '@/components/ui';
import { colors, fonts, radius, space } from '@/constants/theme';
import { fmtDay, fmtLevel } from '@/lib/format';
import { useStore } from '@/lib/store';
import { MATCH_SIZE } from '@/lib/types';

export default function MatchDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { matches, me, joinMatch, leaveMatch } = useStore();
  const [busy, setBusy] = useState(false);
  const [hit, setHit] = useState(0);
  const m = matches.find((x) => x.id === id);
  if (!m) {
    return (
      <Screen>
        <Stack.Screen options={{ headerShown: false }} />
        <T variant="h2">المباراة غير موجودة.</T>
      </Screen>
    );
  }

  const joined = m.playerIds.includes(me.id);
  const full = m.playerIds.length >= MATCH_SIZE;
  const eligible = me.level >= m.minLevel && me.level <= m.maxLevel;
  const isHost = m.hostId === me.id;
  const missing = MATCH_SIZE - m.playerIds.length;
  const act = async (fn: () => Promise<void>) => {
    setBusy(true);
    await fn();
    setBusy(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen>
        <Row style={{ justifyContent: 'space-between' }}>
          <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} style={s.back} accessibilityLabel="رجوع">
            <View style={{ transform: [{ scaleX: -1 }] }}>
              <Icon name="arrow" size={20} />
            </View>
          </Pressable>
          <T style={[s.kind, m.kind === 'competitive' && { color: colors.led, borderColor: colors.led }]}>
            {m.kind === 'competitive' ? 'تنافسية · تعدّل المستوى' : 'ودية'}
          </T>
        </Row>

        <Board style={{ gap: space(3) }}>
          <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <View style={{ gap: 8 }}>
              <T style={s.boardLabel}>{fmtDay(m.startsAt)}</T>
              <Led value={ledTime(m.startsAt)} dot={7} />
            </View>
            <View style={{ alignItems: 'flex-end', gap: 8 }}>
              <T style={s.boardLabel}>ناقص</T>
              <Led value={ledNum(missing, 1)} dot={7} color={missing ? colors.led : colors.inkMuted} />
            </View>
          </Row>
          <T style={{ fontFamily: fonts.bold, color: colors.text }}>
            {m.court} · {m.city}
          </T>
        </Board>

        <View>
          <Court playerIds={m.playerIds} size="lg" />
          <BallHit play={hit} />
        </View>

        <Row style={{ gap: space(3) }}>
          <Stat label="المستوى المطلوب" value={`${fmtLevel(m.minLevel)} – ${fmtLevel(m.maxLevel)}`} />
          <Stat label="مستواك" value={fmtLevel(me.level)} warn={!eligible} />
        </Row>

        <Lined style={{ gap: 0 }}>
          <T variant="h3" style={{ marginBottom: 4 }}>اللاعبين</T>
          {m.playerIds.map((p) => (
            <PlayerRow key={p} id={p} host={p === m.hostId} />
          ))}
        </Lined>
        <View style={{ height: 90 }} />
      </Screen>

      <SafeAreaView edges={['bottom']} style={s.cta}>
        <View style={s.ctaInner}>
          {joined ? (
            isHost ? (
              <Button title="أنت صاحب المباراة" variant="dark" disabled onPress={() => {}} />
            ) : (
              <Button title="انسحب من المباراة" variant="ghost" disabled={busy} onPress={() => act(() => leaveMatch(m.id))} />
            )
          ) : (
            <Button
              title={full ? 'المباراة مكتملة' : !eligible ? 'مستواك خارج المدى' : busy ? '...' : 'انضم للمباراة'}
              icon={!full && eligible ? 'check' : undefined}
              disabled={busy || full || !eligible}
              onPress={() =>
                act(async () => {
                  setHit((n) => n + 1);
                  await new Promise((r) => setTimeout(r, BALL_HIT_MS));
                  await joinMatch(m.id);
                })
              }
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

function Stat({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <Lined style={{ flex: 1, gap: 2, paddingVertical: space(3) }}>
      <T variant="small">{label}</T>
      <T style={{ fontFamily: fonts.extra, fontSize: 18, lineHeight: 32, color: warn ? colors.danger : colors.text }}>{value}</T>
    </Lined>
  );
}

const s = StyleSheet.create({
  back: { width: 44, height: 44, borderRadius: radius.sm, borderWidth: 2, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  kind: { fontFamily: fonts.kufi, fontSize: 12, lineHeight: 28, borderWidth: 1.5, borderColor: colors.text, paddingHorizontal: 12, borderRadius: 2 },
  boardLabel: { fontFamily: fonts.kufi, fontSize: 11, lineHeight: 18, color: colors.inkMuted },
  cta: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.ink, borderTopWidth: 3, borderTopColor: '#0B1430' },
  ctaInner: { paddingHorizontal: space(4), paddingVertical: space(3), width: '100%', maxWidth: 560, alignSelf: 'center' },
});
