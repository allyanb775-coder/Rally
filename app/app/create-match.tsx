import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable } from 'react-native';
import { Button, Pill, Row, Screen, T } from '@/components/ui';
import { fmtLevel } from '@/lib/format';
import { clampLevel } from '@/lib/level';
import { useStore } from '@/lib/store';
import { MatchKind } from '@/lib/types';

const slots = [
  { label: 'بعد ساعتين', hours: 2 },
  { label: 'الليلة', hours: 6 },
  { label: 'بكرة', hours: 24 },
];

export default function CreateMatch() {
  const { me, courts, createMatch } = useStore();
  const [court, setCourt] = useState(courts[0]);
  const [busy, setBusy] = useState(false);
  const [slot, setSlot] = useState(slots[1]);
  const [kind, setKind] = useState<MatchKind>('friendly');
  const [spread, setSpread] = useState(1);

  const minLevel = clampLevel(me.level - spread);
  const maxLevel = clampLevel(me.level + spread);

  const submit = async () => {
    if (!court) return;
    setBusy(true);
    const id = await createMatch({ courtId: court.id, startsAt: new Date(Date.now() + slot.hours * 36e5).toISOString(), kind, minLevel, maxLevel });
    setBusy(false);
    if (id) router.replace({ pathname: '/match/[id]', params: { id } });
  };

  if (!court) {
    return (
      <Screen>
        <T variant="h2">ما فيه ملاعب مضافة بعد.</T>
      </Screen>
    );
  }

  const choice = <V,>(items: V[], value: V, set: (v: V) => void, label: (v: V) => string) => (
    <Row style={{ flexWrap: 'wrap' }}>
      {items.map((v) => (
        <Pressable key={label(v)} onPress={() => set(v)}>
          <Pill label={label(v)} active={v === value} />
        </Pressable>
      ))}
    </Row>
  );

  return (
    <Screen>
      <T variant="h2">الملعب</T>
      {choice(courts, court, setCourt, (c) => c.name)}
      <T variant="h2">الوقت</T>
      {choice(slots, slot, setSlot, (s) => s.label)}
      <T variant="h2">النوع</T>
      {choice<MatchKind>(['friendly', 'competitive'], kind, setKind, (k) => (k === 'friendly' ? 'ودية' : 'تنافسية'))}
      <T variant="h2">مدى المستوى</T>
      {choice([0.5, 1, 1.5], spread, setSpread, (n) => `± ${fmtLevel(n)}`)}
      <T variant="muted">
        يقدر ينضم من مستوى {fmtLevel(minLevel)} إلى {fmtLevel(maxLevel)}
      </T>
      <Button title={busy ? '...' : 'افتح المباراة'} disabled={busy} onPress={submit} />
    </Screen>
  );
}
