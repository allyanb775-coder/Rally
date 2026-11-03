import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { useState } from 'react';
import { Pressable } from 'react-native';
import { Button, Card, Input, Pill, Row, Screen, T } from '@/components/ui';
import { colors } from '@/constants/theme';
import { QASSIM_CITIES } from '@/lib/cities';

export function ProfileSetup({ client: sb, session, onDone }: { client: SupabaseClient; session: Session; onDone: () => void }) {
  const [name, setName] = useState('');
  const [city, setCity] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const save = async () => {
    if (!city) return;
    setBusy(true);
    const { error } = await sb.from('profiles').insert({ id: session.user.id, name: name.trim(), city });
    setBusy(false);
    if (error) return setMsg('ما قدرنا نحفظ بياناتك. حاول مرة ثانية.');
    onDone();
  };

  return (
    <Screen>
      <T variant="h1" style={{ marginTop: 40 }}>هلا فيك 👋</T>
      <Card style={{ gap: 12 }}>
        <T variant="h2">وش اسمك؟</T>
        <T variant="muted">يظهر للاعبين في المباريات وعلى بطاقتك.</T>
        <Input value={name} onChangeText={setName} placeholder="الاسم" maxLength={30} autoComplete="name" />
        <T variant="h2">وين تلعب غالباً؟</T>
        <Row style={{ flexWrap: 'wrap' }}>
          {QASSIM_CITIES.map((c) => (
            <Pressable key={c} onPress={() => setCity(c)}>
              <Pill label={c} active={city === c} />
            </Pressable>
          ))}
        </Row>
        <Button title={busy ? '...' : 'يلا نبدأ'} disabled={busy || name.trim().length < 2 || !city} onPress={save} />
        {msg && <T style={{ color: colors.danger }}>{msg}</T>}
      </Card>
    </Screen>
  );
}
