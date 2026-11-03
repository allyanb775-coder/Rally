import type { SupabaseClient } from '@supabase/supabase-js';
import { useState } from 'react';
import { Button, Card, Input, Screen, T } from '@/components/ui';
import { colors } from '@/constants/theme';
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
        <T variant="h2">{error}</T>
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
    <Screen>
      <T variant="h1" style={{ marginTop: 40 }}>Rally 🎾</T>
      <T variant="muted">لاعبين البادل في عنيزة، بمكان واحد.</T>
      <Card style={{ gap: 12 }}>
        {!phone ? (
          <>
            <T variant="h2">رقم جوالك</T>
            <Input value={raw} onChangeText={setRaw} placeholder="05XXXXXXXX" keyboardType="phone-pad" autoComplete="tel" />
            <Button title={busy ? '...' : 'أرسل الرمز'} disabled={busy} onPress={send} />
          </>
        ) : (
          <>
            <T variant="h2">اكتب الرمز اللي وصلك</T>
            <T variant="muted">أرسلناه إلى {phone}</T>
            <Input value={code} onChangeText={setCode} placeholder="------" keyboardType="number-pad" autoComplete="one-time-code" maxLength={6} />
            <Button title={busy ? '...' : 'تأكيد'} disabled={busy || code.trim().length < 6} onPress={verify} />
            <Button title="غيّر الرقم" variant="ghost" onPress={() => { setPhone(null); setCode(''); }} />
          </>
        )}
        {msg && <T style={{ color: colors.danger }}>{msg}</T>}
      </Card>
    </Screen>
  );
}
