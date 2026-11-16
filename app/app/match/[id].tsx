import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BALL_HIT_MS, BallHit } from '@/components/BallHit';
import { Court } from '@/components/Court';
import { Led, ledNum, ledTime } from '@/components/Led';
import { PlayerRow } from '@/components/MatchCard';
import { ResultPanel } from '@/components/ResultPanel';
import { Board, Button, Icon, Lined, Row, Screen, T } from '@/components/ui';
import { colors, fonts, radius, space } from '@/constants/theme';
import { fmtDay, fmtLevel, fmtNum, fmtRange } from '@/lib/format';
import { levelFits } from '@/lib/level';
import { useStore } from '@/lib/store';
import { MATCH_SIZE } from '@/lib/types';
import { isAr, tr } from '@/lib/i18n';
import { cityLabel } from '@/lib/cities';

export default function MatchDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { matches, me, players, joinMatch, leaveMatch, confirmPayment, receiptUrl } = useStore();
  const [busy, setBusy] = useState(false);
  const [hit, setHit] = useState(0);
  const m = matches.find((x) => x.id === id);
  if (!m) {
    return (
      <Screen>
        <Stack.Screen options={{ headerShown: false }} />
        <T variant="h2">{tr('المباراة غير موجودة.', 'Match not found.')}</T>
      </Screen>
    );
  }

  const joined = m.playerIds.includes(me.id);
  const full = m.playerIds.length >= MATCH_SIZE;
  const eligible = levelFits(me.level, m);
  const isHost = m.hostId === me.id;
  const missing = MATCH_SIZE - m.playerIds.length;
  const paid = !!m.fee && !isHost; // you join by uploading a transfer receipt
  const myPay = m.payments?.[me.id];
  const pending = Object.entries(m.payments ?? {}).filter(([, p]) => p.status === 'pending');
  const payNote = (pid: string) => {
    const p = m.payments?.[pid];
    if (!m.fee || !p) return undefined;
    return p.status === 'confirmed' ? { text: tr('دفع ✓', 'Paid ✓'), color: colors.led } : { text: tr('بانتظار تأكيد الدفع', 'Awaiting payment confirmation'), color: '#F5B700' };
  };
  const openReceipt = async (r?: string) => {
    const url = r ? await receiptUrl(r) : null;
    if (url) Linking.openURL(url).catch(() => {});
  };
  const act = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    await fn();
    setBusy(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen>
        <Row style={{ justifyContent: 'space-between' }}>
          <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} style={s.back} accessibilityLabel={tr('رجوع', 'Back')}>
            <View style={{ transform: [{ scaleX: isAr() ? -1 : 1 }] }}>
              <Icon name="arrow" size={20} />
            </View>
          </Pressable>
          <T style={[s.kind, m.kind === 'competitive' && { color: colors.led, borderColor: colors.led }]}>
            {m.kind === 'competitive' ? tr('تنافسية · تعدّل المستوى', 'Competitive · affects level') : tr('ودية', 'Friendly')}
          </T>
        </Row>

        <Board style={{ gap: space(3) }}>
          <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <View style={{ gap: 8 }}>
              <T style={s.boardLabel}>{fmtDay(m.startsAt)}</T>
              <Led value={ledTime(m.startsAt)} dot={7} />
            </View>
            <View style={{ alignItems: 'flex-end', gap: 8 }}>
              <T style={s.boardLabel}>{tr('ناقص', 'Need')}</T>
              <Led value={ledNum(missing, 1)} dot={7} color={missing ? colors.led : colors.inkMuted} />
            </View>
          </Row>
          <T style={{ fontFamily: fonts.bold, color: colors.text }}>
            {m.court} · {cityLabel(m.city)}
          </T>
        </Board>

        <View>
          <Court playerIds={m.playerIds} size="lg" />
          <BallHit play={hit} />
        </View>

        <Row style={{ gap: space(3) }}>
          <Stat label={tr('المستوى المطلوب', 'Required level')} value={fmtRange(m.minLevel, m.maxLevel)} />
          <Stat label={tr('مستواك', 'Your level')} value={fmtLevel(me.level)} warn={!eligible} />
        </Row>

        {!!m.fee && (
          <Lined style={{ gap: 2 }}>
            <T variant="small">{tr('رسوم المباراة لكل لاعب', 'Match fee per player')}</T>
            <T style={{ fontFamily: fonts.extra, fontSize: 18, lineHeight: 32 }}>{tr(`${fmtNum(m.fee)} ر.س`, `SAR ${fmtNum(m.fee)}`)}</T>
            <T variant="small">
              {isHost
                ? tr('كل لاعب يرفع إيصال التحويل عشان ينضم، وأنت تأكد الدفع من هنا.', 'Each player uploads a transfer receipt to join; you confirm payments here.')
                : tr('تنضم برفع إيصال التحويل، ويثبت مكانك بعد ما يأكد المنظّم.', 'You join by uploading the transfer receipt; your spot is confirmed once the organizer checks it.')}
            </T>
          </Lined>
        )}

        {joined && myPay && (
          <Lined style={{ gap: 2, borderColor: myPay.status === 'confirmed' ? colors.led : '#F5B700' }}>
            <T variant="h3">{myPay.status === 'confirmed' ? tr('تم تأكيد دفعك ✓', 'Payment confirmed ✓') : tr('بانتظار تأكيد الدفع', 'Awaiting payment confirmation')}</T>
            <T variant="small">
              {myPay.status === 'confirmed' ? tr('مكانك ثابت.', 'Your spot is confirmed.') : tr('مكانك محجوز لك، وبانتظار المنظّم يأكد التحويل.', 'Your spot is held while the organizer confirms the transfer.')}
            </T>
          </Lined>
        )}

        {isHost && pending.length > 0 && (
          <Lined style={{ gap: space(2), borderColor: '#F5B700' }}>
            <T variant="h3">{tr('إيصالات تنتظر تأكيدك', 'Receipts waiting for you')}</T>
            {pending.map(([pid, p]) => (
              <View key={pid} style={{ gap: space(2) }}>
                <T style={{ fontFamily: fonts.bold }}>{players[pid]?.name ?? tr('لاعب', 'Player')}</T>
                <Row>
                  {p.receipt && (
                    <View style={{ flex: 1 }}>
                      <Button title={tr('شوف الإيصال', 'View receipt')} variant="ghost" onPress={() => openReceipt(p.receipt)} />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Button title={tr('أكّد الدفع', 'Confirm payment')} icon="check" disabled={busy} onPress={() => act(() => confirmPayment(m.id, pid))} />
                  </View>
                </Row>
              </View>
            ))}
          </Lined>
        )}

        <ResultPanel match={m} />

        <Lined style={{ gap: 0 }}>
          <T variant="h3" style={{ marginBottom: 4 }}>{tr('اللاعبين', 'Players')}</T>
          {m.playerIds.map((p) => (
            <PlayerRow key={p} id={p} host={p === m.hostId} note={payNote(p)} />
          ))}
        </Lined>
        <View style={{ height: 90 }} />
      </Screen>

      <SafeAreaView edges={['bottom']} style={s.cta}>
        <View style={s.ctaInner}>
          {new Date(m.startsAt) <= new Date() ? (
            <Button title={joined ? tr('المباراة انتهت', 'Match finished') : tr('المباراة بدأت', 'Match started')} variant="dark" disabled onPress={() => {}} />
          ) : joined ? (
            isHost ? (
              <Button title={tr('أنت صاحب المباراة', "You're the host")} variant="dark" disabled onPress={() => {}} />
            ) : (
              <Button title={tr('انسحب من المباراة', 'Leave match')} variant="ghost" disabled={busy} onPress={() => act(() => leaveMatch(m.id))} />
            )
          ) : (
            <Button
              title={
                full
                  ? tr('المباراة مكتملة', 'Match is full')
                  : !eligible
                    ? tr('مو بمستواك', 'Not your level')
                    : busy
                      ? '...'
                      : paid
                        ? tr(`سجّل وادفع · ${fmtNum(m.fee!)} ر.س`, `Register & pay · SAR ${fmtNum(m.fee!)}`)
                        : tr('انضم للمباراة', 'Join match')
              }
              icon={!full && eligible ? 'check' : undefined}
              disabled={busy || full || !eligible}
              onPress={() =>
                paid
                  ? router.push({ pathname: '/pay/[id]', params: { id: m.id, type: 'match' } })
                  : act(async () => {
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
