import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { useState } from 'react';
import { Button, Card, Input, Screen, T } from '@/components/ui';
import { colors } from '@/constants/theme';

export function ProfileSetup({ client: sb, session, onDone }: { client: SupabaseClient; session: Session; onDone: () => void }) {
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const save = async () => {
    setBusy(true);
    const { error } = await sb.from('profiles').insert({ id: session.user.id, name: name.trim(), phone: session.user.phone || null });
    setBusy(false);
    if (error) return setMsg('ما قدرنا نحفظ اسمك. حاول مرة ثانية.');
    onDone();
  };

  return (
    <Screen>
      <T variant="h1" style={{ marginTop: 40 }}>هلا فيك 👋</T>
      <Card style={{ gap: 12 }}>
        <T variant="h2">وش اسمك؟</T>
        <T variant="muted">يظهر للاعبين في المباريات وعلى بطاقتك.</T>
        <Input value={name} onChangeText={setName} placeholder="الاسم" maxLength={30} autoComplete="name" />
        <Button title={busy ? '...' : 'يلا نبدأ'} disabled={busy || name.trim().length < 2} onPress={save} />
        {msg && <T style={{ color: colors.danger }}>{msg}</T>}
      </Card>
    </Screen>
  );
}
