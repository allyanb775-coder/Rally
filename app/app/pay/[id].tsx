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

/** Pay a tournament fee by bank transfer: copy the organizer's IBAN, transfer, upload the receipt. */
export default function Pay() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tournaments, myEntries, me, joinTournament } = useStore();
  const t = tournaments.find((x) => x.id === id);
  const [copied, setCopied] = useState(false);
  const [receipt, setReceipt] = useState<{ uri: string; mime?: string } | null>(null);
  const [busy, setBusy] = useState(false);

  if (!t) {
    return (
      <Screen>
        <Stack.Screen options={{ headerShown: false }} />
        <T variant="h2">البطولة غير موجودة.</T>
      </Screen>
    );
  }
  const entry = myEntries[t.id];
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
    const ok = await joinTournament(t.id, receipt);
    setBusy(false);
    if (ok) router.back();
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen>
        <Row style={{ justifyContent: 'space-between' }}>
          <Heading en="Payment" ar={t.name} size="xl" />
          <Pressable onPress={() => router.back()} style={s.close} accessibilityLabel="إغلاق">
            <Icon name="close" size={20} />
          </Pressable>
        </Row>

        <Lined style={{ alignItems: 'center', paddingVertical: space(5) }}>
          <T variant="small">رسوم التسجيل</T>
          <T style={s.fee}>{`⁦${t.fee} SAR⁩`}</T>
        </Lined>

        {entry ? (
          <Lined style={{ gap: space(2) }}>
            <T variant="h3">{entry.status === 'confirmed' ? 'تم تأكيد دفعك ✓' : 'وصل إيصالك'}</T>
            <T variant="muted">
              {entry.status === 'confirmed' ? 'مكانك في البطولة ثابت.' : 'بانتظار المنظّم يأكد التحويل، وبعدها يثبت مكانك في البطولة.'}
            </T>
          </Lined>
        ) : (
          <>
            <T variant="label">١. حوّل الرسوم على هذا الآيبان</T>
            {hasIban ? (
              <Lined style={{ gap: space(2) }}>
                {!!t.ibanName && (
                  <>
                    <T variant="small">اسم صاحب الحساب</T>
                    <T variant="h3">{t.ibanName}</T>
                  </>
                )}
                <T variant="small" style={{ marginTop: space(1) }}>
                  الآيبان
                </T>
                <T selectable style={s.iban}>
                  {formatIban(t.iban!)}
                </T>
                <Button title={copied ? 'تم النسخ ✓' : 'انسخ الآيبان'} icon={copied ? 'check' : undefined} variant="ghost" onPress={copy} />
              </Lined>
            ) : (
              <Lined>
                <T variant="muted">المنظّم ما أضاف آيبان للحين. تواصل معه عشان تعرف طريقة الدفع.</T>
              </Lined>
            )}

            <T variant="label">٢. ارفع إيصال التحويل</T>
            <Pressable onPress={pick} accessibilityRole="button" accessibilityLabel="ارفع الإيصال">
              <View style={[s.drop, receipt && { borderStyle: 'solid', borderColor: colors.blue }]}>
                {receipt ? (
                  <Image source={{ uri: receipt.uri }} style={s.preview} resizeMode="contain" />
                ) : (
                  <View style={{ alignItems: 'center', gap: 6 }}>
                    <Icon name="plus" size={28} color={colors.muted} />
                    <T variant="muted">صورة أو لقطة شاشة من تطبيق البنك</T>
                  </View>
                )}
              </View>
            </Pressable>
            {receipt && <T variant="small" style={{ textAlign: 'center' }}>اضغط على الصورة عشان تغيّرها</T>}
            <T variant="small">الإيصال يشوفه المنظّم بس.</T>

            <Button title={busy ? 'جاري الإرسال...' : 'أرسل الإيصال وسجّل'} icon="check" disabled={!receipt || busy} onPress={send} />
          </>
        )}

        {contact && (
          <Button title="تواصل مع المنظّم" icon="chat" variant="ghost" onPress={() => Linking.openURL(contact).catch(() => {})} />
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
