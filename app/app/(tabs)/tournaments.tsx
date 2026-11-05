import { StyleSheet, View } from 'react-native';
import { Led, ledNum, ledTime } from '@/components/Led';
import { LinearGradient } from 'expo-linear-gradient';
import { Glass } from '@/components/Glass';
import { ARENA_HERO, Photo } from '@/components/Photo';
import { Bar, Board, Button, Lined, Row, Screen, T } from '@/components/ui';
import { colors, fonts, space } from '@/constants/theme';
import { fmtNum, fmtRange, ltr } from '@/lib/format';
import { useStore } from '@/lib/store';

export default function Tournaments() {
  const { tournaments, joinedTournaments, joinTournament, me } = useStore();
  return (
    <Screen tabBar>
      <View style={s.bleed}>
        <Photo source={ARENA_HERO.source} aspect={ARENA_HERO.aspect} style={{ borderRadius: 0 }}>
          <LinearGradient colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.55)', '#000']} locations={[0, 0.35, 0.75, 1]} style={StyleSheet.absoluteFill} />
          <View style={s.heroText}>
            <T style={s.kicker}>QASSIM · {new Date().getFullYear()}</T>
            <T style={s.heroTitle}>EVENTS</T>
            <T style={s.heroSub}>بطولات دور 16 وليالي أمريكانو في القصيم</T>
          </View>
        </Photo>
      </View>

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
  bleed: { marginHorizontal: -space(4), marginTop: -space(3) },
  heroText: { position: 'absolute', left: space(5), right: space(5), bottom: space(5), alignItems: 'center' },
  kicker: { fontFamily: fonts.display, fontSize: 14, letterSpacing: 3, color: '#FFFFFF', textAlign: 'center', writingDirection: 'ltr' },
  heroTitle: { fontFamily: fonts.display, fontSize: 96, lineHeight: 104, color: '#FFFFFF', textAlign: 'center', writingDirection: 'ltr', letterSpacing: 1, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 16 },
  heroSub: { fontFamily: fonts.medium, fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  card: { borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  board: { borderRadius: 0, borderWidth: 0, gap: space(2) },
  lbl: { fontFamily: fonts.kufi, fontSize: 11, lineHeight: 18, color: colors.inkMuted },
  format: { fontFamily: fonts.kufi, fontSize: 12, lineHeight: 26, color: '#FFFFFF', backgroundColor: colors.blue, paddingHorizontal: 10, borderRadius: 2, overflow: 'hidden' },
  name: { fontFamily: fonts.bold, fontSize: 22, lineHeight: 30, marginTop: space(1) },
  venue: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted },
  body: { padding: space(4), gap: space(3), borderRadius: 0, borderWidth: 0 },
  soon: { fontFamily: fonts.kufi, fontSize: 10, lineHeight: 22, color: colors.led, borderWidth: 1, borderColor: colors.led, paddingHorizontal: 8, borderRadius: 2 },
});
