import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Court } from '@/components/Court';
import { PlayerRow } from '@/components/MatchCard';
import { Button, Card, Icon, Row, Screen, T } from '@/components/ui';
import { colors, fonts, radius, space } from '@/constants/theme';
import { fmtDay, fmtLevel, fmtNum, fmtTime } from '@/lib/format';
import { useStore } from '@/lib/store';
import { MATCH_SIZE } from '@/lib/types';

export default function MatchDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { matches, me, joinMatch, leaveMatch } = useStore();
  const [busy, setBusy] = useState(false);
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
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen>
        <Row style={{ justifyContent: 'space-between' }}>
          <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} style={s.back} accessibilityLabel="رجوع">
            <Icon name="arrow" size={20} />
          </Pressable>
          <View style={[s.kind, m.kind === 'competitive' && { backgroundColor: colors.accent }]}>
            <T style={{ fontFamily: fonts.bold, fontSize: 12, color: m.kind === 'competitive' ? colors.accentInk : colors.text }}>
              {m.kind === 'competitive' ? 'تنافسية · تعدّل المستوى' : 'ودية'}
            </T>
          </View>
        </Row>

        <View>
          <T variant="label">{fmtDay(m.startsAt)}</T>
          <T variant="display">{fmtTime(m.startsAt)}</T>
          <Row style={{ gap: 6 }}>
            <Icon name="pin" size={14} color={colors.muted} />
            <T variant="muted">
              {m.court} · {m.city}
            </T>
          </Row>
        </View>

        <Court playerIds={m.playerIds} size="lg" />

        <Row style={{ gap: space(3) }}>
          <Stat label="المستوى" value={`${fmtLevel(m.minLevel)}–${fmtLevel(m.maxLevel)}`} />
          <Stat label="اللاعبين" value={`${fmtNum(m.playerIds.length)}/${fmtNum(MATCH_SIZE)}`} />
          <Stat label="ناقص" value={fmtNum(missing)} accent={missing > 0} />
        </Row>

        <Card>
          <T variant="h3">اللاعبين</T>
          {m.playerIds.map((p) => (
            <PlayerRow key={p} id={p} host={p === m.hostId} />
          ))}
        </Card>
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
              onPress={() => act(() => joinMatch(m.id))}
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={s.stat}>
      <T variant="small" style={{ textAlign: 'center' }}>{label}</T>
      <T style={[s.statV, accent && { color: colors.accent }]}>{value}</T>
    </View>
  );
}

const s = StyleSheet.create({
  back: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', transform: [{ scaleX: -1 }] },
  kind: { borderRadius: radius.pill, paddingHorizontal: 14, height: 32, justifyContent: 'center', backgroundColor: colors.surface2 },
  stat: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingVertical: space(3), gap: 2 },
  statV: { fontFamily: fonts.extra, fontSize: 20, textAlign: 'center' },
  cta: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(7,9,15,0.94)', borderTopWidth: 1, borderTopColor: colors.border },
  ctaInner: { paddingHorizontal: space(5), paddingVertical: space(3), width: '100%', maxWidth: 560, alignSelf: 'center' },
});
