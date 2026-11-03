export const MIN_LEVEL = 0;
export const MAX_LEVEL = 7;

export const clampLevel = (n: number) =>
  Math.round(Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, n)) * 100) / 100;

export type Question = {
  id: string;
  text: string;
  options: { label: string; points: number }[];
};

/** Short onboarding questionnaire. Each answer adds points; the total maps to 0–7. */
export const levelQuestions: Question[] = [
  {
    id: 'experience',
    text: 'كم صار لك تلعب بادل؟',
    options: [
      { label: 'أول مرة / أقل من ٣ شهور', points: 0 },
      { label: '٣ شهور إلى سنة', points: 1 },
      { label: 'سنة إلى ٣ سنوات', points: 2 },
      { label: 'أكثر من ٣ سنوات', points: 3 },
    ],
  },
  {
    id: 'frequency',
    text: 'كم مرة تلعب بالأسبوع؟',
    options: [
      { label: 'نادراً', points: 0 },
      { label: 'مرة', points: 0.5 },
      { label: '٢–٣ مرات', points: 1 },
      { label: 'أكثر من ٣', points: 1.5 },
    ],
  },
  {
    id: 'walls',
    text: 'كيف تتعامل مع الكرة بعد ما تضرب الجدار؟',
    options: [
      { label: 'أتجنبها غالباً', points: 0 },
      { label: 'أرجعها أحياناً', points: 0.5 },
      { label: 'أرجعها بثبات', points: 1 },
      { label: 'أستخدمها للهجوم', points: 1.5 },
    ],
  },
  {
    id: 'shots',
    text: 'وش الضربات اللي تتقنها؟',
    options: [
      { label: 'الأساسيات فقط', points: 0 },
      { label: 'فولي ولوب', points: 0.5 },
      { label: 'بانديخا', points: 1 },
      { label: 'فيبورا وسماش خارج الملعب', points: 1.5 },
    ],
  },
  {
    id: 'competition',
    text: 'شاركت في بطولات؟',
    options: [
      { label: 'لا', points: 0 },
      { label: 'بطولات ودية', points: 0.25 },
      { label: 'بطولات محلية بانتظام', points: 0.5 },
    ],
  },
];

const MAX_POINTS = levelQuestions.reduce(
  (sum, q) => sum + Math.max(...q.options.map((o) => o.points)),
  0,
);

/** answers: questionId -> option index */
export function levelFromAnswers(answers: Record<string, number>): number {
  let points = 0;
  for (const q of levelQuestions) {
    const idx = answers[q.id];
    if (idx !== undefined) points += q.options[idx]?.points ?? 0;
  }
  // Questionnaire caps at 5.5: higher levels must be earned through matches.
  return clampLevel((points / MAX_POINTS) * 5.5);
}

/**
 * Elo-style update after a competitive doubles match.
 * Team level = average of its two players. Expected score uses a 0–7 scale
 * where a 1-level gap ≈ 76% win chance. K shrinks as the player gains experience.
 */
export function updatedLevel(
  player: { level: number; matchesPlayed: number },
  teamAvg: number,
  opponentAvg: number,
  won: boolean,
): number {
  const expected = 1 / (1 + Math.pow(10, (opponentAvg - teamAvg) / 2));
  const k = player.matchesPlayed < 10 ? 0.3 : player.matchesPlayed < 30 ? 0.2 : 0.12;
  return clampLevel(player.level + k * ((won ? 1 : 0) - expected));
}

export function levelLabel(level: number): string {
  if (level < 1.5) return 'مبتدئ';
  if (level < 3) return 'متوسط';
  if (level < 4.5) return 'متقدم';
  if (level < 6) return 'محترف';
  return 'نخبة';
}
