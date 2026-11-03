import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { PlayerRow } from '@/components/MatchCard';
import { Button, Card, Pill, Row, Screen, T } from '@/components/ui';
import { fmtLevel, fmtNum, fmtWhen } from '@/lib/format';
import { useStore } from '@/lib/store';
import { MATCH_SIZE } from '@/lib/types';

export default function MatchDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { matches, me, joinMatch, leaveMatch } = useStore();
  const [busy, setBusy] = useState(false);
  const m = matches.find((x) => x.id === id);
  if (!m) return <Screen><T>المباراة غير موجودة.</T></Screen>;

  const joined = m.playerIds.includes(me.id);
  const full = m.playerIds.length >= MATCH_SIZE;
  const eligible = me.level >= m.minLevel && me.level <= m.maxLevel;
  const isHost = m.hostId === me.id;

  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between' }}>
        <T variant="h1">{m.court}</T>
        <Pill label={m.kind === 'competitive' ? 'تنافسية' : 'ودية'} active={m.kind === 'competitive'} />
      </Row>
      <T variant="muted">{fmtWhen(m.startsAt)}</T>
      <T variant="muted">المستوى المطلوب {fmtLevel(m.minLevel)} – {fmtLevel(m.maxLevel)}</T>
      {m.kind === 'competitive' && <T variant="muted">نتيجة هذي المباراة تعدّل مستوى اللاعبين.</T>}

      <Card>
        <T variant="h2">اللاعبين ({fmtNum(m.playerIds.length)}/{fmtNum(MATCH_SIZE)})</T>
        {m.playerIds.map((p) => (
          <PlayerRow key={p} id={p} />
        ))}
      </Card>

      {joined ? (
        !isHost && <Button title="انسحب" variant="ghost" disabled={busy} onPress={async () => { setBusy(true); await leaveMatch(m.id); setBusy(false); }} />
      ) : (
        <Button
          title={full ? 'مكتملة' : !eligible ? 'خارج مستواك' : 'انضم'}
          disabled={busy || full || !eligible}
          onPress={async () => { setBusy(true); await joinMatch(m.id); setBusy(false); }}
        />
      )}
    </Screen>
  );
}
