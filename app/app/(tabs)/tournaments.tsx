import { Button, Card, Pill, Row, Screen, T } from '@/components/ui';
import { fmtDate, fmtLevel, fmtNum } from '@/lib/format';
import { useStore } from '@/lib/store';

export default function Tournaments() {
  const { tournaments, joinedTournaments, joinTournament, me } = useStore();
  return (
    <Screen>
      <T variant="h1">البطولات</T>
      {tournaments.length === 0 && <T variant="muted">ما فيه بطولات قادمة حالياً.</T>}
      {tournaments.map((t) => {
        const joined = joinedTournaments.includes(t.id);
        const full = t.registered >= t.capacity;
        const eligible = me.level >= t.minLevel && me.level <= t.maxLevel;
        return (
          <Card key={t.id}>
            <Row style={{ justifyContent: 'space-between' }}>
              <T variant="h2">{t.name}</T>
              <Pill label={t.format === 'knockout16' ? 'دور ١٦' : 'أمريكانو'} active />
            </Row>
            <T variant="muted">
              {fmtDate(t.startsAt)} · {t.venue}
            </T>
            <T variant="muted">
              المستوى {fmtLevel(t.minLevel)} – {fmtLevel(t.maxLevel)} · الرسوم {fmtNum(t.fee)} ر.س
            </T>
            <T>
              المسجلين {fmtNum(t.registered)} / {fmtNum(t.capacity)}
            </T>
            <Button
              title={joined ? 'مسجّل ✓' : full ? 'مكتملة' : !eligible ? 'خارج مستواك' : 'سجّل'}
              disabled={joined || full || !eligible}
              onPress={() => joinTournament(t.id)}
            />
          </Card>
        );
      })}
      <Card>
        <T variant="h2">الترتيب الشهري</T>
        <T variant="muted">يتحدث بعد كل مباراة تنافسية. قريباً.</T>
      </Card>
    </Screen>
  );
}
