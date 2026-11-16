import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Board, Button, Chip, Heading, Icon, Row, scaleStart, Screen, T } from '@/components/ui';
import { colors, fonts, radius, space } from '@/constants/theme';
import { fmtDay, fmtLevel, fmtRange, fmtTime } from '@/lib/format';
import { LEVEL_WINDOW, matchRange, MAX_LEVEL } from '@/lib/level';
import { useStore } from '@/lib/store';
import { MatchKind } from '@/lib/types';
import { tr } from '@/lib/i18n';
import { cityLabel } from '@/lib/cities';

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
  const { communityId } = useLocalSearchParams<{ communityId?: string }>();
  const { me, courts, createMatch, communities } = useStore();
  const community = communities.find((c) => c.id === communityId);
  const slots = useMemo(() => nextSlots(), []);
  const [courtId, setCourtId] = useState(courts.find((c) => c.city === me.city)?.id ?? courts[0]?.id);
  const [slot, setSlot] = useState(slots[0]);
  const [kind, setKind] = useState<MatchKind>('friendly');
  const [busy, setBusy] = useState(false);

  const { minLevel, maxLevel } = matchRange(me.level);
  const sorted = [...courts].sort((a, b) => Number(b.city === me.city) - Number(a.city === me.city));

  const submit = async () => {
    if (!courtId) return;
    setBusy(true);
    const id = await createMatch({ courtId, startsAt: slot.toISOString(), kind, minLevel, maxLevel, communityId: community?.id });
    setBusy(false);
    if (id) router.replace({ pathname: '/match/[id]', params: { id } });
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen>
        <Row style={{ justifyContent: 'space-between' }}>
          <Heading en="New match" ar={tr('افتح مباراة', 'Open a match')} size="xl" />
          <Pressable onPress={() => router.back()} style={s.close} accessibilityLabel={tr('إغلاق', 'Close')}>
            <Icon name="close" size={20} />
          </Pressable>
        </Row>

        {community && <T style={{ color: colors.blue, fontFamily: fonts.bold }}>{tr(`مباراة ضمن ${community.name}`, `${community.name} match`)}</T>}

        <T variant="label">{tr('الملعب', 'Court')}</T>
        {courts.length === 0 && <T variant="muted">{tr('ما فيه ملاعب مضافة بعد.', 'No courts added yet.')}</T>}
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
                  <T variant="small">{cityLabel(c.city)}</T>
                </Row>
              </Pressable>
            );
          })}
        </View>

        <T variant="label">{tr('الوقت', 'Time')}</T>
        <Row style={{ flexWrap: 'wrap' }}>
          {slots.map((d) => (
            <Chip key={d.toISOString()} label={`${fmtDay(d.toISOString())} ${fmtTime(d.toISOString())}`} active={d === slot} onPress={() => setSlot(d)} />
          ))}
        </Row>

        <T variant="label">{tr('نوع المباراة', 'Match type')}</T>
        <View style={s.segment}>
          {(['friendly', 'competitive'] as MatchKind[]).map((k) => (
            <Pressable key={k} onPress={() => setKind(k)} style={[s.segItem, kind === k && s.segActive]}>
              <T style={[s.segText, kind === k && { color: colors.accentInk }]}>{k === 'friendly' ? tr('ودية', 'Friendly') : tr('تنافسية', 'Competitive')}</T>
              <T style={[s.segSub, kind === k && { color: colors.accentInk }]}>{k === 'friendly' ? tr('للمتعة', 'Just for fun') : tr('تعدّل المستوى', 'Affects level')}</T>
            </Pressable>
          ))}
        </View>

        <T variant="label">{tr('مين يقدر ينضم؟', 'Who can join?')}</T>
        <Board style={{ gap: 10 }}>
        <View style={s.range}>
          <View style={[s.rangeFill, { [scaleStart()]: `${(minLevel / MAX_LEVEL) * 100}%`, width: `${((maxLevel - minLevel) / MAX_LEVEL) * 100}%` }]} />
          <View style={[s.rangeMe, { [scaleStart()]: `${(me.level / MAX_LEVEL) * 100}%`, marginHorizontal: -2 }]} />
        </View>
        <Row style={{ justifyContent: 'space-between' }}>
          <T style={{ fontFamily: fonts.extra, fontSize: 18, lineHeight: 32 }}>
            {fmtRange(minLevel, maxLevel)}
          </T>
          <T variant="small" style={{ color: colors.inkMuted }}>
            {tr('مستواك', 'Your level')} ± {fmtLevel(LEVEL_WINDOW)}
          </T>
        </Row>
        <T variant="small" style={{ color: colors.inkMuted }}>
          {tr('في Rally تلعب بس مع ناس بمستواك، عشان تكون المباراة متكافئة.', 'On Rally you only play with people at your level, so every match is balanced.')}
        </T>
        </Board>

        <View style={{ marginTop: space(2) }}>
          <Button title={busy ? '...' : tr('افتح المباراة', 'Open match')} icon="bolt" disabled={busy || !courtId} onPress={submit} />
        </View>
      </Screen>
    </View>
  );
}

const s = StyleSheet.create({
  close: { width: 44, height: 44, borderRadius: radius.sm, borderWidth: 2, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space(3) },
  court: { width: '47%', flexGrow: 1, borderRadius: radius.sm, borderWidth: 1, borderColor: 'rgba(255,255,255,0.45)', padding: space(3), gap: 4, backgroundColor: 'rgba(190,225,255,0.12)' },
  courtActive: { borderColor: colors.blue, backgroundColor: '#0E1838' },
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
