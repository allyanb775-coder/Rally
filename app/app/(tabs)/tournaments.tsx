import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { Bar, Button, Card, Icon, Row, Screen, T } from '@/components/ui';
import { colors, fonts, radius, space } from '@/constants/theme';
import { fmtLevel, fmtNum, fmtTime } from '@/lib/format';
import { useStore } from '@/lib/store';

export default function Tournaments() {
  const { tournaments, joinedTournaments, joinTournament, me } = useStore();
  return (
    <Screen tabBar>
      <View>
        <T variant="h1">البطولات</T>
        <T variant="muted">بطولات دور ١٦ وليالي أمريكانو في القصيم</T>
      </View>

      {tournaments.length === 0 && (
        <Card style={{ alignItems: 'center', paddingVertical: space(8) }}>
          <Icon name="trophy" size={32} color={colors.muted} />
          <T variant="h3">ما فيه بطولات قادمة حالياً</T>
          <T variant="muted">أول ما تنزل بطولة بتلقاها هنا.</T>
        </Card>
      )}

      {tournaments.map((t) => {
        const joined = joinedTournaments.includes(t.id);
        const full = t.registered >= t.capacity;
        const eligible = me.level >= t.minLevel && me.level <= t.maxLevel;
        const d = new Date(t.startsAt);
        const americano = t.format === 'americano';
        return (
          <View key={t.id} style={s.card}>
            <LinearGradient
              colors={americano ? ['#3B1D8F', '#160B38'] : [colors.court, colors.courtDeep]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.head}>
              <View style={[s.ring, { borderColor: americano ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.12)' }]} />
              <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={s.date}>
                  <T style={s.dateNum}>{fmtNum(d.getDate())}</T>
                  <T style={s.dateMon}>{d.toLocaleDateString('ar-SA', { month: 'short' })}</T>
                </View>
                <View style={s.format}>
                  <T style={s.formatText}>{americano ? 'أمريكانو' : 'دور ١٦'}</T>
                </View>
              </Row>
              <T style={s.name}>{t.name}</T>
              <T style={s.meta}>
                {d.toLocaleDateString('ar-SA', { weekday: 'long' })} · {fmtTime(t.startsAt)} · {t.venue}
              </T>
            </LinearGradient>

            <View style={s.body}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Info label="المستوى" value={`${fmtLevel(t.minLevel)}–${fmtLevel(t.maxLevel)}`} />
                <Info label="الرسوم" value={`${fmtNum(t.fee)} ر.س`} />
                <Info label="المقاعد" value={`${fmtNum(t.registered)}/${fmtNum(t.capacity)}`} />
              </Row>
              <Bar value={t.registered / t.capacity} />
              <T variant="small">{full ? 'اكتملت المقاعد' : `باقي ${fmtNum(t.capacity - t.registered)} مقاعد`}</T>
              <Button
                title={joined ? 'مسجّل ✓' : full ? 'مكتملة' : !eligible ? 'خارج مستواك' : 'سجّل الحين'}
                variant={joined ? 'dark' : 'primary'}
                disabled={joined || full || !eligible}
                onPress={() => joinTournament(t.id)}
              />
            </View>
          </View>
        );
      })}

      <Card style={{ padding: space(5) }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <T variant="h3">الترتيب الشهري</T>
          <View style={s.soon}>
            <T style={{ fontFamily: fonts.bold, fontSize: 11, color: colors.muted }}>قريباً</T>
          </View>
        </Row>
        <T variant="muted">يتحدث بعد كل مباراة تنافسية، وأعلى ٣ كل شهر يدخلون البطولة مجاناً.</T>
      </Card>
    </Screen>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ gap: 2 }}>
      <T variant="small">{label}</T>
      <T style={{ fontFamily: fonts.extra, fontSize: 17 }}>{value}</T>
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  head: { padding: space(5), gap: space(2), overflow: 'hidden' },
  ring: { position: 'absolute', width: 260, height: 260, borderRadius: 130, borderWidth: 24, left: -80, bottom: -150 },
  date: { backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center' },
  dateNum: { fontFamily: fonts.black, fontSize: 24, lineHeight: 28, textAlign: 'center' },
  dateMon: { fontFamily: fonts.medium, fontSize: 11, textAlign: 'center' },
  format: { backgroundColor: colors.accent, borderRadius: radius.pill, paddingHorizontal: 12, height: 28, justifyContent: 'center' },
  formatText: { fontFamily: fonts.bold, fontSize: 12, color: colors.accentInk },
  name: { fontFamily: fonts.black, fontSize: 26, lineHeight: 32, marginTop: space(2) },
  meta: { fontFamily: fonts.medium, fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  body: { padding: space(5), gap: space(3) },
  soon: { backgroundColor: colors.surface2, borderRadius: radius.pill, paddingHorizontal: 10, height: 24, justifyContent: 'center' },
});
