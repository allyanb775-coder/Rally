import { updatedLevel } from './level.ts';
import { MATCH_SIZE, type Match, type Player, type Team } from './types.ts';

/**
 * Teams follow the court drawing: in join order, the 1st and 3rd players are team 1,
 * the 2nd and 4th team 2. The database assigns teams the same way.
 */
export function teamOf(match: Pick<Match, 'playerIds'>, playerId: string): Team | null {
  const i = match.playerIds.indexOf(playerId);
  return i < 0 ? null : i % 2 === 0 ? 1 : 2;
}

export function teams(match: Pick<Match, 'playerIds'>): Record<Team, string[]> {
  return { 1: match.playerIds.filter((_, i) => i % 2 === 0), 2: match.playerIds.filter((_, i) => i % 2 === 1) };
}

/** A competitive match with four players that has started and has no confirmed result yet. */
export function needsResult(match: Match, now = new Date()): boolean {
  return (
    match.kind === 'competitive' &&
    match.playerIds.length === MATCH_SIZE &&
    new Date(match.startsAt) <= now &&
    match.result?.status !== 'confirmed'
  );
}

/** Each player's level before and after, if `winningTeam` won. Mirrors confirm_result in the database. */
export function levelChanges(
  match: Pick<Match, 'playerIds'>,
  players: Record<string, Pick<Player, 'level' | 'matchesPlayed'>>,
  winningTeam: Team,
): Record<string, { before: number; after: number; won: boolean }> {
  const t = teams(match);
  const avg = (ids: string[]) => ids.reduce((s, id) => s + (players[id]?.level ?? 0), 0) / ids.length;
  const avgs: Record<Team, number> = { 1: avg(t[1]), 2: avg(t[2]) };
  const out: Record<string, { before: number; after: number; won: boolean }> = {};
  for (const team of [1, 2] as Team[]) {
    for (const id of t[team]) {
      const p = players[id];
      if (!p) continue;
      const won = team === winningTeam;
      out[id] = { before: p.level, after: updatedLevel(p, avgs[team], avgs[team === 1 ? 2 : 1], won), won };
    }
  }
  return out;
}

/** "6-4 3-6 6-2" from up to three [ours, theirs] sets; skips empty sets. */
export function formatScore(sets: [string, string][]): string {
  return sets
    .filter(([a, b]) => a.trim() !== '' && b.trim() !== '')
    .map(([a, b]) => `${parseInt(a, 10)}-${parseInt(b, 10)}`)
    .join(' ');
}

/** Games per set for [team 1, team 2]; null = set not played. */
export type SetScore = [number | null, number | null];

/**
 * Who won from the sets (more sets won; a set needs both numbers and no tie).
 * Returns null while undecided, e.g. 1–1 in sets or nothing entered.
 */
export function winnerFromSets(sets: SetScore[]): Team | null {
  let w1 = 0;
  let w2 = 0;
  for (const [a, b] of sets) {
    if (a === null || b === null || a === b) continue;
    if (a > b) w1++;
    else w2++;
  }
  return w1 === w2 ? null : w1 > w2 ? 1 : 2;
}

/** Stored score is written from the winner's side ("6-4 3-6 6-2"). */
export function scoreFromSets(sets: SetScore[], winner: Team): string {
  return sets
    .filter(([a, b]) => a !== null && b !== null)
    .map(([a, b]) => (winner === 1 ? `${a}-${b}` : `${b}-${a}`))
    .join(' ');
}

/** Back to [team 1, team 2] per set, for the scoreboard. */
export function setsFromScore(score: string, winner: Team): SetScore[] {
  return score
    .split(/\s+/)
    .filter(Boolean)
    .map((s) => s.split('-').map((n) => parseInt(n, 10)))
    .filter(([a, b]) => Number.isFinite(a) && Number.isFinite(b))
    .map(([w, l]) => (winner === 1 ? [w, l] : [l, w]) as SetScore);
}

/** Next value when the scorer taps a set box: blank → 0 → 1 … 7 → blank. */
export const nextGames = (n: number | null): number | null => (n === null ? 0 : n >= 7 ? null : n + 1);
