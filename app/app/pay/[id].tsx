import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, Linking, Pressable, StyleSheet, View } from 'react-native';
import { Button, Heading, Icon, Lined, Row, Screen, T } from '@/components/ui';
import { colors, fonts, radius, space } from '@/constants/theme';
import { formatIban, isSaudiIban, normalizeIban } from '@/lib/iban';
import { useStore } from '@/lib/store';
import { tournamentMessage, waLink } from '@/lib/whatsapp';
import { tr } from '@/lib/i18n';
import { fmtDay, fmtTime } from '@/lib/format';
import type { Receipt } from '@/lib/types';

/** Pay a tournament fee by bank transfer: copy the organizer's IBAN, transfer, upload the receipt. */
export default function Pay() {
  const { id, type } = useLocalSearchParams<{ id: string; type?: 'match' | 'tournament' }>();
  const { tournaments, matches, communities, myEntries, me, joinTournament, joinMatch } = useStore();
  const [copied, setCopied] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [busy, setBusy] = useState(false);

  // Paid club matches and tournaments share this screen.
  const match = type === 'match' ? matches.find((x) => x.id === id) : undefined;
  const club = match?.communityId ? communities.find((c) => c.id === match.communityId) : undefined;
  const t = match
    ? { id: match.id, name: `${match.court} · ${fmtDay(match.startsAt)} ${fmtTime(match.startsAt)}`, fee: match.fee ?? 0, iban: match.iban, ibanName: match.ibanName, whatsapp: club?.whatsapp }
    : tournaments.find((x) => x.id === id);

  if (!t) {
    return (
      <Screen>
        <Stack.Screen options={{ headerShown: false }} />
        <T variant="h2">{match === undefined && type === 'match' ? tr('المباراة غير موجودة.', 'Match not found.') : tr('البطولة غير موجودة.', 'Tournament not found.')}</T>
      </Screen>
    );
  }
  const entry = match ? match.payments?.[me.id] : myEntries[t.id];
  const hasIban = !!t.iban && isSaudiIban(t.iban);
  const contact = waLink(t.whatsapp, tournamentMessage(t, me));

  const copy = async () => {
    try {
      await Clipboard.setStringAsync(normalizeIban(t.iban!));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };
  const pick = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!res.canceled && res.assets?.[0]) setReceipt({ uri: res.assets[0].uri, mime: res.assets[0].mimeType ?? undefined });
  };
  const send = async () => {
    if (!receipt) return;
    setBusy(true);
    const ok = match ? await joinMatch(t.id, receipt) : await joinTournament(t.id, receipt);
    setBusy(false);
    if (ok) router.back();
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen>
        <Row style={{ justifyContent: 'space-between' }}>
          <Heading en="Payment" ar={t.name} size="xl" />
          <Pressable onPress={() => router.back()} style={s.close} accessibilityLabel={tr('إغلاق', 'Close')}>
            <Icon name="close" size={20} />
          </Pressable>
        </Row>

        <Lined style={{ alignItems: 'center', paddingVertical: space(5) }}>
          <T variant="small">{tr('رسوم التسجيل', 'Entry fee')}</T>
          <T style={s.fee}>{`⁦${t.fee} SAR⁩`}</T>
        </Lined>

        {entry ? (
          <Lined style={{ gap: space(2) }}>
            <T variant="h3">{entry.status === 'confirmed' ? tr('تم تأكيد دفعك ✓', 'Payment confirmed ✓') : tr('وصل إيصالك', 'Receipt received')}</T>
            <T variant="muted">
              {entry.status === 'confirmed' ? tr('مكانك ثابت.', 'Your spot is confirmed.') : tr('مكانك محجوز لك، وبانتظار المنظّم يأكد التحويل.', 'Your spot is held while the organizer confirms the transfer.')}
            </T>
          </Lined>
        ) : (
          <>
            <T variant="label">{tr('١. حوّل الرسوم على هذا الآيبان', '1. Transfer the fee to this IBAN')}</T>
            {hasIban ? (
              <Lined style={{ gap: space(2) }}>
                {!!t.ibanName && (
                  <>
                    <T variant="small">{tr('اسم صاحب الحساب', 'Account holder')}</T>
                    <T variant="h3">{t.ibanName}</T>
                  </>
                )}
                <T variant="small" style={{ marginTop: space(1) }}>
                  {tr('الآيبان', 'IBAN')}
                </T>
                <T selectable style={s.iban}>
                  {formatIban(t.iban!)}
                </T>
                <Button title={copied ? tr('تم النسخ ✓', 'Copied ✓') : tr('انسخ الآيبان', 'Copy IBAN')} icon={copied ? 'check' : undefined} variant="ghost" onPress={copy} />
              </Lined>
            ) : (
              <Lined>
                <T variant="muted">{tr('المنظّم ما أضاف آيبان للحين. تواصل معه عشان تعرف طريقة الدفع.', "The organizer hasn't added an IBAN yet. Contact them to ask how to pay.")}</T>
              </Lined>
            )}

            <T variant="label">{tr('٢. ارفع إيصال التحويل', '2. Upload the transfer receipt')}</T>
            <Pressable onPress={pick} accessibilityRole="button" accessibilityLabel={tr('ارفع الإيصال', 'Upload receipt')}>
              <View style={[s.drop, receipt && { borderStyle: 'solid', borderColor: colors.blue }]}>
                {receipt ? (
                  <Image source={{ uri: receipt.uri }} style={s.preview} resizeMode="contain" />
                ) : (
                  <View style={{ alignItems: 'center', gap: 6 }}>
                    <Icon name="plus" size={28} color={colors.muted} />
                    <T variant="muted">{tr('صورة أو لقطة شاشة من تطبيق البنك', 'A photo or screenshot from your bank app')}</T>
                  </View>
                )}
              </View>
            </Pressable>
            {receipt && <T variant="small" style={{ textAlign: 'center' }}>{tr('اضغط على الصورة عشان تغيّرها', 'Tap the image to change it')}</T>}
            <T variant="small">{tr('الإيصال يشوفه المنظّم بس.', 'Only the organizer can see your receipt.')}</T>

            <Button title={busy ? tr('جاري الإرسال...', 'Sending...') : tr('أرسل الإيصال وسجّل', 'Send receipt & register')} icon="check" disabled={!receipt || busy} onPress={send} />
          </>
        )}

        {contact && (
          <Button title={tr('تواصل مع المنظّم', 'Contact organizer')} icon="chat" variant="ghost" onPress={() => Linking.openURL(contact).catch(() => {})} />
        )}
      </Screen>
    </View>
  );
}

const s = StyleSheet.create({
  close: { width: 44, height: 44, borderRadius: radius.pill, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  fee: { fontFamily: fonts.display, fontSize: 48, lineHeight: 58, textAlign: 'center' },
  iban: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 26, letterSpacing: 1, writingDirection: 'ltr', textAlign: 'center' },
  drop: { height: 220, borderRadius: radius.md, borderWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  preview: { width: '100%', height: '100%' },
});
