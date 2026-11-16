import { tr } from './i18n.ts';
export const MIN_LEVEL = 0;
export const MAX_LEVEL = 7;

/** You only play with people at your level: a match accepts the host's level ± this. */
export const LEVEL_WINDOW = 0.5;

/** The level range a match opened by a player at `level` accepts. */
export function matchRange(level: number): { minLevel: number; maxLevel: number } {
  return { minLevel: clampLevel(level - LEVEL_WINDOW), maxLevel: clampLevel(level + LEVEL_WINDOW) };
}

/** A small level gap is fine: you may join a match up to this far outside its range. */
export const JOIN_GRACE = 0.25;

/** Whether a player at `level` may join a match with this range (range plus the small grace). */
export function levelFits(level: number, range: { minLevel: number; maxLevel: number }): boolean {
  return level >= range.minLevel - JOIN_GRACE - 1e-9 && level <= range.maxLevel + JOIN_GRACE + 1e-9;
}

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
    get text() { return tr('كم صار لك تلعب بادل؟', 'How long have you played padel?'); },
    options: [
      { get label() { return tr('أول مرة / أقل من 3 شهور', 'First time / under 3 months'); }, points: 0 },
      { get label() { return tr('3 شهور إلى سنة', '3 months to a year'); }, points: 1 },
      { get label() { return tr('سنة إلى 3 سنوات', '1 to 3 years'); }, points: 2 },
      { get label() { return tr('أكثر من 3 سنوات', 'More than 3 years'); }, points: 3 },
    ],
  },
  {
    id: 'frequency',
    get text() { return tr('كم مرة تلعب بالأسبوع؟', 'How often do you play per week?'); },
    options: [
      { get label() { return tr('نادراً', 'Rarely'); }, points: 0 },
      { get label() { return tr('مرة', 'Once'); }, points: 0.5 },
      { get label() { return tr('2–3 مرات', '2–3 times'); }, points: 1 },
      { get label() { return tr('أكثر من 3', 'More than 3'); }, points: 1.5 },
    ],
  },
  {
    id: 'walls',
    get text() { return tr('كيف تتعامل مع الكرة بعد ما تضرب الجدار؟', 'How do you handle the ball off the glass?'); },
    options: [
      { get label() { return tr('أتجنبها غالباً', 'I usually avoid it'); }, points: 0 },
      { get label() { return tr('أرجعها أحياناً', 'I sometimes return it'); }, points: 0.5 },
      { get label() { return tr('أرجعها بثبات', 'I return it consistently'); }, points: 1 },
      { get label() { return tr('أستخدمها للهجوم', 'I use it to attack'); }, points: 1.5 },
    ],
  },
  {
    id: 'shots',
    get text() { return tr('وش الضربات اللي تتقنها؟', 'Which shots have you mastered?'); },
    options: [
      { get label() { return tr('الأساسيات فقط', 'Basics only'); }, points: 0 },
      { get label() { return tr('فولي ولوب', 'Volley and lob'); }, points: 0.5 },
      { get label() { return tr('بانديخا', 'Bandeja'); }, points: 1 },
      { get label() { return tr('فيبورا وسماش خارج الملعب', 'Víbora and smash out of the court'); }, points: 1.5 },
    ],
  },
  {
    id: 'competition',
    get text() { return tr('شاركت في بطولات؟', 'Have you played tournaments?'); },
    options: [
      { get label() { return tr('لا', 'No'); }, points: 0 },
      { get label() { return tr('بطولات ودية', 'Friendly tournaments'); }, points: 0.25 },
      { get label() { return tr('بطولات محلية بانتظام', 'Local tournaments regularly'); }, points: 0.5 },
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
  if (level < 1.5) return tr('مبتدئ', 'Beginner');
  if (level < 3) return tr('متوسط', 'Intermediate');
  if (level < 4.5) return tr('متقدم', 'Advanced');
  if (level < 6) return tr('محترف', 'Pro');
  return tr('نخبة', 'Elite');
}
