import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { useState } from 'react';
import { Button, Chip, Input, Row, T } from '@/components/ui';
import { colors } from '@/constants/theme';
import { CITIES, cityLabel } from '@/lib/cities';
import { SignInShell } from './SignIn';
import { tr } from '@/lib/i18n';

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
    if (error) return setMsg(tr('ما قدرنا نحفظ بياناتك. حاول مرة ثانية.', "We couldn't save your details. Please try again."));
    onDone();
  };

  return (
    <SignInShell title={tr('هلا فيك\nفي الملعب', 'Welcome\nto the court')}>
      <T variant="label">{tr('اسمك (يظهر للاعبين وعلى بطاقتك)', 'Your name (shown to players and on your card)')}</T>
      <Input value={name} onChangeText={setName} placeholder={tr('الاسم', 'Name')} maxLength={30} autoComplete="name" />
      <T variant="label">{tr('وش مدينتك؟', 'Your city')}</T>
      <Row style={{ flexWrap: 'wrap' }}>
        {CITIES.map((c) => (
          <Chip key={c} label={cityLabel(c)} active={city === c} onPress={() => setCity(c)} />
        ))}
      </Row>
      <Button title={busy ? '...' : tr('يلا نبدأ', "Let's go")} disabled={busy || name.trim().length < 2 || !city} onPress={save} />
      {msg && <T style={{ color: colors.danger }}>{msg}</T>}
    </SignInShell>
  );
}
