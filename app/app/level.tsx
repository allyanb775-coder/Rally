import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable } from 'react-native';
import { Button, Card, LevelBadge, Row, Screen, T } from '@/components/ui';
import { colors } from '@/constants/theme';
import { fmtNum } from '@/lib/format';
import { levelFromAnswers, levelLabel, levelQuestions } from '@/lib/level';
import { useStore } from '@/lib/store';

export default function LevelQuiz() {
  const { setMyLevel } = useStore();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const done = levelQuestions.every((q) => answers[q.id] !== undefined);
  const level = levelFromAnswers(answers);

  return (
    <Screen>
      <T variant="muted">مستواك من ٠ إلى ٧، ويتعدل تلقائياً بعد كل مباراة تنافسية.</T>
      {levelQuestions.map((q, qi) => (
        <Card key={q.id}>
          <T variant="h2">
            {fmtNum(qi + 1)}. {q.text}
          </T>
          {q.options.map((o, i) => {
            const active = answers[q.id] === i;
            return (
              <Pressable
                key={o.label}
                onPress={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                style={{ padding: 12, borderRadius: 10, borderWidth: 1, borderColor: active ? colors.accent : colors.border, backgroundColor: active ? colors.surfaceAlt : 'transparent' }}>
                <T>{o.label}</T>
              </Pressable>
            );
          })}
        </Card>
      ))}
      {done && (
        <Card>
          <Row style={{ justifyContent: 'space-between' }}>
            <T variant="h2">مستواك المبدئي: {levelLabel(level)}</T>
            <LevelBadge level={level} />
          </Row>
        </Card>
      )}
      <Button
        title="احفظ مستواي"
        disabled={!done}
        onPress={() => {
          setMyLevel(level);
          router.back();
        }}
      />
    </Screen>
  );
}
