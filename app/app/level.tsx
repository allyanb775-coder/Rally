import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LevelMeter } from '@/components/LevelMeter';
import { Bar, Button, Row, Screen, T } from '@/components/ui';
import { colors, fonts, radius, space } from '@/constants/theme';
import { fmtNum } from '@/lib/format';
import { levelFromAnswers, levelQuestions } from '@/lib/level';
import { useStore } from '@/lib/store';
import { tr } from '@/lib/i18n';

/** One question per step, then the resulting level. */
export default function LevelQuiz() {
  const { setMyLevel } = useStore();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [step, setStep] = useState(0);
  const total = levelQuestions.length;
  const done = step >= total;
  const q = levelQuestions[Math.min(step, total - 1)];
  const level = levelFromAnswers(answers);

  const pick = (i: number) => {
    setAnswers((a) => ({ ...a, [q.id]: i }));
    setTimeout(() => setStep((s) => s + 1), 180);
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen>
        <Row style={{ justifyContent: 'space-between' }}>
          <Pressable onPress={() => (step > 0 ? setStep(step - 1) : router.back())} hitSlop={10}>
            <T style={{ color: colors.muted, fontFamily: fonts.medium }}>{step > 0 ? tr('السابق', 'Back') : tr('إلغاء', 'Cancel')}</T>
          </Pressable>
          <T variant="label">
            {done ? tr('النتيجة', 'Result') : `${fmtNum(step + 1)} ${tr('من', 'of')} ${fmtNum(total)}`}
          </T>
        </Row>
        <Bar value={done ? 1 : step / total} />

        {!done ? (
          <View style={{ gap: space(3), marginTop: space(4) }}>
            <T variant="h1">{q.text}</T>
            {q.options.map((o, i) => {
              const active = answers[q.id] === i;
              return (
                <Pressable key={o.label} onPress={() => pick(i)} style={({ pressed }) => [s.opt, active && s.optActive, pressed && { transform: [{ scale: 0.98 }] }]}>
                  <View style={[s.radio, active && s.radioActive]} />
                  <T style={[s.optText, active && { color: colors.accentInk }]}>{o.label}</T>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={{ gap: space(4), marginTop: space(4) }}>
            <T variant="h1">{tr('هذا مستواك المبدئي', 'Your starting level')}</T>
            <LevelMeter level={level} />
            <T variant="muted">{tr('يتعدل تلقائياً بعد كل مباراة تنافسية. الاستبيان يوصلك لـ 5.5 كحد أعلى، والباقي تكسبه في الملعب.', 'It updates automatically after every competitive match. The questionnaire tops out at 5.5; the rest you earn on court.')}</T>
            <Button
              title={tr('احفظ وابدأ', 'Save and start')}
              icon="check"
              onPress={async () => {
                await setMyLevel(level);
                router.back();
              }}
            />
          </View>
        )}
      </Screen>
    </View>
  );
}

const s = StyleSheet.create({
  opt: { flexDirection: 'row', alignItems: 'center', gap: space(3), minHeight: 64, paddingHorizontal: space(4), borderRadius: radius.sm, borderWidth: 2, borderColor: colors.line },
  optActive: { backgroundColor: colors.led, borderColor: colors.led },
  optText: { fontFamily: fonts.bold, fontSize: 16, flexShrink: 1 },
  radio: { width: 20, height: 20, borderRadius: 2, borderWidth: 2, borderColor: colors.text },
  radioActive: { borderColor: colors.accentInk, backgroundColor: colors.accentInk },
});
