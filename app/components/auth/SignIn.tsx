import type { SupabaseClient } from '@supabase/supabase-js';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Court } from '@/components/Court';
import { Button, Input, Row, Screen, T } from '@/components/ui';
import { colors, fonts, radius, space } from '@/constants/theme';
import { normalizeSaudiPhone } from '@/lib/phone';

export function SignIn({ client: sb, error, onRetry }: { client: SupabaseClient; error?: string; onRetry?: () => void }) {
  const [raw, setRaw] = useState('');
  const [phone, setPhone] = useState<string | null>(null); // set once the code is sent
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (error) {
    return (
      <Screen>
        <T variant="h2" style={{ marginTop: 60 }}>{error}</T>
        {onRetry && <Button title="حاول مرة ثانية" onPress={onRetry} />}
      </Screen>
    );
  }

  const send = async () => {
    const p = normalizeSaudiPhone(raw);
    if (!p) return setMsg('اكتب رقم جوال سعودي صحيح يبدأ بـ ٥');
    setBusy(true);
    setMsg(null);
    const { error } = await sb.auth.signInWithOtp({ phone: p });
    setBusy(false);
    if (error) return setMsg('ما قدرنا نرسل الرمز. حاول بعد شوي.');
    setPhone(p);
  };

  const verify = async () => {
    if (!phone) return;
    setBusy(true);
    setMsg(null);
    const { error } = await sb.auth.verifyOtp({ phone, token: code.trim(), type: 'sms' });
    setBusy(false);
    if (error) setMsg('الرمز غير صحيح أو انتهى.');
    // On success onAuthStateChange moves the app forward.
  };

  return (
    <SignInShell>
      {!phone ? (
        <>
          <T variant="label">رقم جوالك</T>
          <Row style={{ gap: space(2) }}>
            <View style={{ flex: 1 }}>
              <Input value={raw} onChangeText={setRaw} placeholder="5X XXX XXXX" keyboardType="phone-pad" autoComplete="tel" />
            </View>
            <View style={s.cc}>
              <T style={{ fontFamily: fonts.bold, fontSize: 17 }}>966+</T>
            </View>
          </Row>
          <Button title={busy ? '...' : 'أرسل رمز التحقق'} disabled={busy} onPress={send} />
        </>
      ) : (
        <>
          <T variant="label">الرمز اللي وصلك على {phone}</T>
          <Input value={code} onChangeText={setCode} placeholder="------" keyboardType="number-pad" autoComplete="one-time-code" maxLength={6} style={{ textAlign: 'center', letterSpacing: 12, fontSize: 26 }} />
          <Button title={busy ? '...' : 'تأكيد'} disabled={busy || code.trim().length < 6} onPress={verify} />
          <Button title="غيّر الرقم" variant="dark" onPress={() => { setPhone(null); setCode(''); }} />
        </>
      )}
      {msg && <T style={{ color: colors.danger }}>{msg}</T>}
    </SignInShell>
  );
}

/** Shared hero for sign-in and first-run screens. */
export function SignInShell({ children, title = 'العب.\nنافس.\nتطوّر.' }: { children: React.ReactNode; title?: string }) {
  return (
    <Screen>
      <View style={{ marginTop: space(6), gap: space(5) }}>
        <Row style={{ gap: 8 }}>
          <View style={s.logo} />
          <T style={{ fontFamily: fonts.black, fontSize: 22, letterSpacing: 1 }}>RALLY</T>
        </Row>
        <T style={s.title}>{title}</T>
        <T variant="muted">لاعبين البادل في القصيم بمكان واحد: لاقِ مباراة بمستواك، كمّل الناقصين، وشارك في البطولات.</T>
        <View style={{ transform: [{ rotate: '-4deg' }], marginVertical: space(2) }}>
          <Court playerIds={[]} size="sm" />
        </View>
        <View style={{ gap: space(3) }}>{children}</View>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  logo: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.accent },
  title: { fontFamily: fonts.black, fontSize: 52, lineHeight: 58 },
  cc: { height: 60, paddingHorizontal: space(4), borderRadius: radius.md, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, justifyContent: 'center' },
});
