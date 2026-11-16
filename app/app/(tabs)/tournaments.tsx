import { router } from 'expo-router';
import { Linking, StyleSheet, View } from 'react-native';
import { Led, ledNum, ledTime } from '@/components/Led';
import { LinearGradient } from 'expo-linear-gradient';
import { Glass } from '@/components/Glass';
import { ARENA_HERO, Photo } from '@/components/Photo';
import { Bar, Board, Button, Lined, Row, Screen, T } from '@/components/ui';
import { colors, fonts, space } from '@/constants/theme';
import { fmtNum, fmtRange, ltr } from '@/lib/format';
import { useStore } from '@/lib/store';
import { tournamentMessage, waLink } from '@/lib/whatsapp';
import { locale, tr } from '@/lib/i18n';

export default function Tournaments() {
  const { tournaments, myEntries, me } = useStore();
  return (
    <Screen tabBar>
      <View style={s.bleed}>
        <Photo source={ARENA_HERO.source} aspect={ARENA_HERO.aspect} style={{ borderRadius: 0 }}>
          <LinearGradient colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.55)', '#000']} locations={[0, 0.35, 0.75, 1]} style={StyleSheet.absoluteFill} />
          <View style={s.heroText}>
            <T style={s.kicker}>RALLY · {new Date().getFullYear()}</T>
            <T style={s.heroTitle}>EVENTS</T>
            <T style={s.heroSub}>{tr('بطولات دور 16 وليالي أمريكانو', 'Round-of-16 tournaments and Americano nights')}</T>
          </View>
        </Photo>
      </View>

      {tournaments.length === 0 && (
        <Lined style={{ alignItems: 'center', paddingVertical: space(8) }}>
          <T variant="h3">{tr('ما فيه بطولات قادمة حالياً', 'No upcoming tournaments')}</T>
          <T variant="muted">{tr('أول ما تنزل بطولة بتلقاها هنا.', 'New tournaments will show up here.')}</T>
        </Lined>
      )}

      {tournaments.map((t) => {
        const entry = myEntries[t.id];
        const full = t.registered >= t.capacity;
        const eligible = me.level >= t.minLevel && me.level <= t.maxLevel;
        const d = new Date(t.startsAt);
        return (
          <View key={t.id} style={s.card}>
            <Board style={s.board}>
              <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ gap: 6 }}>
                  <T style={s.lbl}>{d.toLocaleDateString(locale(), { weekday: 'long', month: 'long' })}</T>
                  <Row style={{ gap: 14, alignItems: 'flex-end' }}>
                    <Led value={ledNum(d.getDate())} dot={6} />
                    <Led value={ledTime(t.startsAt)} dot={3} color={colors.text} off={false} />
                  </Row>
                </View>
                <T style={s.format}>{t.format === 'americano' ? tr('أمريكانو', 'Americano') : tr('دور 16', 'Round of 16')}</T>
              </Row>
              <T style={s.name}>{t.name}</T>
              <T style={s.venue}>{t.venue}</T>
            </Board>

            <Glass bolts={false} style={s.body}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Info label={tr('المستوى', 'Level')} value={fmtRange(t.minLevel, t.maxLevel)} />
                <Info label={tr('الرسوم', 'Fee')} value={tr(`${fmtNum(t.fee)} ر.س`, `SAR ${fmtNum(t.fee)}`)} />
                <Info label={tr('المقاعد', 'Spots')} value={ltr(`${fmtNum(t.registered)}/${fmtNum(t.capacity)}`)} />
              </Row>
              <Bar value={t.registered / t.capacity} />
              <T variant="small">{full ? tr('اكتملت المقاعد', 'Fully booked') : tr(`باقي ${fmtNum(t.capacity - t.registered)} مقاعد`, `${fmtNum(t.capacity - t.registered)} spots left`)}</T>
              <Button
                title={entry ? (entry.status === 'confirmed' ? tr('مسجّل ✓', 'Registered ✓') : tr('بانتظار تأكيد الدفع', 'Awaiting payment confirmation')) : full ? tr('مكتملة', 'Full') : !eligible ? tr('خارج مستواك', 'Outside your level') : tr('سجّل وادفع', 'Register & pay')}
                variant={entry ? 'dark' : 'primary'}
                disabled={(!entry && (full || !eligible))}
                onPress={() => router.push({ pathname: '/pay/[id]', params: { id: t.id } })}
              />
              {!!waLink(t.whatsapp, '') && (
                <Button
                  title={tr('تواصل مع المنظّم', 'Contact organizer')}
                  icon="chat"
                  variant="ghost"
                  onPress={() => Linking.openURL(waLink(t.whatsapp, tournamentMessage(t, me))!).catch(() => {})}
                />
              )}
            </Glass>
          </View>
        );
      })}

      <Lined>
        <Row style={{ justifyContent: 'space-between' }}>
          <T variant="h3">{tr('الترتيب الشهري', 'Monthly ranking')}</T>
          <T style={s.soon}>{tr('قريباً', 'Soon')}</T>
        </Row>
        <T variant="muted">{tr('يتحدث بعد كل مباراة تنافسية، وأعلى 3 كل شهر يدخلون البطولة مجاناً.', 'Updates after every competitive match. The top 3 each month enter the tournament for free.')}</T>
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
