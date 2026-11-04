import { router, Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Board, Button, Chip, Icon, Row, scaleStart, Screen, T } from '@/components/ui';
import { colors, fonts, radius, space } from '@/constants/theme';
import { fmtDay, fmtLevel, fmtRange, fmtTime } from '@/lib/format';
import { clampLevel, MAX_LEVEL } from '@/lib/level';
import { useStore } from '@/lib/store';
import { MatchKind } from '@/lib/types';

/** Next start times on the hour, starting two hours from now, 4pm–1am only (when courts are busy). */
function nextSlots(now = new Date()) {
  const out: Date[] = [];
  const t = new Date(now);
  t.setMinutes(0, 0, 0);
  t.setHours(t.getHours() + 2);
  while (out.length < 14) {
    if (t.getHours() >= 16 || t.getHours() <= 1) out.push(new Date(t));
    t.setHours(t.getHours() + 1);
  }
  return out;
}

export default function CreateMatch() {
  const { me, courts, createMatch } = useStore();
  const slots = useMemo(() => nextSlots(), []);
  const [courtId, setCourtId] = useState(courts.find((c) => c.city === me.city)?.id ?? courts[0]?.id);
  const [slot, setSlot] = useState(slots[0]);
  const [kind, setKind] = useState<MatchKind>('friendly');
  const [spread, setSpread] = useState(1);
  const [busy, setBusy] = useState(false);

  const minLevel = clampLevel(me.level - spread);
  const maxLevel = clampLevel(me.level + spread);
  const sorted = [...courts].sort((a, b) => Number(b.city === me.city) - Number(a.city === me.city));

  const submit = async () => {
    if (!courtId) return;
    setBusy(true);
    const id = await createMatch({ courtId, startsAt: slot.toISOString(), kind, minLevel, maxLevel });
    setBusy(false);
    if (id) router.replace({ pathname: '/match/[id]', params: { id } });
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen>
        <Row style={{ justifyContent: 'space-between' }}>
          <T variant="h1">افتح مباراة</T>
          <Pressable onPress={() => router.back()} style={s.close} accessibilityLabel="إغلاق">
            <Icon name="close" size={20} />
          </Pressable>
        </Row>

        <T variant="label">الملعب</T>
        {courts.length === 0 && <T variant="muted">ما فيه ملاعب مضافة بعد.</T>}
        <View style={s.grid}>
          {sorted.map((c) => {
            const active = c.id === courtId;
            return (
              <Pressable key={c.id} onPress={() => setCourtId(c.id)} style={[s.court, active && s.courtActive]}>
                <View style={[s.courtMini, active && { backgroundColor: colors.turf }]}>
                  <View style={s.courtNet} />
                </View>
                <T variant="h3" numberOfLines={1} style={active ? { color: colors.text } : undefined}>{c.name}</T>
                <Row style={{ gap: 4 }}>
                  <Icon name="pin" size={11} color={colors.muted} />
                  <T variant="small">{c.city}</T>
                </Row>
              </Pressable>
            );
          })}
        </View>

        <T variant="label">الوقت</T>
        <Row style={{ flexWrap: 'wrap' }}>
          {slots.map((d) => (
            <Chip key={d.toISOString()} label={`${fmtDay(d.toISOString())} ${fmtTime(d.toISOString())}`} active={d === slot} onPress={() => setSlot(d)} />
          ))}
        </Row>

        <T variant="label">نوع المباراة</T>
        <View style={s.segment}>
          {(['friendly', 'competitive'] as MatchKind[]).map((k) => (
            <Pressable key={k} onPress={() => setKind(k)} style={[s.segItem, kind === k && s.segActive]}>
              <T style={[s.segText, kind === k && { color: colors.accentInk }]}>{k === 'friendly' ? 'ودية' : 'تنافسية'}</T>
              <T style={[s.segSub, kind === k && { color: colors.accentInk }]}>{k === 'friendly' ? 'للمتعة' : 'تعدّل المستوى'}</T>
            </Pressable>
          ))}
        </View>

        <T variant="label">مين يقدر ينضم؟</T>
        <Board style={{ gap: 10 }}>
        <View style={s.range}>
          <View style={[s.rangeFill, { [scaleStart]: `${(minLevel / MAX_LEVEL) * 100}%`, width: `${((maxLevel - minLevel) / MAX_LEVEL) * 100}%` }]} />
          <View style={[s.rangeMe, { [scaleStart]: `${(me.level / MAX_LEVEL) * 100}%`, marginHorizontal: -2 }]} />
        </View>
        <Row style={{ justifyContent: 'space-between' }}>
          <T style={{ fontFamily: fonts.extra, fontSize: 18, lineHeight: 32 }}>
            {fmtRange(minLevel, maxLevel)}
          </T>
          <Row style={{ gap: 6 }}>
            {[0.5, 1, 1.5].map((n) => (
              <Chip key={n} label={`± ${fmtLevel(n)}`} active={spread === n} onPress={() => setSpread(n)} />
            ))}
          </Row>
        </Row>
        </Board>

        <View style={{ marginTop: space(2) }}>
          <Button title={busy ? '...' : 'افتح المباراة'} icon="bolt" disabled={busy || !courtId} onPress={submit} />
        </View>
      </Screen>
    </View>
  );
}

const s = StyleSheet.create({
  close: { width: 44, height: 44, borderRadius: radius.sm, borderWidth: 2, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space(3) },
  court: { width: '47%', flexGrow: 1, borderRadius: radius.sm, borderWidth: 1, borderColor: 'rgba(255,255,255,0.45)', padding: space(3), gap: 4, backgroundColor: 'rgba(190,225,255,0.12)' },
  courtActive: { borderColor: colors.led, backgroundColor: colors.turfDark },
  courtMini: { height: 40, borderRadius: 2, backgroundColor: colors.ink, borderWidth: 2, borderColor: colors.line, marginBottom: 6 },
  courtNet: { position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, backgroundColor: 'rgba(255,255,255,0.6)' },
  segment: { flexDirection: 'row', backgroundColor: colors.ink, borderRadius: radius.sm, padding: 4, gap: 4 },
  segItem: { flex: 1, borderRadius: 2, paddingVertical: space(3), alignItems: 'center' },
  segActive: { backgroundColor: colors.accent },
  segText: { fontFamily: fonts.kufi, fontSize: 15, lineHeight: 26, textAlign: 'center' },
  segSub: { fontFamily: fonts.medium, fontSize: 11, color: colors.muted, textAlign: 'center' },
  range: { height: 12, backgroundColor: colors.ledOff },
  rangeFill: { position: 'absolute', top: 0, bottom: 0, backgroundColor: colors.led },
  rangeMe: { position: 'absolute', top: -4, width: 4, height: 20, borderRadius: 2, backgroundColor: colors.text },
});
