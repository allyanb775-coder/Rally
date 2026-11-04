import { StyleSheet, View } from 'react-native';
import { Led, ledNum, ledTime } from '@/components/Led';
import { EventPoster } from '@/components/EventPoster';
import { Glass } from '@/components/Glass';
import { Bar, Board, Button, Lined, Row, Screen, T } from '@/components/ui';
import { colors, fonts, space } from '@/constants/theme';
import { fmtNum, fmtRange, ltr } from '@/lib/format';
import { useStore } from '@/lib/store';

export default function Tournaments() {
  const { tournaments, joinedTournaments, joinTournament, me } = useStore();
  return (
    <Screen tabBar>
      <View>
        <T variant="h1">البطولات</T>
        <T variant="muted">بطولات دور 16 وليالي أمريكانو في القصيم</T>
      </View>

      <EventPoster source={require('@/assets/images/weekend-coaching.jpg')} aspect={1080 / 1350} label="تدريب البادل في نهاية الأسبوع" />

      {tournaments.length === 0 && (
        <Lined style={{ alignItems: 'center', paddingVertical: space(8) }}>
          <T variant="h3">ما فيه بطولات قادمة حالياً</T>
          <T variant="muted">أول ما تنزل بطولة بتلقاها هنا.</T>
        </Lined>
      )}

      {tournaments.map((t) => {
        const joined = joinedTournaments.includes(t.id);
        const full = t.registered >= t.capacity;
        const eligible = me.level >= t.minLevel && me.level <= t.maxLevel;
        const d = new Date(t.startsAt);
        return (
          <View key={t.id} style={s.card}>
            <Board style={s.board}>
              <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ gap: 6 }}>
                  <T style={s.lbl}>{d.toLocaleDateString('ar-SA-u-nu-latn', { weekday: 'long', month: 'long' })}</T>
                  <Row style={{ gap: 14, alignItems: 'flex-end' }}>
                    <Led value={ledNum(d.getDate())} dot={6} />
                    <Led value={ledTime(t.startsAt)} dot={3} color={colors.text} off={false} />
                  </Row>
                </View>
                <T style={s.format}>{t.format === 'americano' ? 'أمريكانو' : 'دور 16'}</T>
              </Row>
              <T style={s.name}>{t.name}</T>
              <T style={s.venue}>{t.venue}</T>
            </Board>

            <Glass bolts={false} style={s.body}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Info label="المستوى" value={fmtRange(t.minLevel, t.maxLevel)} />
                <Info label="الرسوم" value={`${fmtNum(t.fee)} ر.س`} />
                <Info label="المقاعد" value={ltr(`${fmtNum(t.registered)}/${fmtNum(t.capacity)}`)} />
              </Row>
              <Bar value={t.registered / t.capacity} />
              <T variant="small">{full ? 'اكتملت المقاعد' : `باقي ${fmtNum(t.capacity - t.registered)} مقاعد`}</T>
              <Button
                title={joined ? 'مسجّل ✓' : full ? 'مكتملة' : !eligible ? 'خارج مستواك' : 'سجّل الحين'}
                variant={joined ? 'dark' : 'primary'}
                disabled={joined || full || !eligible}
                onPress={() => joinTournament(t.id)}
              />
            </Glass>
          </View>
        );
      })}

      <Lined>
        <Row style={{ justifyContent: 'space-between' }}>
          <T variant="h3">الترتيب الشهري</T>
          <T style={s.soon}>قريباً</T>
        </Row>
        <T variant="muted">يتحدث بعد كل مباراة تنافسية، وأعلى 3 كل شهر يدخلون البطولة مجاناً.</T>
      </Lined>
    </Screen>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ gap: 2 }}>
      <T variant="small">{label}</T>
      <T style={{ fontFamily: fonts.extra, fontSize: 16, lineHeight: 30 }}>{value}</T>
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', borderRadius: 4, overflow: 'hidden' },
  board: { borderRadius: 0, borderWidth: 0, gap: space(2) },
  lbl: { fontFamily: fonts.kufi, fontSize: 11, lineHeight: 18, color: colors.inkMuted },
  format: { fontFamily: fonts.kufi, fontSize: 12, lineHeight: 26, color: colors.ink, backgroundColor: colors.led, paddingHorizontal: 10, borderRadius: 2, overflow: 'hidden' },
  name: { fontFamily: fonts.black, fontSize: 22, lineHeight: 40, marginTop: space(1) },
  venue: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted },
  body: { padding: space(4), gap: space(3), borderRadius: 0, borderWidth: 0 },
  soon: { fontFamily: fonts.kufi, fontSize: 10, lineHeight: 22, color: colors.led, borderWidth: 1, borderColor: colors.led, paddingHorizontal: 8, borderRadius: 2 },
});
